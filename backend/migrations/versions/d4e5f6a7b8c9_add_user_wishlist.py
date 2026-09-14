"""Add user wishlist.

Revision ID: d4e5f6a7b8c9
Revises: 59dc98986b39, c3d4e5f6a7b8
"""

from alembic import op
import sqlalchemy as sa


revision = "d4e5f6a7b8c9"
down_revision = (
    "59dc98986b39",
    "c3d4e5f6a7b8",
)
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_wishlist_games",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "game_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "added_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["game_id"],
            ["games.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "user_id",
            "game_id",
        ),
    )


def downgrade() -> None:
    op.drop_table("user_wishlist_games")
