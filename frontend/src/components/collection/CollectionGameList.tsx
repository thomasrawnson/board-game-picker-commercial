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
          statsByGame.get(
            game.bgg_id,
          )

        return (
          <button
            className="collection-game"
            key={game.bgg_id}
            onClick={() =>
              onOpenGame(game)
            }
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
              <strong>
                {game.name}
              </strong>

              <span>
                {game.min_players ??
                  "?"}
                –
                {game.max_players ??
                  "?"}
                P
                {" · "}
                {game.max_play_time ??
                  "?"}
                MIN
              </span>

              {game.categories.length >
                0 && (
                <small>
                  {game.categories
                    .slice(0, 2)
                    .join(" · ")}
                </small>
              )}

              {!stats ||
              stats.play_count === 0 ? (
                <small className="collection-play-meta">
                  Never played
                </small>
              ) : (
                <small className="collection-play-meta">
                  {stats.play_count}{" "}
                  {stats.play_count ===
                  1
                    ? "play"
                    : "plays"}

                  {stats.last_played_at &&
                    ` · Last played ${new Date(
                      stats.last_played_at,
                    ).toLocaleDateString(
                      undefined,
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}`}
                </small>
              )}
            </div>

            <span className="collection-chevron">
              ›
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CollectionGameList