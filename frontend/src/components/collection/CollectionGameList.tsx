import type {
  CollectionGameStats,
  Game,
} from "../../api/client"
import ResilientGameArtwork from "../ResilientGameArtwork"

type Props = {
  games: Game[]
  statsByGame: Map<
    number,
    CollectionGameStats
  >
  onOpenGame: (game: Game) => void
}

function CollectionGameList({
  games,
  statsByGame,
  onOpenGame,
}: Props) {
  if (games.length === 0) {
    return (
      <p className="collection-empty">
        Nothing on the shelf matches that — try loosening a filter.
      </p>
    )
  }

  return (
    <div className="collection-list">
      {games.map((game) => {
        const stats =
          statsByGame.get(game.bgg_id)
        const playCount =
          stats?.play_count ?? 0

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

              {playCount === 0 && (
                <span>Not played</span>
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
