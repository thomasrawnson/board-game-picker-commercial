import pytest

from bgg.ranked_parser import parse_ranked_game_ids


def test_ranked_parser_extracts_unique_game_ids():
    html = """
    <a href="/boardgame/1/first-game">First</a>
    <a href="/boardgame/1/first-game">First image</a>
    <a href='/boardgame/2/second-game'>Second</a>
    """

    assert parse_ranked_game_ids(html) == [1, 2]


def test_ranked_parser_rejects_unexpected_page():
    with pytest.raises(ValueError):
        parse_ranked_game_ids(
            "<html><body>Unavailable</body></html>"
        )
