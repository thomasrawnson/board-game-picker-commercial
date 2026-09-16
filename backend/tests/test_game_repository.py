from database.connection import SessionLocal
from database.models import Game as DatabaseGame
from models.game import Game as DomainGame
from models.game import PlayerCountPoll
from repositories.game_repository import GameRepository
from database.models import Category, Mechanic


def test_update_game():
    db = SessionLocal()

    try:
        repository = GameRepository(db)

        original = DomainGame(
            bgg_id=999002,
            name="Original Game",
            year_published=2025,
            min_players=2,
            max_players=4,
            rating=7.0,
            complexity=2.0,
        )

        repository.create(original)

        updated = DomainGame(
            bgg_id=999002,
            name="Updated Game",
            year_published=2026,
            min_players=1,
            max_players=5,
            rating=8.5,
            complexity=3.5,
            player_count_poll=[
                PlayerCountPoll(
                    player_count=2,
                    best_votes=0,
                    recommended_votes=9,
                    not_recommended_votes=40,
                    total_votes=49,
                )
            ],
        )

        result = repository.update(updated)

        assert result is not None
        assert result.name == "Updated Game"
        assert result.year_published == 2026
        assert result.min_players == 1
        assert result.max_players == 5
        assert result.rating == 8.5
        assert result.complexity == 3.5
        assert result.player_count_poll == [
            PlayerCountPoll(2, 0, 9, 40, 49)
        ]

    finally:
        db.query(DatabaseGame).filter(
            DatabaseGame.bgg_id == 999002
        ).delete()
        db.commit()
        db.close()


def test_delete_game():
    db = SessionLocal()

    try:
        repository = GameRepository(db)

        game = DomainGame(
            bgg_id=999003,
            name="Game To Delete",
        )

        repository.create(game)

        deleted = repository.delete(999003)

        assert deleted is True

        result = repository.get_by_bgg_id(999003)

        assert result is None

    finally:
        db.query(DatabaseGame).filter(
            DatabaseGame.bgg_id == 999003
        ).delete()
        db.commit()
        db.close()


def test_update_missing_game_returns_none():
    db = SessionLocal()

    try:
        repository = GameRepository(db)

        game = DomainGame(
            bgg_id=999004,
            name="Does Not Exist",
        )

        result = repository.update(game)

        assert result is None

    finally:
        db.close()


def test_delete_missing_game_returns_false():
    db = SessionLocal()

    try:
        repository = GameRepository(db)

        result = repository.delete(999005)

        assert result is False

    finally:
        db.close()

def test_create_game_persists_categories_and_mechanics():
    repository = GameRepository(SessionLocal())
    test_bgg_id = 999001

    repository.delete(test_bgg_id)

    game = DomainGame(
        bgg_id=999001,
        name="Metadata Test Game",
        owned=True,
        categories=[
            "Economic",
            "Strategy",
        ],
        mechanics=[
            "Hand Management",
            "Worker Placement",
        ],
    )

    created = repository.create(game)

    assert created.categories == [
        "Economic",
        "Strategy",
    ]

    assert created.mechanics == [
        "Hand Management",
        "Worker Placement",
    ]

def test_shared_categories_and_mechanics_are_reused():
    session = SessionLocal()
    repository = GameRepository(session)

    first_id = 999011
    second_id = 999012

    repository.delete(first_id)
    repository.delete(second_id)

    first_game = DomainGame(
        bgg_id=first_id,
        name="First Shared Metadata Game",
        owned=True,
        categories=["Economic"],
        mechanics=["Hand Management"],
    )

    second_game = DomainGame(
        bgg_id=second_id,
        name="Second Shared Metadata Game",
        owned=True,
        categories=["Economic"],
        mechanics=["Hand Management"],
    )

    repository.create(first_game)
    repository.create(second_game)

    category_count = (
        session.query(Category)
        .filter(Category.name == "Economic")
        .count()
    )

    mechanic_count = (
        session.query(Mechanic)
        .filter(Mechanic.name == "Hand Management")
        .count()
    )

    assert category_count == 1
    assert mechanic_count == 1

    repository.delete(first_id)
    repository.delete(second_id)
    session.close()

def test_update_replaces_categories_and_mechanics():
    session = SessionLocal()
    repository = GameRepository(session)

    test_bgg_id = 999013

    repository.delete(test_bgg_id)

    original = DomainGame(
        bgg_id=test_bgg_id,
        name="Metadata Update Game",
        owned=True,
        categories=["Economic"],
        mechanics=["Hand Management"],
    )

    repository.create(original)

    updated = DomainGame(
        bgg_id=test_bgg_id,
        name="Metadata Update Game",
        owned=True,
        categories=["Card Game"],
        mechanics=["Deck Building"],
    )

    result = repository.update(updated)

    assert result is not None
    assert result.categories == ["Card Game"]
    assert result.mechanics == ["Deck Building"]

    repository.delete(test_bgg_id)
    session.close()


def test_identifies_legacy_player_count_poll_metadata():
    session = SessionLocal()
    repository = GameRepository(session)

    legacy_id = 999014
    current_id = 999015
    sparse_import_id = 999016

    repository.delete(legacy_id)
    repository.delete(current_id)
    repository.delete(sparse_import_id)

    try:
        repository.create(
            DomainGame(
                bgg_id=legacy_id,
                name="Legacy Poll Game",
                best_player_counts=[2],
            )
        )

        repository.create(
            DomainGame(
                bgg_id=current_id,
                name="Current Poll Game",
                best_player_counts=[2],
                player_count_poll=[
                    PlayerCountPoll(
                        2,
                        12,
                        6,
                        2,
                        20,
                    )
                ],
            )
        )

        repository.create(
            DomainGame(
                bgg_id=sparse_import_id,
                name="Sparse BG Stats Game",
            )
        )

        refresh_ids = (
            repository
            .get_bgg_ids_needing_player_count_poll_refresh(
                [
                    legacy_id,
                    current_id,
                    sparse_import_id,
                ]
            )
        )

        assert refresh_ids == {
            legacy_id,
            sparse_import_id,
        }
    finally:
        repository.delete(legacy_id)
        repository.delete(current_id)
        repository.delete(sparse_import_id)
        session.close()
