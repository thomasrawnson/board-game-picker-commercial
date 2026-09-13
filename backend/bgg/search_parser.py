import xml.etree.ElementTree as ET


def parse_search_results(
    xml: str,
) -> list[dict]:
    root = ET.fromstring(
        xml
    )

    results: list[dict] = []

    for item in root.findall(
        "item"
    ):
        bgg_id = item.get(
            "id"
        )

        name_element = item.find(
            "name"
        )

        if (
            not bgg_id
            or name_element is None
        ):
            continue

        name = name_element.get(
            "value"
        )

        if not name:
            continue

        year_element = item.find(
            "yearpublished"
        )

        year = None

        if year_element is not None:
            value = year_element.get(
                "value"
            )

            if value:
                try:
                    year = int(
                        value
                    )
                except ValueError:
                    pass

        try:
            parsed_bgg_id = int(
                bgg_id
            )
        except ValueError:
            continue

        results.append(
            {
                "bgg_id":
                    parsed_bgg_id,
                "name":
                    name,
                "year_published":
                    year,
            }
        )

    return results