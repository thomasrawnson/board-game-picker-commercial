"""Add onboarding state, reusable preferences and linked player identity.

Revision ID: 6ac2f16e3a91
Revises: 2f5d9b8a1c44
"""

from alembic import op
import sqlalchemy as sa

revision = "6ac2f16e3a91"
down_revision = "2f5d9b8a1c44"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("onboarding_completed", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("preferred_player_count", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("preferred_play_time", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("profile_player_id", sa.Integer(), nullable=True))
    op.add_column("players", sa.Column("avatar_key", sa.String(length=16), nullable=False, server_default="forest"))
    op.create_foreign_key("fk_users_profile_player_id", "users", "players", ["profile_player_id"], ["id"], ondelete="SET NULL")
    # Existing accounts have already passed the prior first-run experience.
    op.execute(sa.text("UPDATE users SET onboarding_completed = true"))


def downgrade() -> None:
    op.drop_constraint("fk_users_profile_player_id", "users", type_="foreignkey")
    op.drop_column("players", "avatar_key")
    op.drop_column("users", "profile_player_id")
    op.drop_column("users", "preferred_play_time")
    op.drop_column("users", "preferred_player_count")
    op.drop_column("users", "onboarding_completed")
