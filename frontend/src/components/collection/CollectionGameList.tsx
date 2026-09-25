import type {
  CollectionGameStats,
  Game,
} from "../../api/client"
import ResilientGameArtwork from "../ResilientGameArtwork"
import { collectionEmptyKind } from "../../ui-empty-state"

type Props = {
  games: Game[]
  totalGames: number
  statsByGame: Map<
    number,
    CollectionGameStats
  >
  onOpenGame: (game: Game) => void
  onAddGame: () => void
  onClearFilters: () => void
}

function CollectionGameList({
  games,
  totalGames,
  statsByGame,
  onOpenGame,
  onAddGame,
  onClearFilters,
}: Props) {
  if (games.length === 0) {
    const emptyKind = collectionEmptyKind(totalGames)

    return (
      <div className="collection-empty">
        <strong>
          {emptyKind === "empty"
            ? "Your shelf is empty"
            : "No games match these filters"}
        </strong>
        <p>
          {emptyKind === "empty"
            ? "Add an owned game to start picking and tracking plays."
            : "Clear the search and play filter to see your full collection."}
        </p>
        <button
          type="button"
          className="secondary-button"
          onClick={
            emptyKind === "empty"
              ? onAddGame
              : onClearFilters
          }
        >
          {emptyKind === "empty"
            ? "Add your first game"
            : "Clear filters"}
        </button>
      </div>
    )
  }

  return (
    <div className="collection-list">
      {games.map((game) => {
        const stats =
          statsByGame.get(game.bgg_id)
        const playCount =
          stats?.play_count ?? 0
        const gameMeta = [
          game.year_published,
          game.min_players !== null
          && game.max_players !== null
            ? `${game.min_players}–${game.max_players} players`
            : null,
          game.max_play_time !== null
            ? `${game.max_play_time} min`
            : null,
        ].filter(Boolean)

        return (
          <button
            className="collection-game"
            key={game.bgg_id}
            onClick={() => onOpenGame(game)}
          >
            <div className="collection-thumb">
              <ResilientGameArtwork
                src={game.thumbnail_url ?? game.image_url}
                alt=""
                gameName={game.name}
              />
            </div>

            <div className="collection-game-info">
              <strong>{game.name}</strong>
              {gameMeta.length > 0 && (
                <span className="collection-game-meta">
                  {gameMeta.join(" · ")}
                </span>
              )}
            </div>

            {playCount > 0 && (
              <span className="collection-play-count">
                {`${playCount} ${
                    playCount === 1
                      ? "play"
                      : "plays"
                  }`}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default CollectionGameList
