from pathlib import Path
from bgg.game_parser import parse_game_metadata


FIXTURE = (
    Path(__file__).parent
    / "fixtures"
    / "bgg_thing.xml"
)


def test_parse_game_metadata():

    xml = FIXTURE.read_text(encoding="utf-8")

    game = parse_game_metadata(xml)

    assert game.bgg_id == 174430

    assert game.name == "Gloomhaven: Jaws of the Lion"

    assert game.year_published == 2020

    assert game.min_players == 1
    assert game.max_players == 4

    assert game.min_play_time == 30
    assert game.max_play_time == 120

    assert game.rating == 8.4
    assert game.complexity == 3.85

    assert game.image_url == "https://example.com/gloomhaven.jpg"

    assert "Adventure" in game.categories

    assert "Cooperative Game" in game.mechanics

    assert "Economic" in game.categories
    assert "City Building" in game.categories

    assert "Hand Management" in game.mechanics
    assert "Network and Route Building" in game.mechanics


def test_multiple_mechanics_are_parsed():

    xml = FIXTURE.read_text(encoding="utf-8")

    game = parse_game_metadata(xml)

    assert "Cooperative Game" in game.mechanics
    assert "Campaign / Battle Card Driven" in game.mechanics
    assert "Hand Management" in game.mechanics
    assert "Network and Route Building" in game.mechanics

from bgg.game_parser import (
    parse_games_metadata,
)


def test_parse_multiple_games():
    xml = """
    <items>
        <item
            type="boardgame"
            id="174430"
        >
            <name
                type="primary"
                value="Gloomhaven"
            />
        </item>

        <item
            type="boardgame"
            id="167791"
        >
            <name
                type="primary"
                value="Terraforming Mars"
            />
        </item>
    </items>
    """

    games = (
        parse_games_metadata(
            xml
        )
    )

    assert len(games) == 2

    assert (
        games[0].bgg_id
        == 174430
    )

    assert (
        games[0].name
        == "Gloomhaven"
    )

    assert (
        games[1].bgg_id
        == 167791
    )

    assert (
        games[1].name
        == "Terraforming Mars"
    )