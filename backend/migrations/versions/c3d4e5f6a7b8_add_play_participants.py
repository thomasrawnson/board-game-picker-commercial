"""Add play participants.

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
"""

from alembic import op
import sqlalchemy as sa


revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "play_participants",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "play_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "score",
            sa.Float(),
            nullable=True,
        ),
        sa.Column(
            "is_winner",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.ForeignKeyConstraint(
            ["play_id"],
            ["plays.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_play_participants_play_id",
        "play_participants",
        ["play_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_play_participants_play_id",
        table_name="play_participants",
    )

    op.drop_table(
        "play_participants"
    )