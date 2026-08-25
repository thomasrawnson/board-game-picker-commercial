import xml.etree.ElementTree as ET

from models.game import Game


def parse_collection(xml: str) -> list[Game]:
    root = ET.fromstring(xml)

    games = []

    for item in root.findall("item"):
        game = Game(
            bgg_id=int(item.attrib["objectid"]),
            name=item.find("name").attrib["value"],
            year_published=_get_int_attribute(
                item.find("yearpublished"),
                "value",
            ),
            min_players=_get_int_attribute(
                item.find("stats"),
                "minplayers",
            ),
            max_players=_get_int_attribute(
                item.find("stats"),
                "maxplayers",
            ),
            min_play_time=_get_int_attribute(
                item.find("stats"),
                "minplaytime",
            ),
            max_play_time=_get_int_attribute(
                item.find("stats"),
                "maxplaytime",
            ),
            rating=_get_rating(item),
            owned=item.attrib.get("own") == "1",
        )

        games.append(game)

    return games


def _get_int_attribute(element, attribute: str) -> int | None:
    if element is None:
        return None

    value = element.attrib.get(attribute)

    if value is None:
        return None

    return int(value)


def _get_rating(item) -> float | None:
    rating = item.find("./stats/rating")

    if rating is None:
        return None

    value = rating.attrib.get("value")

    if value is None:
        return None

    return float(value)

def parse_game(xml_text: str) -> Game:
    root = ET.fromstring(xml_text)

    item = root.find("item")

    if item is None:
        raise ValueError("No game found in BGG response")

    categories = [
        link.attrib["value"]
        for link in item.findall("link")
        if link.attrib.get("type")
        == "boardgamecategory"
    ]

    mechanics = [
        link.attrib["value"]
        for link in item.findall("link")
        if link.attrib.get("type")
        == "boardgamemechanic"
    ]

    return Game(
        # existing fields...
        categories=categories,
        mechanics=mechanics,
    )