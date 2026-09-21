from models.game import Game, PlayerCountPoll
from models.game_play_stats import GamePlayStats
from services.game_night_service import GameNightService


def make_game(
    bgg_id: int,
    *,
    min_players: int = 2,
    max_players: int = 4,
    max_play_time: int = 60,
    rejected_at_three: bool = False,
) -> Game:
    poll = []
    if rejected_at_three:
        poll = [PlayerCountPoll(3, 0, 7, 3, 10)]

    return Game(
        bgg_id=bgg_id,
        name=f"Game {bgg_id}",
        min_players=min_players,
        max_players=max_players,
        max_play_time=max_play_time,
        owned=True,
        player_count_poll=poll,
    )


def test_attendees_time_and_poll_rules_drive_game_night_shortlist():
    games = [make_game(index) for index in range(1, 7)]
    games.extend([
        make_game(7, min_players=4),
        make_game(8, max_play_time=120),
        make_game(9, rejected_at_three=True),
    ])

    matches = GameNightService().recommend(
        games,
        [10, 20, 30],
        60,
    )

    assert len(matches) == 5
    assert {match.game.bgg_id for match in matches}.isdisjoint({7, 8, 9})
    assert all("Supports 3 players" in match.reasons for match in matches)
    assert all("Fits within 60 minutes" in match.reasons for match in matches)


def test_exact_group_history_is_used_only_when_supplied():
    game = make_game(1)
    group_stats = {
        1: GamePlayStats(
            bgg_id=1,
            play_count=2,
            last_played_at=None,
        )
    }

    with_history = GameNightService().recommend(
        [game], [10, 20], 60, group_play_stats=group_stats
    )[0]
    without_history = GameNightService().recommend(
        [game], [10, 20], 60, group_play_stats={}
    )[0]

    assert any("group" in reason.lower() for reason in with_history.reasons)
    assert any("group" in reason.lower() for reason in without_history.reasons)


def test_host_owned_collection_is_the_safe_ownership_fallback():
    host_owned = make_game(1)
    not_host_owned = make_game(2)
    not_host_owned.owned = False

    matches = GameNightService().recommend(
        [host_owned, not_host_owned], [10, 20], 60
    )

    assert [match.game.bgg_id for match in matches] == [1]
