from pathlib import Path
from bgg.game_parser import parse_game_metadata
from models.game import PlayerCountPoll


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
    assert game.min_age == 14
    assert game.min_age_checked is True

    assert game.rating == 8.4
    assert game.complexity == 3.85

    assert game.image_url == "https://example.com/gloomhaven.jpg"

    assert "Adventure" in game.categories

    assert "Cooperative Game" in game.mechanics

    assert "Economic" in game.categories
    assert "City Building" in game.categories

    assert "Hand Management" in game.mechanics
    assert "Network and Route Building" in game.mechanics
    assert game.designers == ["Cephalofair Designer"]
    assert game.publishers == ["Cephalofair Games"]
    assert game.credits_checked is True


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


def test_expansion_type_is_parsed():
    game = parse_game_metadata(
        """
        <items>
            <item
                type="boardgameexpansion"
                id="999"
            >
                <name
                    type="primary"
                    value="Example Expansion"
                />
            </item>
        </items>
        """
    )

    assert game.is_expansion is True
    assert game.expansion_checked is True


def test_inbound_expansion_link_identifies_expansion():
    game = parse_game_metadata(
        """
        <items>
            <item
                type="boardgame"
                id="999"
            >
                <name
                    type="primary"
                    value="Example Expansion"
                />
                <link
                    type="boardgameexpansion"
                    id="1"
                    value="Base Game"
                    inbound="true"
                />
            </item>
        </items>
        """
    )

    assert game.is_expansion is True
    assert game.expansion_checked is True


def test_outbound_expansion_link_keeps_base_game():
    game = parse_game_metadata(
        """
        <items>
            <item
                type="boardgame"
                id="1"
            >
                <name
                    type="primary"
                    value="Base Game"
                />
                <link
                    type="boardgameexpansion"
                    id="999"
                    value="Example Expansion"
                />
            </item>
        </items>
        """
    )

    assert game.is_expansion is False
    assert game.expansion_checked is True

def test_player_count_recommendations_are_parsed():
    xml = """
    <items>
        <item
            type="boardgame"
            id="1"
        >
            <name
                type="primary"
                value="Example Game"
            />

            <poll
                name="suggested_numplayers"
            >
                <results numplayers="2">
                    <result
                        value="Best"
                        numvotes="40"
                    />
                    <result
                        value="Recommended"
                        numvotes="20"
                    />
                    <result
                        value="Not Recommended"
                        numvotes="5"
                    />
                </results>

                <results numplayers="3">
                    <result
                        value="Best"
                        numvotes="10"
                    />
                    <result
                        value="Recommended"
                        numvotes="30"
                    />
                    <result
                        value="Not Recommended"
                        numvotes="5"
                    />
                </results>

                <results numplayers="4">
                    <result
                        value="Best"
                        numvotes="2"
                    />
                    <result
                        value="Recommended"
                        numvotes="3"
                    />
                    <result
                        value="Not Recommended"
                        numvotes="20"
                    />
                </results>
            </poll>
        </item>
    </items>
    """

    game = parse_game_metadata(
        xml
    )

    assert (
        game.best_player_counts
        == [2]
    )

    assert (
        game.recommended_player_counts
        == [2, 3]
    )

    assert game.player_count_poll == [
        PlayerCountPoll(2, 40, 20, 5, 65),
        PlayerCountPoll(3, 10, 30, 5, 45),
        PlayerCountPoll(4, 2, 3, 20, 25),
    ]


def test_study_in_emerald_two_player_poll_is_retained():
    xml = """
    <items>
        <item type="boardgame" id="178054">
            <name
                type="primary"
                value="A Study in Emerald (Second Edition)"
            />
            <poll name="suggested_numplayers">
                <results numplayers="2">
                    <result value="Best" numvotes="0" />
                    <result value="Recommended" numvotes="9" />
                    <result
                        value="Not Recommended"
                        numvotes="40"
                    />
                </results>
            </poll>
        </item>
    </items>
    """

    game = parse_game_metadata(xml)

    assert game.player_count_poll == [
        PlayerCountPoll(
            player_count=2,
            best_votes=0,
            recommended_votes=9,
            not_recommended_votes=40,
            total_votes=49,
        )
    ]
