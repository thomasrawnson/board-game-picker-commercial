"""Add player count poll.

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
"""

from alembic import op
import sqlalchemy as sa


revision = "e5f6a7b8c9d0"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "games",
        sa.Column(
            "player_count_poll",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'::json"),
        ),
    )

    op.alter_column(
        "games",
        "player_count_poll",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column(
        "games",
        "player_count_poll",
    )
