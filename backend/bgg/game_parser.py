import xml.etree.ElementTree as ET

from models.game import Game
from models.game import PlayerCountPoll


def parse_game_metadata(
    xml: str,
) -> Game:
    games = parse_games_metadata(
        xml
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
    root = ET.fromstring(
        xml
    )

    return [
        _parse_game_item(item)
        for item
        in root.findall(
            "item"
        )
    ]


def _parse_game_item(
    item,
) -> Game:
    (
        best_player_counts,
        recommended_player_counts,
        player_count_poll,
    ) = _get_player_count_recommendations(
        item
    )

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
        best_player_counts=(
            best_player_counts
        ),
        recommended_player_counts=(
            recommended_player_counts
        ),
        player_count_poll=(
            player_count_poll
        ),
        is_expansion=_is_expansion(
            item
        ),
        expansion_checked=True,
    )


def _is_expansion(item) -> bool:
    if (
        item.attrib.get("type")
        == "boardgameexpansion"
    ):
        return True

    return any(
        link.attrib.get("type")
        == "boardgameexpansion"
        and link.attrib.get("inbound")
        == "true"
        for link in item.findall("link")
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


def _get_player_count_recommendations(
    item,
) -> tuple[
    list[int],
    list[int],
    list[PlayerCountPoll],
]:
    poll = item.find(
        (
            "./poll"
            "[@name='suggested_numplayers']"
        )
    )

    if poll is None:
        return [], [], []

    best_player_counts: list[int] = []
    recommended_player_counts: list[int] = []
    player_count_poll: list[PlayerCountPoll] = []

    for result in poll.findall(
        "results"
    ):
        num_players = (
            result.attrib.get(
                "numplayers"
            )
        )

        if num_players is None:
            continue

        try:
            player_count = int(
                num_players
            )
        except ValueError:
            # BGG can include values
            # such as "4+".
            continue

        votes = {
            vote.attrib.get(
                "value"
            ): int(
                vote.attrib.get(
                    "numvotes",
                    "0",
                )
            )
            for vote
            in result.findall(
                "result"
            )
        }

        best_votes = (
            votes.get(
                "Best",
                0,
            )
        )

        recommended_votes = (
            votes.get(
                "Recommended",
                0,
            )
        )

        not_recommended_votes = (
            votes.get(
                "Not Recommended",
                0,
            )
        )

        player_count_poll.append(
            PlayerCountPoll(
                player_count=player_count,
                best_votes=best_votes,
                recommended_votes=(
                    recommended_votes
                ),
                not_recommended_votes=(
                    not_recommended_votes
                ),
                total_votes=(
                    best_votes
                    + recommended_votes
                    + not_recommended_votes
                ),
            )
        )

        if (
            best_votes
            > recommended_votes
            and best_votes
            > not_recommended_votes
        ):
            best_player_counts.append(
                player_count
            )

            recommended_player_counts.append(
                player_count
            )

            continue

        if (
            best_votes
            + recommended_votes
            > not_recommended_votes
        ):
            recommended_player_counts.append(
                player_count
            )

    return (
        best_player_counts,
        recommended_player_counts,
        player_count_poll,
    )
