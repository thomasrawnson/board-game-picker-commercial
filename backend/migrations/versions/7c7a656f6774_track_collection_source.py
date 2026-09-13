"""track collection source

Revision ID: 7c7a656f6774
Revises: fc4c0bf3b7b3
Create Date: 2026-09-13 08:05:45.711487

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c7a656f6774'
down_revision: Union[str, Sequence[str], None] = 'fc4c0bf3b7b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_games",
        sa.Column(
            "source",
            sa.String(
                length=20
            ),
            nullable=False,
            server_default="bgg",
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "user_games",
        "source",
    )
