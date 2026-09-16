"""Add game minimum age.

Revision ID: b7c8d9e0f1a2
Revises: a6b7c8d9e0f1
"""

from alembic import op
import sqlalchemy as sa


revision = "b7c8d9e0f1a2"
down_revision = "a6b7c8d9e0f1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "games",
        sa.Column(
            "min_age",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "games",
        sa.Column(
            "min_age_checked",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.alter_column(
        "games",
        "min_age_checked",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column(
        "games",
        "min_age_checked",
    )
    op.drop_column(
        "games",
        "min_age",
    )
