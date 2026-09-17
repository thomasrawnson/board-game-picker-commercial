import type {
  CollectionGameStats,
  Game,
} from "../../api/client"

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
        No games match these filters.
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
              {game.thumbnail_url ||
              game.image_url ? (
                <img
                  src={
                    game.thumbnail_url ??
                    game.image_url ??
                    ""
                  }
                  alt=""
                />
              ) : (
                <span>?</span>
              )}
            </div>

            <div className="collection-game-info">
              <strong>{game.name}</strong>
              <span>
                {game.min_players ?? "?"}
                –
                {game.max_players ?? "?"}
                {" players · "}
                {game.max_play_time ?? "?"}
                {" min"}
              </span>
            </div>

            <span
              className={
                playCount > 0
                  ? "collection-play-count"
                  : "collection-play-count muted"
              }
            >
              {playCount > 0
                ? `${playCount} ${
                    playCount === 1
                      ? "play"
                      : "plays"
                  }`
                : "Not played"}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CollectionGameList
