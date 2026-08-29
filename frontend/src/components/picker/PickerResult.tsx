import type {
  PickerMatch,
  PickerMode,
} from "../../api/client"


type Props = {
  match: PickerMatch
  matchIndex: number
  totalMatches: number
  mode: PickerMode
  hasMoreMatches: boolean
  onTryAnother: () => void
  onViewGame: () => void
  onStartOver: () => void
}


function modeLabel(
  mode: PickerMode,
) {
  if (mode === "different") {
    return "Something different"
  }

  if (mode === "surprise") {
    return "Surprise pick"
  }

  return "Best match"
}


function PickerResult({
  match,
  matchIndex,
  totalMatches,
  mode,
  hasMoreMatches,
  onTryAnother,
  onViewGame,
  onStartOver,
}: Props) {
  return (
    <section className="screen reveal-screen">
      <p className="picker-result-mode">
        {modeLabel(mode)}
      </p>


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
                match.game.image_url ??
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

            <span>
              Match
            </span>
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


          {match.game.complexity !==
            null && (
            <span>
              Weight{" "}
              {match.game.complexity.toFixed(
                1,
              )}
            </span>
          )}
        </div>
      </div>


      <div className="match-reasons">
        <p className="preference-label">
          Why this one?
        </p>

        {match.reasons
          .slice(0, 4)
          .map(
            (reason) => (
              <p key={reason}>
                ✓ {reason}
              </p>
            ),
          )}
      </div>


      <p className="result-count">
        Pick {matchIndex + 1} of{" "}
        {totalMatches}
      </p>


      <div className="reveal-actions">
        <button
          className="secondary-button"
          onClick={
            onTryAnother
          }
          disabled={
            !hasMoreMatches
          }
        >
          {hasMoreMatches
            ? "Try another"
            : "No more matches"}
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


      {!hasMoreMatches &&
        totalMatches > 1 && (
        <p className="picker-exhausted">
          You've seen every game that
          matched these choices.
        </p>
      )}


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