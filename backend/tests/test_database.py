from sqlalchemy import inspect

from database.connection import engine
from database.models import Game
from database.models import Play


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
