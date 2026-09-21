"""Add user tier.

Revision ID: 2f5d9b8a1c44
Revises: e0f1a2b3c4d5
"""

from alembic import op
import sqlalchemy as sa


revision = "2f5d9b8a1c44"
down_revision = "e0f1a2b3c4d5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "tier",
            sa.String(length=16),
            nullable=False,
            server_default="FREE",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "tier")
