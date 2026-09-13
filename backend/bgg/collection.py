from models.game import Game

def enrich_collection(
    collection: list[Game],
    metadata: dict[int, Game],
) -> list[Game]:
    enriched_games = []

    for game in collection:
        details = metadata.get(game.bgg_id)

        if details is None:
            enriched_games.append(game)
            continue

        game.year_published = details.year_published
        game.min_players = details.min_players
        game.max_players = details.max_players
        game.min_play_time = details.min_play_time
        game.max_play_time = details.max_play_time

        game.complexity = details.complexity
        game.rating = details.rating

        game.image_url = details.image_url
        game.thumbnail_url = details.thumbnail_url

        game.categories = details.categories
        game.mechanics = details.mechanics

        enriched_games.append(game)

    return enriched_games