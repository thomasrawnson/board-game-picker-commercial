"""Scope plays to users

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6

"""

from typing import (
    Sequence,
    Union,
)

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "a1b2c3d4e5f6"

branch_labels = None
depends_on = None


DEV_EMAIL = "dev@boardgamepicker.local"


def upgrade() -> None:
    op.add_column(
        "plays",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.execute(
        sa.text(
            """
            UPDATE plays
            SET user_id = (
                SELECT id
                FROM users
                WHERE email = :email
            )
            WHERE user_id IS NULL
            """
        ).bindparams(
            email=DEV_EMAIL,
        )
    )

    op.alter_column(
        "plays",
        "user_id",
        nullable=False,
    )

    op.create_foreign_key(
        "fk_plays_user_id_users",
        "plays",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_index(
        op.f("ix_plays_user_id"),
        "plays",
        ["user_id"],
        unique=False,
    )

    op.drop_constraint(
        "uq_plays_source_play_id",
        "plays",
        type_="unique",
    )

    op.create_unique_constraint(
        "uq_plays_user_source_play_id",
        "plays",
        [
            "user_id",
            "source",
            "source_play_id",
        ],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_plays_user_source_play_id",
        "plays",
        type_="unique",
    )

    op.create_unique_constraint(
        "uq_plays_source_play_id",
        "plays",
        [
            "source",
            "source_play_id",
        ],
    )

    op.drop_index(
        op.f("ix_plays_user_id"),
        table_name="plays",
    )

    op.drop_constraint(
        "fk_plays_user_id_users",
        "plays",
        type_="foreignkey",
    )

    op.drop_column(
        "plays",
        "user_id",
    )