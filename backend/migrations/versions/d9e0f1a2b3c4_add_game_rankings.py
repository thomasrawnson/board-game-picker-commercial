"""Add personal game rankings.

Revision ID: d9e0f1a2b3c4
Revises: c8d9e0f1a2b3
"""

from alembic import op
import sqlalchemy as sa


revision = "d9e0f1a2b3c4"
down_revision = "c8d9e0f1a2b3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "game_rankings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("game_id", sa.Integer(), nullable=False),
        sa.Column(
            "rating",
            sa.Float(),
            server_default="1500",
            nullable=False,
        ),
        sa.Column(
            "comparisons_count",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "wins",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "losses",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "excluded",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
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
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "game_id",
            name="uq_game_rankings_user_game",
        ),
    )
    op.create_index(
        "ix_game_rankings_game_id",
        "game_rankings",
        ["game_id"],
    )
    op.create_index(
        "ix_game_rankings_user_id",
        "game_rankings",
        ["user_id"],
    )
    op.create_index(
        "ix_game_rankings_user_rating",
        "game_rankings",
        ["user_id", "rating"],
    )

    op.create_table(
        "game_comparisons",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "winner_game_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "loser_game_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["loser_game_id"],
            ["games.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["winner_game_id"],
            ["games.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_game_comparisons_user_id",
        "game_comparisons",
        ["user_id"],
    )
    op.create_index(
        "ix_game_comparisons_user_created_at",
        "game_comparisons",
        ["user_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_game_comparisons_user_created_at",
        table_name="game_comparisons",
    )
    op.drop_index(
        "ix_game_comparisons_user_id",
        table_name="game_comparisons",
    )
    op.drop_table("game_comparisons")
    op.drop_index(
        "ix_game_rankings_user_rating",
        table_name="game_rankings",
    )
    op.drop_index(
        "ix_game_rankings_user_id",
        table_name="game_rankings",
    )
    op.drop_index(
        "ix_game_rankings_game_id",
        table_name="game_rankings",
    )
    op.drop_table("game_rankings")
