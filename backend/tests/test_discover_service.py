from models.game import Game
from services.discover_service import DiscoverService
from services.discover_sources import DiscoverCandidate


class FakeRepository:
    def get_owned_by_user(self, user_id):
        return [
            Game(
                bgg_id=99,
                name="Owned",
                categories=["Strategy"],
            )
        ]

    def get_wishlisted_bgg_ids(self, user_id):
        return {1}


class FakeCandidateProvider:
    def get_candidates(self, owned_bgg_ids):
        assert owned_bgg_ids == {99}
        return [
            DiscoverCandidate(
                bgg_id=1,
                sources={"hot", "ranked"},
                ranked_position=1,
            ),
            DiscoverCandidate(
                bgg_id=2,
                sources={"ranked"},
                ranked_position=2,
            ),
        ]


class FakeBGGClient:
    def get_games(self, bgg_ids):
        items = []

        for bgg_id in bgg_ids:
            category = (
                '<link type="boardgamecategory" '
                'value="Strategy"/>'
                if bgg_id == 1
                else ""
            )
            items.append(
                f"""
                <item type="boardgame" id="{bgg_id}">
                    <name type="primary" value="Game {bgg_id}"/>
                    <minplayers value="2"/>
                    <maxplayers value="4"/>
                    <maxplaytime value="60"/>
                    <statistics><ratings>
                        <average value="7"/>
                        <averageweight value="2.5"/>
                    </ratings></statistics>
                    {category}
                </item>
                """
            )

        return "<items>" + "".join(items) + "</items>"


def test_discover_reports_wishlist_and_source_state():
    service = DiscoverService(
        repository=FakeRepository(),
        bgg_client=FakeBGGClient(),
        candidate_provider=FakeCandidateProvider(),
        user_id=7,
    )

    results = service.get_recommendations()
    first = next(
        item for item in results
        if item["game"].bgg_id == 1
    )
    second = next(
        item for item in results
        if item["game"].bgg_id == 2
    )

    assert first["wishlisted"] is True
    assert second["wishlisted"] is False
    assert "Matches your interest in Strategy" in first["reasons"]
    assert (
        "Both currently hot and highly ranked on BoardGameGeek"
        in first["reasons"]
    )
    assert "Highly ranked on BoardGameGeek" in second["reasons"]
    assert first["score"] > second["score"]
