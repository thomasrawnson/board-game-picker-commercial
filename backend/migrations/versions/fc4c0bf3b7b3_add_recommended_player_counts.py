"""Add recommended player counts

Revision ID: fc4c0bf3b7b3
Revises: b8211a5e9f81
Create Date: 2026-09-08 13:28:27.027376

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc4c0bf3b7b3'
down_revision: Union[str, Sequence[str], None] = 'b8211a5e9f81'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "games",
        sa.Column(
            "best_player_counts",
            sa.JSON(),
            nullable=False,
            server_default=sa.text(
                "'[]'::json"
            ),
        ),
    )

    op.add_column(
        "games",
        sa.Column(
            "recommended_player_counts",
            sa.JSON(),
            nullable=False,
            server_default=sa.text(
                "'[]'::json"
            ),
        ),
    )

    op.alter_column(
        "games",
        "best_player_counts",
        server_default=None,
    )

    op.alter_column(
        "games",
        "recommended_player_counts",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "games",
        "recommended_player_counts",
    )

    op.drop_column(
        "games",
        "best_player_counts",
    )