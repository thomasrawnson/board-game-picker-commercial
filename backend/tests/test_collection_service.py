from models.game import Game
from services.collection_service import CollectionService



GAME_XML = """
<items>
    <item type="boardgame" id="174430">
        <name type="primary" value="Gloomhaven"/>
        <yearpublished value="2017"/>

        <minplayers value="1"/>
        <maxplayers value="4"/>

        <minplaytime value="60"/>
        <maxplaytime value="120"/>

        <image>https://example.com/image.jpg</image>
        <thumbnail>https://example.com/thumb.jpg</thumbnail>

        <statistics>
            <ratings>
                <average value="8.5"/>
                <averageweight value="3.8"/>
            </ratings>
        </statistics>

        <link type="boardgamecategory" value="Adventure"/>
        <link type="boardgamecategory" value="Fantasy"/>
        <link type="boardgamemechanic" value="Cooperative Game"/>
    </item>
</items>
"""


def test_sync_game_creates_new_game():
    class FakeBGGClient:
        def get_game(self, bgg_id):
            return GAME_XML

    class FakeRepository:
        def get_by_bgg_id(self, bgg_id):
            return None

        def create(self, game):
            return game

    service = CollectionService(
        FakeBGGClient(),
        FakeRepository(),
    )

    game = service.sync_game(174430)

    assert game.bgg_id == 174430
    assert game.name == "Gloomhaven"


def test_sync_game_updates_existing_game():
    class FakeBGGClient:
        def get_game(self, bgg_id):
            return GAME_XML

    class FakeRepository:
        def get_by_bgg_id(self, bgg_id):
            return Game(
                bgg_id=174430,
                name="Old Name",
            )

        def update(self, game):
            return game

    service = CollectionService(
        FakeBGGClient(),
        FakeRepository(),
    )

    game = service.sync_game(174430)

    assert game.bgg_id == 174430
    assert game.name == "Gloomhaven"

def test_sync_collection():
    collection_xml = """
    <items>
        <item objectid="174430"/>
        <item objectid="167791"/>
    </items>
    """

    class FakeBGGClient:
        def get_collection(
            self,
            username,
        ):
            return collection_xml

        def get_games(
            self,
            bgg_ids,
        ):
            items = "".join(
                f"""
                <item
                    type="boardgame"
                    id="{bgg_id}"
                >
                    <name
                        type="primary"
                        value="Game {bgg_id}"
                    />
                </item>
                """
                for bgg_id
                in bgg_ids
            )

            return (
                f"<items>{items}</items>"
            )

    class FakeRepository:
        def __init__(self):
            self.games = {}

        def get_existing_bgg_ids(
            self,
            bgg_ids,
        ):
            return {
                bgg_id
                for bgg_id
                in bgg_ids
                if bgg_id in self.games
            }

        def get_by_bgg_id(
            self,
            bgg_id,
        ):
            return self.games.get(
                bgg_id
            )

        def create(
            self,
            game,
        ):
            self.games[
                game.bgg_id
            ] = game

            return game

        def update(
            self,
            game,
        ):
            self.games[
                game.bgg_id
            ] = game

            return game

    service = CollectionService(
        FakeBGGClient(),
        FakeRepository(),
    )

    games = service.sync_collection(
        "tom"
    )

    assert len(games) == 2
    assert games[0].bgg_id == 174430
    assert games[1].bgg_id == 167791

def test_sync_collection_batches_uncached_games():
    ids = list(range(1, 46))

    collection_xml = (
        "<items>"
        + "".join(
            (
                f'<item '
                f'objectid="{bgg_id}"/>'
            )
            for bgg_id in ids
        )
        + "</items>"
    )

    class FakeBGGClient:
        def __init__(self):
            self.batches = []

        def get_collection(
            self,
            username,
        ):
            return collection_xml

        def get_games(
            self,
            bgg_ids,
        ):
            self.batches.append(
                list(bgg_ids)
            )

            items = "".join(
                f"""
                <item
                    type="boardgame"
                    id="{bgg_id}"
                >
                    <name
                        type="primary"
                        value="Game {bgg_id}"
                    />
                </item>
                """
                for bgg_id
                in bgg_ids
            )

            return (
                f"<items>"
                f"{items}"
                f"</items>"
            )

    class FakeRepository:
        def __init__(self):
            self.games = {}

        def get_existing_bgg_ids(
            self,
            bgg_ids,
        ):
            return set()

        def get_by_bgg_id(
            self,
            bgg_id,
        ):
            return self.games.get(
                bgg_id
            )

        def create(
            self,
            game,
        ):
            self.games[
                game.bgg_id
            ] = game

            return game

        def update(
            self,
            game,
        ):
            self.games[
                game.bgg_id
            ] = game

            return game

    bgg_client = (
        FakeBGGClient()
    )

    service = CollectionService(
        bgg_client,
        FakeRepository(),
    )

    games = (
        service.sync_collection(
            "tom"
        )
    )

    assert len(games) == 45

    assert len(
        bgg_client.batches
    ) == 3

    assert len(
        bgg_client.batches[0]
    ) == 20

    assert len(
        bgg_client.batches[1]
    ) == 20

    assert len(
        bgg_client.batches[2]
    ) == 5