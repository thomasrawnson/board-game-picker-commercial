from models.game import Game
from services.picker_service import PickerCriteria, PickerService
from datetime import datetime, timedelta, timezone
from models.game_play_stats import GamePlayStats


def test_filters_games_by_player_count_and_play_time():
    games = [
        Game(
            bgg_id=1,
            name="Quick Two Player Game",
            min_players=2,
            max_players=4,
            min_play_time=30,
            max_play_time=45,
            owned=True,
        ),
        Game(
            bgg_id=2,
            name="Long Game",
            min_players=2,
            max_players=4,
            min_play_time=90,
            max_play_time=120,
            owned=True,
        ),
        Game(
            bgg_id=3,
            name="Three Player Only",
            min_players=3,
            max_players=3,
            min_play_time=30,
            max_play_time=45,
            owned=True,
        ),
    ]

    service = PickerService()

    matches = service.find_matches(
        games,
        PickerCriteria(
            players=2,
            max_play_time=60,
        ),
    )

    assert [game.bgg_id for game in matches] == [1]


def test_excludes_games_that_are_not_owned():
    games = [
        Game(
            bgg_id=1,
            name="Owned Game",
            min_players=2,
            max_players=4,
            max_play_time=60,
            owned=True,
        ),
        Game(
            bgg_id=2,
            name="Wishlist Game",
            min_players=2,
            max_players=4,
            max_play_time=60,
            owned=False,
        ),
    ]

    service = PickerService()

    matches = service.find_matches(
        games,
        PickerCriteria(
            players=2,
            max_play_time=60,
        ),
    )

    assert [game.bgg_id for game in matches] == [1]


def test_filters_by_complexity_when_available():
    games = [
        Game(
            bgg_id=1,
            name="Medium Game",
            min_players=2,
            max_players=4,
            max_play_time=60,
            complexity=2.5,
            owned=True,
        ),
        Game(
            bgg_id=2,
            name="Heavy Game",
            min_players=2,
            max_players=4,
            max_play_time=60,
            complexity=4.2,
            owned=True,
        ),
    ]

    service = PickerService()

    matches = service.find_matches(
        games,
        PickerCriteria(
            players=2,
            max_play_time=60,
            max_complexity=3.0,
        ),
    )

    assert [game.bgg_id for game in matches] == [1]


def test_missing_complexity_does_not_exclude_game():
    games = [
        Game(
            bgg_id=1,
            name="Unknown Weight Game",
            min_players=2,
            max_players=4,
            max_play_time=60,
            complexity=None,
            owned=True,
        )
    ]

    service = PickerService()

    matches = service.find_matches(
        games,
        PickerCriteria(
            players=2,
            max_play_time=60,
            max_complexity=3.0,
        ),
    )

    assert [game.bgg_id for game in matches] == [1]

def test_rank_matches_returns_highest_score_first():
    games = [
        Game(
            bgg_id=1,
            name="Short Game",
            min_players=2,
            max_players=4,
            max_play_time=30,
            complexity=2.0,
            owned=True,
        ),
        Game(
            bgg_id=2,
            name="Closer Match",
            min_players=2,
            max_players=4,
            max_play_time=55,
            complexity=2.8,
            owned=True,
        ),
    ]

    service = PickerService()

    matches = service.rank_matches(
        games,
        PickerCriteria(
            players=2,
            max_play_time=60,
            max_complexity=3.0,
        ),
    )

    assert matches[0].game.bgg_id == 2
    assert matches[0].score > matches[1].score


def test_rank_match_contains_explanation():
    game = Game(
        bgg_id=1,
        name="Example Game",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
    )

    service = PickerService()

    matches = service.rank_matches(
        [game],
        PickerCriteria(
            players=2,
            max_play_time=90,
            max_complexity=3.0,
        ),
    )

    match = matches[0]

    assert "Supports 2 players" in match.reasons
    assert "Fits within 90 minutes" in match.reasons
    assert "Complexity 2.5 fits preference" in match.reasons


def test_score_never_exceeds_100():
    game = Game(
        bgg_id=1,
        name="Perfect Match",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=3.0,
        owned=True,
    )

    service = PickerService()

    matches = service.rank_matches(
        [game],
        PickerCriteria(
            players=2,
            max_play_time=60,
            max_complexity=3.0,
        ),
    )

    assert matches[0].score <= 100

def test_game_not_played_recently_scores_higher():
    service = PickerService()

    recent_game = Game(
        bgg_id=1,
        name="Recent Game",
        min_players=2,
        max_players=4,
        min_play_time=30,
        max_play_time=60,
        complexity=2.0,
        owned=True,
    )

    neglected_game = Game(
        bgg_id=2,
        name="Neglected Game",
        min_players=2,
        max_players=4,
        min_play_time=30,
        max_play_time=60,
        complexity=2.0,
        owned=True,
    )

    now = datetime.now(timezone.utc)

    play_stats = {
        1: GamePlayStats(
            bgg_id=1,
            play_count=10,
            last_played_at=(
                now - timedelta(days=2)
            ),
        ),
        2: GamePlayStats(
            bgg_id=2,
            play_count=3,
            last_played_at=(
                now - timedelta(days=200)
            ),
        ),
    }

    matches = service.rank_matches(
        [recent_game, neglected_game],
        PickerCriteria(
            players=2,
            max_play_time=60,
        ),
        play_stats=play_stats,
    )

    assert matches[0].game.name == (
        "Neglected Game"
    )

    assert (
        "Hasn't been played in over 6 months"
        in matches[0].reasons
    )

def test_never_played_game_beats_recently_played_game():
    service = PickerService()

    never_played = Game(
        bgg_id=1,
        name="Never Played",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
    )

    recent_game = Game(
        bgg_id=2,
        name="Recent Game",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
    )

    play_stats = {
        2: GamePlayStats(
            bgg_id=2,
            play_count=5,
            last_played_at=(
                datetime.now(timezone.utc)
                - timedelta(days=2)
            ),
        )
    }

    matches = service.rank_matches(
        [recent_game, never_played],
        PickerCriteria(
            players=2,
            max_play_time=60,
            max_complexity=3.0,
        ),
        play_stats=play_stats,
    )

    assert matches[0].game.bgg_id == 1
    assert "Hasn't been played yet" in matches[0].reasons
    assert "Played recently" in matches[1].reasons

def test_preferred_mechanic_increases_score():
    service = PickerService()

    preferred_game = Game(
        bgg_id=1,
        name="Deck Builder",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
        mechanics=[
            "Deck Building",
        ],
    )

    other_game = Game(
        bgg_id=2,
        name="Other Game",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
        mechanics=[
            "Worker Placement",
        ],
    )

    matches = service.rank_matches(
        [
            other_game,
            preferred_game,
        ],
        PickerCriteria(
            players=2,
            max_play_time=60,
            max_complexity=3.0,
            preferred_mechanics=[
                "Deck Building"
            ],
        ),
    )

    assert matches[0].game.bgg_id == 1

    assert (
        "Matches preferred mechanic: Deck Building"
        in matches[0].reasons
    )


def test_preferred_category_increases_score():
    service = PickerService()

    preferred_game = Game(
        bgg_id=1,
        name="Economic Game",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
        categories=[
            "Economic",
        ],
    )

    other_game = Game(
        bgg_id=2,
        name="Adventure Game",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
        categories=[
            "Adventure",
        ],
    )

    matches = service.rank_matches(
        [
            other_game,
            preferred_game,
        ],
        PickerCriteria(
            players=2,
            max_play_time=60,
            max_complexity=3.0,
            preferred_categories=[
                "Economic"
            ],
        ),
    )

    assert matches[0].game.bgg_id == 1

    assert (
        "Matches preferred category: Economic"
        in matches[0].reasons
    )


def test_preferences_are_case_insensitive():
    service = PickerService()

    game = Game(
        bgg_id=1,
        name="Deck Builder",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
        mechanics=[
            "Deck Building",
        ],
    )

    matches = service.rank_matches(
        [game],
        PickerCriteria(
            players=2,
            preferred_mechanics=[
                "deck building"
            ],
        ),
    )

    assert (
        "Matches preferred mechanic: Deck Building"
        in matches[0].reasons
    )


def test_preferences_do_not_hard_filter_games():
    service = PickerService()

    matching_game = Game(
        bgg_id=1,
        name="Deck Builder",
        min_players=2,
        max_players=4,
        max_play_time=60,
        owned=True,
        mechanics=[
            "Deck Building",
        ],
    )

    non_matching_game = Game(
        bgg_id=2,
        name="Worker Placement Game",
        min_players=2,
        max_players=4,
        max_play_time=60,
        owned=True,
        mechanics=[
            "Worker Placement",
        ],
    )

    matches = service.rank_matches(
        [
            matching_game,
            non_matching_game,
        ],
        PickerCriteria(
            players=2,
            preferred_mechanics=[
                "Deck Building"
            ],
        ),
    )

    assert len(matches) == 2
    assert matches[0].game.bgg_id == 1


def test_category_and_mechanic_bonus_is_capped_at_ten():
    service = PickerService()

    game = Game(
        bgg_id=1,
        name="Perfect Preference Match",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=3.0,
        owned=True,
        categories=[
            "Economic",
            "Strategy",
        ],
        mechanics=[
            "Deck Building",
            "Hand Management",
        ],
    )

    matches = service.rank_matches(
        [game],
        PickerCriteria(
            players=2,
            max_play_time=60,
            max_complexity=3.0,
            preferred_categories=[
                "Economic",
                "Strategy",
            ],
            preferred_mechanics=[
                "Deck Building",
                "Hand Management",
            ],
        ),
    )

    assert matches[0].score <= 100

def test_new_game_for_selected_group_gets_bonus():
    service = PickerService()

    new_for_group = Game(
        bgg_id=1,
        name="New For Group",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
    )

    recent_for_group = Game(
        bgg_id=2,
        name="Recent For Group",
        min_players=2,
        max_players=4,
        max_play_time=60,
        complexity=2.5,
        owned=True,
    )

    now = datetime.now(
        timezone.utc
    )

    group_play_stats = {
        2: GamePlayStats(
            bgg_id=2,
            play_count=2,
            last_played_at=(
                now
                - timedelta(
                    days=2
                )
            ),
        ),
    }

    matches = service.rank_matches(
        [
            recent_for_group,
            new_for_group,
        ],
        PickerCriteria(
            players=2,
            player_ids=[
                1,
                2,
            ],
        ),
        group_play_stats=(
            group_play_stats
        ),
    )

    assert (
        matches[0].game.bgg_id
        == 1
    )

    assert (
        "This group hasn't played it together yet"
        in matches[0].reasons
    )


def test_recent_group_play_gets_penalty():
    service = PickerService()

    game = Game(
        bgg_id=1,
        name="Recent Together",
        min_players=2,
        max_players=4,
        max_play_time=60,
        owned=True,
    )

    matches = service.rank_matches(
        [game],
        PickerCriteria(
            players=2,
            player_ids=[
                1,
                2,
            ],
        ),
        group_play_stats={
            1: GamePlayStats(
                bgg_id=1,
                play_count=3,
                last_played_at=(
                    datetime.now(
                        timezone.utc
                    )
                    - timedelta(
                        days=2
                    )
                ),
            ),
        },
    )

    assert (
        "This group played it recently"
        in matches[0].reasons
    )

def test_best_player_count_gets_bonus():
    service = PickerService()

    best_count_game = Game(
        bgg_id=1,
        name="Best At Two",
        min_players=2,
        max_players=4,
        max_play_time=60,
        owned=True,
        best_player_counts=[
            2,
        ],
        recommended_player_counts=[
            2,
            3,
        ],
    )

    supported_only_game = Game(
        bgg_id=2,
        name="Supported At Two",
        min_players=2,
        max_players=4,
        max_play_time=60,
        owned=True,
    )

    matches = service.rank_matches(
        [
            supported_only_game,
            best_count_game,
        ],
        PickerCriteria(
            players=2,
            max_play_time=60,
        ),
    )

    assert (
        matches[0].game.bgg_id
        == 1
    )

    assert (
        "Best at 2 players"
        in matches[0].reasons
    )


def test_recommended_player_count_gets_bonus():
    service = PickerService()

    recommended_game = Game(
        bgg_id=1,
        name="Recommended At Three",
        min_players=2,
        max_players=4,
        max_play_time=60,
        owned=True,
        recommended_player_counts=[
            3,
        ],
    )

    supported_only_game = Game(
        bgg_id=2,
        name="Supported At Three",
        min_players=2,
        max_players=4,
        max_play_time=60,
        owned=True,
    )

    matches = service.rank_matches(
        [
            supported_only_game,
            recommended_game,
        ],
        PickerCriteria(
            players=3,
            max_play_time=60,
        ),
    )

    assert (
        matches[0].game.bgg_id
        == 1
    )

    assert (
        "Recommended at 3 players"
        in matches[0].reasons
    )