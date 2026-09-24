from models.game import Game
from models.game_play_stats import GamePlayStats
from services.discover_service import DiscoverService
from services.discover_sources import DiscoverCandidate


class FakeRepository:
    def get_owned_by_user(self, user_id):
        return [
            Game(
                bgg_id=99,
                name="Owned",
                categories=["Strategy"],
                mechanics=["Deck Building"],
            )
        ]

    def get_wishlisted_bgg_ids(self, user_id):
        return {1}


class FakePlayRepository:
    def __init__(self, player_count=2, play_time=60):
        self.profile = {
            "typical_player_count": player_count,
            "typical_play_time": play_time,
        }

    def get_game_play_stats(self):
        return {99: GamePlayStats(99, 4, None)}

    def get_discover_profile(self):
        return self.profile


class FakeCandidateProvider:
    candidates = [
        DiscoverCandidate(1, {"hot", "ranked"}, 1),
        DiscoverCandidate(2, {"ranked"}, 2),
        DiscoverCandidate(3, {"hot"}),
        DiscoverCandidate(4, {"hot"}),
        DiscoverCandidate(5, {"ranked"}, 150),
    ]

    def get_candidates(
        self,
        owned_bgg_ids,
        source_names=None,
        max_ranked_position=None,
    ):
        assert owned_bgg_ids == {99}
        return [
            candidate
            for candidate in self.candidates
            if (
                source_names is None
                or candidate.sources & source_names
            )
            and (
                max_ranked_position is None
                or (
                    type(candidate.ranked_position)
                    is int
                    and 1
                    <= candidate.ranked_position
                    <= max_ranked_position
                )
            )
        ]


class FakeBGGClient:
    def get_games(self, bgg_ids):
        items = []
        for bgg_id in bgg_ids:
            category = (
                '<link type="boardgamecategory" value="Strategy"/>'
                if bgg_id == 1
                else ""
            )
            mechanic = (
                '<link type="boardgamemechanic" value="Deck Building"/>'
                if bgg_id == 1
                else ""
            )
            not_recommended = 15 if bgg_id == 4 else 4
            max_players = 4 if bgg_id != 2 else 1
            items.append(f"""
                <item type="boardgame" id="{bgg_id}">
                    <name type="primary" value="Game {bgg_id}"/>
                    <minplayers value="1"/>
                    <maxplayers value="{max_players}"/>
                    <maxplaytime value="60"/>
                    <statistics><ratings>
                        <average value="7"/>
                        <averageweight value="2.5"/>
                    </ratings></statistics>
                    <poll name="suggested_numplayers">
                        <results numplayers="2">
                            <result value="Best" numvotes="20"/>
                            <result value="Recommended" numvotes="10"/>
                            <result value="Not Recommended" numvotes="{not_recommended}"/>
                        </results>
                    </poll>
                    {category}{mechanic}
                </item>
            """)
        return "<items>" + "".join(items) + "</items>"


def make_service(play_repository=None):
    return DiscoverService(
        repository=FakeRepository(),
        play_repository=play_repository or FakePlayRepository(),
        bgg_client=FakeBGGClient(),
        candidate_provider=FakeCandidateProvider(),
        user_id=7,
    )


def test_hot_and_top100_keep_sources_order_and_wishlist_state():
    hot = make_service().get_recommendations(mode="hot")
    ranked = make_service().get_recommendations(mode="top100")

    assert [item["game"].bgg_id for item in hot] == [1, 3, 4]
    assert [item["game"].bgg_id for item in ranked] == [1, 2]
    assert hot[0]["wishlisted"] is True
    assert ranked[0]["source_rank"] == 1
    assert hot[0]["reasons"] == ["Currently hot on BoardGameGeek"]


def test_for_you_uses_real_player_time_and_collection_signals():
    results = make_service().get_recommendations(mode="for_you")

    assert all(item["game"].bgg_id != 2 for item in results)
    assert all(item["game"].bgg_id != 4 for item in results)
    first = next(item for item in results if item["game"].bgg_id == 1)
    assert "Great at 2 players" in first["reasons"]
    assert "Fits your usual 60-minute session" in first["reasons"]
    assert "Matches Strategy games on your shelf" in first["reasons"]
    assert first["section"] == "Great at your usual player count"


def test_for_you_new_user_falls_back_to_popular_candidates():
    results = make_service(
        FakePlayRepository(player_count=None, play_time=None)
    ).get_recommendations(mode="for_you")

    assert results
    assert all(item["reasons"] for item in results)
    assert any("BoardGameGeek" in reason for item in results for reason in item["reasons"])


def test_for_you_keeps_ranked_candidates_beyond_top_100():
    results = make_service().get_recommendations(
        mode="for_you",
    )

    assert any(
        item["game"].bgg_id == 5
        and item["source_rank"] == 150
        for item in results
    )
