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


def test_ranked_failure_falls_back_to_hot(caplog):
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
