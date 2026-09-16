from bgg.collection_parser import (
    parse_collection_expansion_ids,
    parse_collection_ids,
)


def test_collection_parser_separates_expansions():
    xml = """
    <items>
        <item
            objectid="1"
            subtype="boardgame"
        />
        <item
            objectid="2"
            subtype="boardgameexpansion"
        />
        <item objectid="3" />
    </items>
    """

    assert parse_collection_ids(xml) == [
        1,
        3,
    ]
    assert parse_collection_expansion_ids(
        xml
    ) == [2]
