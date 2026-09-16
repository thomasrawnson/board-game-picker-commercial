"""Add game designers and publishers.

Revision ID: e0f1a2b3c4d5
Revises: d9e0f1a2b3c4
"""

from alembic import op
import sqlalchemy as sa


revision = "e0f1a2b3c4d5"
down_revision = "d9e0f1a2b3c4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "games",
        sa.Column(
            "designers",
            sa.JSON(),
            server_default=sa.text("'[]'::json"),
            nullable=False,
        ),
    )
    op.add_column(
        "games",
        sa.Column(
            "publishers",
            sa.JSON(),
            server_default=sa.text("'[]'::json"),
            nullable=False,
        ),
    )
    op.add_column(
        "games",
        sa.Column(
            "credits_checked",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("games", "credits_checked")
    op.drop_column("games", "publishers")
    op.drop_column("games", "designers")
