from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from database.connection import Base


game_categories = Table(
    "game_categories",
    Base.metadata,
    Column(
        "game_id",
        ForeignKey(
            "games.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
    Column(
        "category_id",
        ForeignKey(
            "categories.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)


game_mechanics = Table(
    "game_mechanics",
    Base.metadata,
    Column(
        "game_id",
        ForeignKey(
            "games.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
    Column(
        "mechanic_id",
        ForeignKey(
            "mechanics.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    display_name: Mapped[str | None] = mapped_column(
        String(100),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    user_games = relationship(
        "UserGame",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class UserGame(Base):
    __tablename__ = "user_games"

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    game_id: Mapped[int] = mapped_column(
        ForeignKey(
            "games.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="user_games",
    )

    game = relationship(
        "Game",
        back_populates="user_games",
    )


class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    bgg_id: Mapped[int] = mapped_column(
        Integer,
        unique=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    year_published: Mapped[int | None] = mapped_column(
        Integer,
    )

    min_players: Mapped[int | None] = mapped_column(
        Integer,
    )

    max_players: Mapped[int | None] = mapped_column(
        Integer,
    )

    min_play_time: Mapped[int | None] = mapped_column(
        Integer,
    )

    max_play_time: Mapped[int | None] = mapped_column(
        Integer,
    )

    complexity: Mapped[float | None] = mapped_column(
        Float,
    )

    rating: Mapped[float | None] = mapped_column(
        Float,
    )

    # Temporary compatibility field.
    # Ownership will move entirely to UserGame.
    owned: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500),
    )

    thumbnail_url: Mapped[str | None] = mapped_column(
        String(500),
    )

    categories = relationship(
        "Category",
        secondary=game_categories,
        lazy="selectin",
    )

    mechanics = relationship(
        "Mechanic",
        secondary=game_mechanics,
        lazy="selectin",
    )

    user_games = relationship(
        "UserGame",
        back_populates="game",
        cascade="all, delete-orphan",
    )


class Play(Base):
    __tablename__ = "plays"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "source",
            "source_play_id",
            name=(
                "uq_plays_user_source_play_id"
            ),
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    game_id: Mapped[int] = mapped_column(
        ForeignKey(
            "games.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    player_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    played_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    duration_minutes: Mapped[int | None] = mapped_column(
        Integer,
    )

    source: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default="app",
    )

    source_play_id: Mapped[str | None] = mapped_column(
        String(100),
    )


class Category(Base):
    __tablename__ = "categories"

    id = Column(
        Integer,
        primary_key=True,
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )


class Mechanic(Base):
    __tablename__ = "mechanics"

    id = Column(
        Integer,
        primary_key=True,
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )