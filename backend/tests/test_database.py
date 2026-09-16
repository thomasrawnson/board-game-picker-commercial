from sqlalchemy import inspect

from database.connection import engine
from database.models import Game
from database.models import Play
from database.models import PickerEvent
from database.models import PickerSession
from database.models import GameComparison
from database.models import GameRanking


def test_games_table_exists():
    inspector = inspect(engine)

    tables = inspector.get_table_names()

    assert "games" in tables


def test_play_history_index_is_declared_in_model_metadata():
    index_names = {
        index.name
        for index in Play.__table__.indexes
    }

    assert (
        "ix_plays_user_id_played_at"
        in index_names
    )


def test_player_count_poll_is_declared_in_model_metadata():
    assert "player_count_poll" in Game.__table__.columns


def test_expansion_flag_is_declared_in_model_metadata():
    assert "is_expansion" in Game.__table__.columns
    assert (
        "expansion_checked"
        in Game.__table__.columns
    )
    assert "min_age" in Game.__table__.columns
    assert "min_age_checked" in Game.__table__.columns


def test_picker_analytics_is_declared_in_model_metadata():
    assert "criteria" in PickerSession.__table__.columns
    assert (
        "recommendation_bgg_ids"
        in PickerSession.__table__.columns
    )
    assert "event_type" in PickerEvent.__table__.columns

    index_names = {
        index.name
        for index in PickerEvent.__table__.indexes
    }

    assert (
        "ix_picker_events_session_created_at"
        in index_names
    )


def test_game_rankings_are_declared_in_model_metadata():
    assert "rating" in GameRanking.__table__.columns
    assert "excluded" in GameRanking.__table__.columns
    assert (
        "winner_game_id"
        in GameComparison.__table__.columns
    )

    index_names = {
        index.name
        for index in GameRanking.__table__.indexes
    }

    assert (
        "ix_game_rankings_user_rating"
        in index_names
    )


def test_game_credits_are_declared_in_model_metadata():
    assert "designers" in Game.__table__.columns
    assert "publishers" in Game.__table__.columns
    assert "credits_checked" in Game.__table__.columns
