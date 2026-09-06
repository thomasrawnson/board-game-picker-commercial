"""Backfill persistent players

Revision ID: b8211a5e9f81
Revises: fee9cd03fb47
Create Date: 2026-09-06 22:12:16.623028

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8211a5e9f81'
down_revision: Union[str, Sequence[str], None] = 'fee9cd03fb47'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()

    participants = connection.execute(
        sa.text(
            """
            SELECT
                pp.id AS participant_id,
                pp.name AS participant_name,
                p.user_id AS user_id
            FROM play_participants pp
            JOIN plays p
                ON p.id = pp.play_id
            WHERE pp.name IS NOT NULL
              AND TRIM(pp.name) <> ''
              AND pp.player_id IS NULL
            ORDER BY pp.id
            """
        )
    ).mappings().all()

    player_ids: dict[
        tuple[int, str],
        int,
    ] = {}

    existing_players = connection.execute(
        sa.text(
            """
            SELECT
                id,
                user_id,
                normalized_name
            FROM players
            """
        )
    ).mappings().all()

    for player in existing_players:
        player_ids[
            (
                player["user_id"],
                player["normalized_name"],
            )
        ] = player["id"]

    for participant in participants:
        cleaned_name = " ".join(
            participant[
                "participant_name"
            ].strip().split()
        )

        normalized_name = (
            cleaned_name.lower()
        )

        key = (
            participant["user_id"],
            normalized_name,
        )

        player_id = player_ids.get(
            key
        )

        if player_id is None:
            result = connection.execute(
                sa.text(
                    """
                    INSERT INTO players (
                        user_id,
                        name,
                        normalized_name
                    )
                    VALUES (
                        :user_id,
                        :name,
                        :normalized_name
                    )
                    RETURNING id
                    """
                ),
                {
                    "user_id":
                        participant[
                            "user_id"
                        ],
                    "name":
                        cleaned_name,
                    "normalized_name":
                        normalized_name,
                },
            )

            player_id = (
                result.scalar_one()
            )

            player_ids[key] = (
                player_id
            )

        connection.execute(
            sa.text(
                """
                UPDATE play_participants
                SET player_id = :player_id
                WHERE id = :participant_id
                """
            ),
            {
                "player_id":
                    player_id,
                "participant_id":
                    participant[
                        "participant_id"
                    ],
            },
        )


def downgrade() -> None:
    connection = op.get_bind()

    connection.execute(
        sa.text(
            """
            UPDATE play_participants
            SET player_id = NULL
            """
        )
    )

    connection.execute(
        sa.text(
            """
            DELETE FROM players
            """
        )
    )