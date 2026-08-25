"""Add user ownership foundation

Revision ID: a1b2c3d4e5f6
Revises: c4cd883995f9

"""

from typing import (
    Sequence,
    Union,
)

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "c4cd883995f9"

branch_labels = None
depends_on = None


DEV_EMAIL = "dev@boardgamepicker.local"


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "email",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "display_name",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_index(
        op.f("ix_users_email"),
        "users",
        ["email"],
        unique=True,
    )

    op.create_table(
        "user_games",
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
        sa.PrimaryKeyConstraint(
            "user_id",
            "game_id",
        ),
    )

    op.execute(
        sa.text(
            """
            INSERT INTO users (
                email,
                display_name
            )
            VALUES (
                :email,
                'Local User'
            )
            """
        ).bindparams(
            email=DEV_EMAIL,
        )
    )

    op.execute(
        sa.text(
            """
            INSERT INTO user_games (
                user_id,
                game_id
            )
            SELECT
                (
                    SELECT id
                    FROM users
                    WHERE email = :email
                ),
                games.id
            FROM games
            WHERE games.owned = true
            """
        ).bindparams(
            email=DEV_EMAIL,
        )
    )


def downgrade() -> None:
    op.drop_table("user_games")

    op.drop_index(
        op.f("ix_users_email"),
        table_name="users",
    )

    op.drop_table("users")