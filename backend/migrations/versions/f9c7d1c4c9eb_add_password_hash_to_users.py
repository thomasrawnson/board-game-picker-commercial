"""Add password hash to users

Revision ID: f9c7d1c4c9eb
Revises: c3d4e5f6a7b8
Create Date: 2026-09-04 15:12:50.604865
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f9c7d1c4c9eb"
down_revision: Union[str, Sequence[str], None] = (
    "c3d4e5f6a7b8"
)
branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None
depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "password_hash",
            sa.String(length=255),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "users",
        "password_hash",
    )