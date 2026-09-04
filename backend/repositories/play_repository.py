from sqlalchemy.orm import Session

from repositories.play_read_repository import (
    PlayReadRepository,
)
from repositories.play_write_repository import (
    PlayWriteRepository,
)


class PlayRepository(
    PlayWriteRepository,
    PlayReadRepository,
):
    def __init__(
        self,
        db: Session,
        user_id: int | None = None,
    ):
        self.db = db
        self.user_id = user_id