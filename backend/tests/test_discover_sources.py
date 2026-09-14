import logging

import httpx

from bgg.client import BGGClient
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
        HotDiscoverSource(client),
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
