import type {
  PickerMatch,
} from "../../api/client"

type Props = {
  match: PickerMatch
  matchIndex: number
  totalMatches: number
  onTryAnother: () => void
  onViewGame: () => void
  onStartOver: () => void
}

function PickerResult({
  match,
  matchIndex,
  totalMatches,
  onTryAnother,
  onViewGame,
  onStartOver,
}: Props) {
  return (
    <section className="screen reveal-screen">
      <div
        className="game-card"
        key={match.game.bgg_id}
      >
        <div className="game-image-wrap">
          {match.game.image_url ||
          match.game.thumbnail_url ? (
            <img
              className="game-image"
              src={
                match.game
                  .image_url ??
                match.game
                  .thumbnail_url ??
                ""
              }
              alt={
                match.game.name
              }
            />
          ) : (
            <div className="image-placeholder">
              ?
            </div>
          )}

          <div className="match-score">
            <strong>
              {match.score}
            </strong>

            <span>Match</span>
          </div>
        </div>

        <h2>
          {match.game.name}
        </h2>

        <div className="game-meta">
          {match.game.min_players !==
            null &&
            match.game.max_players !==
              null && (
              <span>
                {
                  match.game
                    .min_players
                }
                –
                {
                  match.game
                    .max_players
                }{" "}
                players
              </span>
            )}

          {match.game.max_play_time !==
            null && (
            <span>
              {match.game
                .min_play_time ??
                "?"}
              –
              {
                match.game
                  .max_play_time
              }{" "}
              min
            </span>
          )}
        </div>
      </div>

      <div className="match-reasons">
        {match.reasons.map(
          (reason) => (
            <p key={reason}>
              ✓ {reason}
            </p>
          ),
        )}
      </div>

      <p className="result-count">
        {matchIndex + 1} of{" "}
        {totalMatches} matches
      </p>

      <div className="reveal-actions">
        <button
          className="secondary-button"
          onClick={
            onTryAnother
          }
        >
          Try another
        </button>

        <button
          className="primary-button"
          onClick={
            onViewGame
          }
        >
          View game
        </button>
      </div>

      <button
        className="ghost-button"
        onClick={onStartOver}
      >
        Start over
      </button>
    </section>
  )
}

export default PickerResult