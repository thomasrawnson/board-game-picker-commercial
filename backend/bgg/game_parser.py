import xml.etree.ElementTree as ET

from models.game import Game


def parse_game_metadata(
    xml: str,
) -> Game:
    games = (
        parse_games_metadata(xml)
    )

    if not games:
        raise ValueError(
            "BGG response does not "
            "contain a game"
        )

    return games[0]


def parse_games_metadata(
    xml: str,
) -> list[Game]:
    root = ET.fromstring(xml)

    return [
        _parse_game_item(item)
        for item in root.findall(
            "item"
        )
    ]


def _parse_game_item(
    item,
) -> Game:
    return Game(
        bgg_id=int(
            item.attrib["id"]
        ),
        name=_get_primary_name(
            item
        ),
        year_published=(
            _get_value_int(
                item,
                "yearpublished",
            )
        ),
        min_players=(
            _get_value_int(
                item,
                "minplayers",
            )
        ),
        max_players=(
            _get_value_int(
                item,
                "maxplayers",
            )
        ),
        min_play_time=(
            _get_value_int(
                item,
                "minplaytime",
            )
        ),
        max_play_time=(
            _get_value_int(
                item,
                "maxplaytime",
            )
        ),
        image_url=_get_text(
            item,
            "image",
        ),
        thumbnail_url=_get_text(
            item,
            "thumbnail",
        ),
        rating=_get_rating(
            item
        ),
        complexity=_get_complexity(
            item
        ),
        categories=_get_links(
            item,
            "boardgamecategory",
        ),
        mechanics=_get_links(
            item,
            "boardgamemechanic",
        ),
    )


def _get_primary_name(
    item,
) -> str:
    for name in item.findall(
        "name"
    ):
        if (
            name.attrib.get(
                "type"
            )
            == "primary"
        ):
            return name.attrib[
                "value"
            ]

    raise ValueError(
        "BGG game does not have "
        "a primary name"
    )


def _get_value_int(
    item,
    element_name: str,
) -> int | None:
    element = item.find(
        element_name
    )

    if element is None:
        return None

    value = (
        element.attrib.get(
            "value"
        )
    )

    if value is None:
        return None

    return int(value)


def _get_text(
    item,
    element_name: str,
) -> str | None:
    element = item.find(
        element_name
    )

    if element is None:
        return None

    if element.text is None:
        return None

    return element.text.strip()


def _get_rating(
    item,
) -> float | None:
    element = item.find(
        "./statistics/ratings/average"
    )

    if element is None:
        return None

    value = (
        element.attrib.get(
            "value"
        )
    )

    if value is None:
        return None

    return float(value)


def _get_complexity(
    item,
) -> float | None:
    element = item.find(
        (
            "./statistics/ratings/"
            "averageweight"
        )
    )

    if element is None:
        return None

    value = (
        element.attrib.get(
            "value"
        )
    )

    if value is None:
        return None

    return float(value)


def _get_links(
    item,
    link_type: str,
) -> list[str]:
    return [
        link.attrib["value"]
        for link
        in item.findall("link")
        if (
            link.attrib.get(
                "type"
            )
            == link_type
        )
    ]