import re


BOARD_GAME_LINK = re.compile(
    r'href=["\']/boardgame/(\d+)(?:/|["\'])',
    re.IGNORECASE,
)


def parse_ranked_game_ids(
    html: str,
) -> list[int]:
    game_ids: list[int] = []
    seen: set[int] = set()

    for match in BOARD_GAME_LINK.finditer(html):
        bgg_id = int(match.group(1))

        if bgg_id in seen:
            continue

        seen.add(bgg_id)
        game_ids.append(bgg_id)

    if not game_ids:
        raise ValueError(
            "No ranked games found in BGG page"
        )

    return game_ids
