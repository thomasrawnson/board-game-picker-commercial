"""Add picker analytics.

Revision ID: c8d9e0f1a2b3
Revises: b7c8d9e0f1a2
"""

from alembic import op
import sqlalchemy as sa


revision = "c8d9e0f1a2b3"
down_revision = "b7c8d9e0f1a2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "picker_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "public_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("criteria", sa.JSON(), nullable=False),
        sa.Column(
            "recommendation_bgg_ids",
            sa.JSON(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_picker_sessions_public_id",
        "picker_sessions",
        ["public_id"],
        unique=True,
    )
    op.create_index(
        "ix_picker_sessions_user_id",
        "picker_sessions",
        ["user_id"],
        unique=False,
    )

    op.create_table(
        "picker_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "picker_session_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "event_type",
            sa.String(length=40),
            nullable=False,
        ),
        sa.Column("bgg_id", sa.Integer(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["picker_session_id"],
            ["picker_sessions.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_picker_events_session_created_at",
        "picker_events",
        ["picker_session_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_picker_events_session_created_at",
        table_name="picker_events",
    )
    op.drop_table("picker_events")
    op.drop_index(
        "ix_picker_sessions_user_id",
        table_name="picker_sessions",
    )
    op.drop_index(
        "ix_picker_sessions_public_id",
        table_name="picker_sessions",
    )
    op.drop_table("picker_sessions")
