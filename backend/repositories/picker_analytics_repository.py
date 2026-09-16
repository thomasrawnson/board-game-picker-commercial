from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from database.models import (
    PickerEvent,
    PickerSession,
)


class PickerAnalyticsRepository:
    def __init__(
        self,
        db: Session,
        user_id: int,
    ):
        self.db = db
        self.user_id = user_id

    def create_session(
        self,
        criteria: dict,
        recommendation_bgg_ids: list[int],
    ) -> str:
        public_id = str(uuid4())

        session = PickerSession(
            public_id=public_id,
            user_id=self.user_id,
            criteria=criteria,
            recommendation_bgg_ids=(
                recommendation_bgg_ids
            ),
        )

        self.db.add(session)
        self.db.flush()

        first_bgg_id = (
            recommendation_bgg_ids[0]
            if recommendation_bgg_ids
            else None
        )

        self.db.add(
            PickerEvent(
                picker_session_id=session.id,
                event_type=(
                    "recommendation_shown"
                    if first_bgg_id is not None
                    else "no_match"
                ),
                bgg_id=first_bgg_id,
                position=(
                    0
                    if first_bgg_id is not None
                    else None
                ),
            )
        )

        self.db.commit()

        return public_id

    def record_event(
        self,
        public_id: str,
        event_type: str,
        bgg_id: int | None = None,
        position: int | None = None,
    ) -> bool:
        session = self.db.scalar(
            select(PickerSession).where(
                PickerSession.public_id
                == public_id,
                PickerSession.user_id
                == self.user_id,
            )
        )

        if session is None:
            return False

        self.db.add(
            PickerEvent(
                picker_session_id=session.id,
                event_type=event_type,
                bgg_id=bgg_id,
                position=position,
            )
        )
        self.db.commit()

        return True
