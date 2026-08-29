import type {
  Game,
  GameHistory as GameHistoryData,
} from "../../api/client"

import GameHistory from "./GameHistory"
import PlayLogForm from "./PlayLogForm"

type Props = {
  game: Game
  history: GameHistoryData | null
  historyLoading: boolean
  onBack: () => void
  onPlaySaved: () => Promise<void>
  onRemove: () => Promise<void>
}

function GameDetail({
  game,
  history,
  historyLoading,
  onBack,
  onPlaySaved,
  onRemove,
}: Props) {
  return (
    <section className="screen collection-screen">
      <button
        className="collection-back"
        onClick={onBack}
      >
        ← Back to collection
      </button>

      <article className="collection-detail">
        <div className="collection-detail-image">
          {game.image_url ||
          game.thumbnail_url ? (
            <img
              src={
                game.image_url ??
                game.thumbnail_url ??
                ""
              }
              alt={game.name}
            />
          ) : (
            <div className="collection-placeholder">
              ?
            </div>
          )}
        </div>

        <p className="eyebrow">
          {game.year_published ??
            "Board game"}
        </p>

        <h1>{game.name}</h1>

        <div className="detail-stats">
          <div>
            <strong>
              {game.rating?.toFixed(
                1,
              ) ?? "—"}
            </strong>

            <span>Rating</span>
          </div>

          <div>
            <strong>
              {game.complexity?.toFixed(
                1,
              ) ?? "—"}
            </strong>

            <span>Weight</span>
          </div>

          <div>
            <strong>
              {game.max_play_time ??
                "—"}
            </strong>

            <span>Minutes</span>
          </div>
        </div>

        <PlayLogForm
          game={game}
          onSaved={onPlaySaved}
        />

        <div className="detail-section">
          <p className="preference-label">
            Players
          </p>

          <p>
            {game.min_players ?? "?"}
            –
            {game.max_players ?? "?"}
          </p>
        </div>

        {game.categories.length >
          0 && (
          <div className="detail-section">
            <p className="preference-label">
              Categories
            </p>

            <div className="detail-tags">
              {game.categories.map(
                (category) => (
                  <span
                    key={category}
                  >
                    {category}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        {game.mechanics.length >
          0 && (
          <div className="detail-section">
            <p className="preference-label">
              Mechanics
            </p>

            <div className="detail-tags">
              {game.mechanics.map(
                (mechanic) => (
                  <span
                    key={mechanic}
                  >
                    {mechanic}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        <GameHistory
          history={history}
          loading={
            historyLoading
          }
        />

        <div className="detail-section collection-danger-zone">
          <button
            className="remove-collection-button"
            onClick={onRemove}
          >
            Remove from collection
          </button>
        </div>
      </article>
    </section>
  )
}

export default GameDetail