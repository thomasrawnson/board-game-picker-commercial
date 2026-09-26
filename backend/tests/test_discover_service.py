from models.game import Game
from models.game_play_stats import GamePlayStats
from bgg.client import BGGSourceUnavailableError
from services.discover_service import DiscoverService
from services.discover_sources import DiscoverCandidate, DiscoverCandidateProvider


class FakeRepository:
    def __init__(self, owned=True):
        self.owned = owned

    def get_owned_by_user(self, user_id):
        return [
            Game(
                bgg_id=99,
                name="Owned",
                categories=["Strategy"],
                mechanics=["Deck Building"],
            )
        ] if self.owned else []

    def get_wishlisted_bgg_ids(self, user_id):
        return {1}


class FakePlayRepository:
    def __init__(
        self,
        player_count=2,
        play_time=60,
        play_count=4,
        player_count_source="history",
        play_time_source="history",
    ):
        self.play_count = play_count
        self.profile = {
            "typical_player_count": player_count,
            "typical_play_time": play_time,
            "player_count_source": player_count_source,
            "play_time_source": play_time_source,
        }

    def get_game_play_stats(self):
        return {99: GamePlayStats(99, self.play_count, None)}

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
        assert owned_bgg_ids in ({99}, set())
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


def make_service(play_repository=None, repository=None):
    return DiscoverService(
        repository=repository or FakeRepository(),
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


def test_for_you_without_history_uses_a_matching_collection_signal():
    result = make_service(
        FakePlayRepository(player_count=None, play_time=None, play_count=0)
    ).get_recommendation_result(mode="for_you")

    assert result.personalisation == "personalised"
    assert result.signals == ("collection",)
    assert result.recommendations
    assert all(item["reasons"] for item in result.recommendations)
    assert any(
        "BoardGameGeek" in reason
        for item in result.recommendations
        for reason in item["reasons"]
    )


def test_for_you_empty_collection_uses_only_source_signals():
    result = make_service(
        FakePlayRepository(player_count=None, play_time=None, play_count=0),
        repository=FakeRepository(owned=False),
    ).get_recommendation_result(mode="for_you")

    assert result.personalisation == "popular_fallback"
    results = result.recommendations
    assert results
    assert all(item["section"] == "Popular starting points" for item in results)
    assert all(
        any("BoardGameGeek" in reason for reason in item["reasons"])
        for item in results
    )
    assert not any(
        "your shelf" in reason.lower()
        for item in results
        for reason in item["reasons"]
    )


def test_for_you_single_play_keeps_truthful_collection_and_session_reasons():
    result = make_service(
        FakePlayRepository(player_count=2, play_time=60, play_count=1)
    ).get_recommendation_result(mode="for_you")

    assert result.personalisation == "personalised"
    assert result.signals == ("collection", "play_history")
    results = result.recommendations
    first = next(item for item in results if item["game"].bgg_id == 1)
    assert "Matches Strategy games on your shelf" in first["reasons"]
    assert "Fits your usual 60-minute session" in first["reasons"]
    assert "Great at 2 players" in first["reasons"]


def test_for_you_explicit_preferences_are_reported_as_the_used_signal():
    result = make_service(FakePlayRepository(
        player_count=2,
        play_time=60,
        play_count=0,
        player_count_source="preference",
        play_time_source="preference",
    )).get_recommendation_result(mode="for_you")

    assert result.personalisation == "personalised"
    assert result.signals == ("collection", "preferences")


def test_for_you_stays_personalised_with_hot_only_source_fallback():
    class HotSource:
        name = "hot"

        def get_candidates(self):
            return [DiscoverCandidate(1, {"hot"})]

    class UnavailableRankedSource:
        name = "ranked"

        def get_candidates(self):
            raise BGGSourceUnavailableError(source="ranked", status_code=403)

    service = DiscoverService(
        repository=FakeRepository(),
        play_repository=FakePlayRepository(),
        bgg_client=FakeBGGClient(),
        candidate_provider=DiscoverCandidateProvider([
            HotSource(),
            UnavailableRankedSource(),
        ]),
        user_id=7,
    )

    result = service.get_recommendation_result(mode="for_you")

    assert result.personalisation == "personalised"
    assert result.recommendations
    assert result.recommendations[0]["reasons"][-1] == "Currently hot on BoardGameGeek"


def test_for_you_keeps_ranked_candidates_beyond_top_100():
    results = make_service().get_recommendations(
        mode="for_you",
    )

    assert any(
        item["game"].bgg_id == 5
        and item["source_rank"] == 150
        for item in results
    )
