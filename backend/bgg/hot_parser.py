import xml.etree.ElementTree as ET


def parse_hot_game_ids(
    xml: str,
) -> list[int]:
    root = ET.fromstring(
        xml
    )

    ids: list[int] = []

    for item in root.findall(
        "item"
    ):
        value = item.get(
            "id"
        )

        if not value:
            continue

        try:
            ids.append(
                int(value)
            )
        except ValueError:
            continue

    return ids