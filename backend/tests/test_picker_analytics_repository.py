from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from database.connection import Base
from database.models import (
    PickerEvent,
    PickerSession,
    User,
)
from repositories.picker_analytics_repository import (
    PickerAnalyticsRepository,
)


def test_picker_session_and_events_are_user_scoped():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:"
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)

    with session_factory() as db:
        first_user = User(
            email="first@example.com"
        )
        second_user = User(
            email="second@example.com"
        )
        db.add_all([first_user, second_user])
        db.commit()

        first_repository = (
            PickerAnalyticsRepository(
                db,
                user_id=first_user.id,
            )
        )
        public_id = (
            first_repository.create_session(
                criteria={
                    "players": 2,
                    "mood_used": False,
                },
                recommendation_bgg_ids=[
                    42,
                    84,
                ],
            )
        )

        picker_session = db.scalar(
            select(PickerSession).where(
                PickerSession.public_id
                == public_id
            )
        )

        assert picker_session is not None
        assert picker_session.user_id == first_user.id
        assert picker_session.criteria == {
            "players": 2,
            "mood_used": False,
        }

        events = list(
            db.scalars(
                select(PickerEvent).where(
                    PickerEvent.picker_session_id
                    == picker_session.id
                )
            )
        )

        assert len(events) == 1
        assert (
            events[0].event_type
            == "recommendation_shown"
        )
        assert events[0].bgg_id == 42
        assert events[0].position == 0

        second_repository = (
            PickerAnalyticsRepository(
                db,
                user_id=second_user.id,
            )
        )

        assert (
            second_repository.record_event(
                public_id,
                "view_game",
                bgg_id=42,
            )
            is False
        )

        assert (
            first_repository.record_event(
                public_id,
                "view_game",
                bgg_id=42,
                position=0,
            )
            is True
        )

        event_types = list(
            db.scalars(
                select(PickerEvent.event_type)
                .where(
                    PickerEvent.picker_session_id
                    == picker_session.id
                )
                .order_by(PickerEvent.id)
            )
        )

        assert event_types == [
            "recommendation_shown",
            "view_game",
        ]
