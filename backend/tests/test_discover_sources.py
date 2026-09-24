import logging

import httpx
import pytest

from bgg.client import BGGClient
from bgg.client import BGGSourceUnavailableError
from services.discover_sources import (
    DiscoverCandidate,
    DiscoverCandidateProvider,
    HotDiscoverSource,
    RankedCandidateCache,
    RankedDiscoverSource,
)


class FakeSource:
    def __init__(self, name, candidates):
        self.name = name
        self.candidates = candidates

    def get_candidates(self):
        return self.candidates


def candidate(bgg_id, source, rank=None):
    return DiscoverCandidate(
        bgg_id=bgg_id,
        sources={source},
        ranked_position=rank,
    )


def test_sources_are_merged_and_deduplicated():
    provider = DiscoverCandidateProvider([
        FakeSource(
            "hot",
            [candidate(1, "hot"), candidate(2, "hot")],
        ),
        FakeSource(
            "ranked",
            [
                candidate(2, "ranked", 1),
                candidate(3, "ranked", 2),
            ],
        ),
    ])

    results = provider.get_candidates(set())

    assert [item.bgg_id for item in results] == [1, 2, 3]
    duplicate = next(
        item for item in results if item.bgg_id == 2
    )
    assert duplicate.sources == {"hot", "ranked"}
    assert duplicate.ranked_position == 1


def test_owned_games_are_excluded_from_every_source():
    provider = DiscoverCandidateProvider([
        FakeSource("hot", [candidate(1, "hot")]),
        FakeSource(
            "ranked",
            [candidate(1, "ranked", 1), candidate(2, "ranked", 2)],
        ),
    ])

    results = provider.get_candidates({1})

    assert [item.bgg_id for item in results] == [2]


def test_unexpected_ranked_failure_falls_back_with_traceback(
    caplog,
):
    class InvalidRankedClient:
        def get_ranked_games_page(self, page):
            return "<html>BGG page changed</html>"

    provider = DiscoverCandidateProvider([
        FakeSource("hot", [candidate(1, "hot")]),
        RankedDiscoverSource(
            InvalidRankedClient(),
            cache=RankedCandidateCache(),
        ),
    ])

    results = provider.get_candidates(set())

    assert [item.bgg_id for item in results] == [1]
    assert "discover_source_failed source=ranked" in caplog.text
    failure_record = next(
        record
        for record in caplog.records
        if "discover_source_failed" in record.message
    )
    assert failure_record.exc_info is not None


def test_ranked_403_falls_back_and_enters_cooldown(
    monkeypatch,
    caplog,
):
    now = [100.0]
    ranked_calls = []

    def mock_get(
        url,
        params,
        headers,
        timeout,
    ):
        request = httpx.Request(
            "GET",
            url,
        )

        if url.endswith("/hot"):
            return httpx.Response(
                200,
                request=request,
                text=(
                    "<items>"
                    "<item id='7'/>"
                    "<item id='8'/>"
                    "</items>"
                ),
            )

        ranked_calls.append(params["page"])
        return httpx.Response(
            403,
            request=request,
        )

    monkeypatch.setattr(
        httpx,
        "get",
        mock_get,
    )
    caplog.set_level(
        logging.WARNING,
        logger="boardgamepicker.discover",
    )

    client = BGGClient()
    cache = RankedCandidateCache(
        unavailable_cooldown_seconds=60,
        clock=lambda: now[0],
    )
    provider = DiscoverCandidateProvider([
        HotDiscoverSource(
            client,
            cache=RankedCandidateCache(
                unavailable_cooldown_seconds=60,
                clock=lambda: now[0],
            ),
        ),
        RankedDiscoverSource(
            client,
            cache=cache,
        ),
    ])

    first = provider.get_candidates(set())
    second = provider.get_candidates(set())

    assert [item.bgg_id for item in first] == [7, 8]
    assert [item.bgg_id for item in second] == [7, 8]
    assert ranked_calls == [1]

    warning_records = [
        record
        for record in caplog.records
        if (
            "discover_source_unavailable"
            in record.message
        )
    ]
    assert len(warning_records) == 1
    assert (
        "source=ranked status=403 "
        "fallback=continuing_with_available_sources"
        in warning_records[0].message
    )
    assert warning_records[0].exc_info is None

    now[0] += 61
    provider.get_candidates(set())

    assert ranked_calls == [1, 1]


def test_hot_502_uses_stale_cache_during_cooldown_and_recovers():
    now = [100.0]

    class RecoveringHotClient:
        def __init__(self):
            self.calls = 0

        def get_hot_games(self):
            self.calls += 1

            if self.calls == 1:
                return "<items><item id='7'/></items>"

            if self.calls == 2:
                raise BGGSourceUnavailableError(
                    source="hot",
                    status_code=502,
                )

            return "<items><item id='8'/></items>"

    client = RecoveringHotClient()
    source = HotDiscoverSource(
        client,
        cache=RankedCandidateCache(
            ttl_seconds=10,
            unavailable_cooldown_seconds=60,
            clock=lambda: now[0],
        ),
    )

    first = source.get_candidates()
    now[0] += 11
    stale = source.get_candidates()
    during_cooldown = source.get_candidates()

    assert [item.bgg_id for item in first] == [7]
    assert [item.bgg_id for item in stale] == [7]
    assert [item.bgg_id for item in during_cooldown] == [7]
    assert client.calls == 2

    now[0] += 61
    recovered = source.get_candidates()

    assert [item.bgg_id for item in recovered] == [8]
    assert client.calls == 3


def test_single_unavailable_source_without_cache_is_not_empty_success():
    class UnavailableHotClient:
        def __init__(self):
            self.calls = 0

        def get_hot_games(self):
            self.calls += 1
            raise BGGSourceUnavailableError(
                source="hot",
                status_code=502,
            )

    client = UnavailableHotClient()
    provider = DiscoverCandidateProvider([
        HotDiscoverSource(
            client,
            cache=RankedCandidateCache(),
        ),
    ])

    with pytest.raises(BGGSourceUnavailableError) as error:
        provider.get_candidates(
            set(),
            source_names={"hot"},
        )

    assert error.value.status_code == 502

    with pytest.raises(BGGSourceUnavailableError) as cooldown_error:
        provider.get_candidates(
            set(),
            source_names={"hot"},
        )

    assert cooldown_error.value.cooldown_active is True
    assert client.calls == 1


def test_ranked_candidates_are_cached():
    class FakeClient:
        def __init__(self):
            self.calls = 0

        def get_ranked_games_page(self, page):
            self.calls += 1
            return (
                f'<a href="/boardgame/{page}/game">Game</a>'
            )

    client = FakeClient()
    source = RankedDiscoverSource(
        client,
        cache=RankedCandidateCache(ttl_seconds=3600),
    )

    first = source.get_candidates()
    second = source.get_candidates()

    assert client.calls == 5
    assert [item.bgg_id for item in first] == [1, 2, 3, 4, 5]
    assert [item.bgg_id for item in second] == [1, 2, 3, 4, 5]


def test_top100_boundary_applies_to_fresh_warm_and_stale_candidates():
    now = [100.0]

    class RankedClient:
        def __init__(self):
            self.calls = 0
            self.unavailable = False

        def get_ranked_games_page(self, page):
            self.calls += 1

            if self.unavailable:
                raise BGGSourceUnavailableError(
                    source="ranked",
                    status_code=502,
                )

            first_id = (page - 1) * 100 + 1
            return "".join(
                (
                    f'<a href="/boardgame/{bgg_id}/game">'
                    "Game</a>"
                )
                for bgg_id in range(
                    first_id,
                    first_id + 100,
                )
            )

    client = RankedClient()
    source = RankedDiscoverSource(
        client,
        cache=RankedCandidateCache(
            ttl_seconds=10,
            unavailable_cooldown_seconds=60,
            clock=lambda: now[0],
        ),
    )
    provider = DiscoverCandidateProvider([
        source,
    ])

    fresh = provider.get_candidates(
        set(),
        source_names={"ranked"},
        max_ranked_position=100,
    )
    warm = provider.get_candidates(
        set(),
        source_names={"ranked"},
        max_ranked_position=100,
    )

    assert fresh[-1].ranked_position == 100
    assert warm[-1].ranked_position == 100
    assert len(fresh) == 100
    assert all(
        item.ranked_position != 101
        for item in fresh
    )
    assert client.calls == 5

    after_ownership = provider.get_candidates(
        {1},
        source_names={"ranked"},
        max_ranked_position=100,
    )

    assert after_ownership[0].bgg_id == 2
    assert after_ownership[0].ranked_position == 2

    now[0] += 11
    client.unavailable = True
    stale = provider.get_candidates(
        set(),
        source_names={"ranked"},
        max_ranked_position=100,
    )

    assert stale[-1].ranked_position == 100
    assert len(stale) == 100
    assert client.calls == 6

    broader = provider.get_candidates(
        set(),
        source_names={"ranked"},
    )

    assert broader[-1].ranked_position == 500
    assert len(broader) == 500
    assert client.calls == 6

    no_matches = provider.get_candidates(
        set(range(1, 101)),
        source_names={"ranked"},
        max_ranked_position=100,
    )

    assert no_matches == []
    assert client.calls == 6


def test_top100_boundary_preserves_source_rank_and_rejects_invalid_ranks():
    provider = DiscoverCandidateProvider([
        FakeSource(
            "ranked",
            [
                candidate(1, "ranked", 100),
                candidate(2, "ranked", 101),
                candidate(3, "ranked", None),
                candidate(4, "ranked", 0),
                candidate(5, "ranked", -1),
                candidate(6, "ranked", True),
                DiscoverCandidate(
                    bgg_id=7,
                    sources={"ranked"},
                    ranked_position="7",
                ),
            ],
        ),
    ])

    results = provider.get_candidates(
        set(),
        source_names={"ranked"},
        max_ranked_position=100,
    )

    assert [item.bgg_id for item in results] == [1]
    assert results[0].ranked_position == 100
