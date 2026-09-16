"""Add expansion metadata check marker.

Revision ID: a6b7c8d9e0f1
Revises: f6a7b8c9d0e1
"""

from alembic import op
import sqlalchemy as sa


revision = "a6b7c8d9e0f1"
down_revision = "f6a7b8c9d0e1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "games",
        sa.Column(
            "expansion_checked",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.alter_column(
        "games",
        "expansion_checked",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column(
        "games",
        "expansion_checked",
    )
