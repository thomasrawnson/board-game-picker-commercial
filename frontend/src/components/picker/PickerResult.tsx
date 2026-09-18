import {
  useRef,
  useState,
  type TouchEvent,
} from "react"

import type {
  PickerMatch,
  PickerMode,
} from "../../api/client"

import PlayLogForm
  from "../collection/PlayLogForm"

import Disclosure
  from "../ui/Disclosure"


type Props = {
  match: PickerMatch
  matchIndex: number
  totalMatches: number
  mode: PickerMode
  playerCount: number
  pickerSessionId: string | null
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


function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14 19 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


function PickerResult({
  match,
  matchIndex,
  totalMatches,
  mode,
  playerCount,
  pickerSessionId,
  hasMoreMatches,
  onTryAnother,
  onViewGame,
  onStartOver,
}: Props) {
  const [shareMessage, setShareMessage] =
    useState("")

  const touchStartX =
    useRef<number | null>(null)

  const game = match.game
  const coverUrl =
    game.image_url ?? game.thumbnail_url ?? null

  const playerText =
    game.min_players !== null
    && game.max_players !== null
      ? game.min_players === game.max_players
        ? `${game.min_players} players`
        : `${game.min_players}–${game.max_players} players`
      : null

  const timeText =
    game.max_play_time !== null
      ? game.min_play_time !== null
        && game.min_play_time === game.max_play_time
        ? `${game.max_play_time} min`
        : `${game.min_play_time ?? "?"}–${game.max_play_time} min`
      : null

  const weightText =
    game.complexity !== null
      ? game.complexity <= 2
        ? "Light"
        : game.complexity <= 3
          ? "Medium"
          : "Heavy"
      : null

  const score = Math.round(match.score)
  const primaryReason =
    match.reasons[0]
    ?? (
      match.ai_used
      && match.ai_explanation
        ? match.ai_explanation
        : null
    )


  async function sharePick() {
    const reason =
      match.ai_used
      && match.ai_explanation
        ? match.ai_explanation
        : match.reasons[0]

    const text = [
      `Tonight's pick: ${game.name}`,
      `${playerCount} player${
        playerCount === 1 ? "" : "s"
      }`,
      reason ? `Why: ${reason}` : null,
      "Picked with ShelfPick",
    ]
      .filter(Boolean)
      .join("\n")

    setShareMessage("")

    try {
      if (navigator.share) {
        await navigator.share({
          title: game.name,
          text,
        })
        setShareMessage("Pick shared.")
        return
      }

      await navigator.clipboard.writeText(text)
      setShareMessage("Pick copied.")
    } catch (err) {
      if (
        err instanceof DOMException
        && err.name === "AbortError"
      ) {
        return
      }

      console.error(err)
      setShareMessage(
        "Couldn't share this pick.",
      )
    }
  }

  function handleTouchStart(
    event: TouchEvent<HTMLElement>,
  ) {
    touchStartX.current =
      event.changedTouches[0]?.clientX ?? null
  }

  function handleTouchEnd(
    event: TouchEvent<HTMLElement>,
  ) {
    const startX = touchStartX.current
    const endX =
      event.changedTouches[0]?.clientX ?? null

    touchStartX.current = null

    if (
      startX === null
      || endX === null
      || !hasMoreMatches
    ) {
      return
    }

    if (startX - endX > 70) {
      onTryAnother()
    }
  }


  return (
    <section
      className="screen reveal-screen picker-result-card"
      aria-labelledby="picker-result-title"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="picker-result-topbar">
        <p className="picker-result-mode">
          {modeLabel(mode)}
        </p>

        <button
          type="button"
          className="picker-share-icon-button"
          onClick={sharePick}
          aria-label={`Share ${game.name}`}
          title="Share"
        >
          <ShareIcon />
        </button>
      </div>

      <button
        type="button"
        className="picker-hero-link"
        onClick={onViewGame}
        aria-label={`View ${game.name}`}
      >
        <div className="picker-cover-wrap">
          {coverUrl ? (
            <img
              className="picker-cover-image"
              src={coverUrl}
              alt=""
            />
          ) : (
            <div
              className="picker-cover-placeholder"
              aria-hidden="true"
            >
              Cover art
            </div>
          )}

          <div
            className="picker-match-score"
            aria-label={`Match score ${score}`}
          >
            <strong>{score}</strong>
            <span>Match</span>
          </div>
        </div>

        <div className="picker-result-copy">
          <h2
            id="picker-result-title"
            className="picker-result-title"
          >
            {game.name}
          </h2>

          <div className="picker-result-meta">
            {playerText && <span>{playerText}</span>}
            {playerText && timeText && <span>·</span>}
            {timeText && <span>{timeText}</span>}
            {(playerText || timeText) && weightText && <span>·</span>}
            {weightText && <span>{weightText}</span>}
          </div>
        </div>
      </button>


      {primaryReason && (
        <p className="picker-primary-reason">
          {primaryReason}
        </p>
      )}

      {(match.reasons.length > 0
        || (
          match.ai_used
          && match.ai_explanation
        )) && (
        <Disclosure
          label="Why this pick?"
          className="picker-reason-details"
        >
          <div className="picker-reason-detail-body">
            {match.ai_used
              && match.ai_explanation
              && (
              <p>
                {match.ai_explanation}
              </p>
            )}

            {match.reasons.length > 0 && (
              <ul>
                {match.reasons
                  .slice(1, 4)
                  .map((reason) => (
                    <li key={reason}>
                      {reason}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </Disclosure>
      )}

      <div className="picker-primary-action">
        <PlayLogForm
          key={game.bgg_id}
          game={game}
          initialPlayerCount={playerCount}
          pickerSessionId={pickerSessionId}
          onSaved={async () => {}}
        />
      </div>

      <div className="picker-result-footer">
        <span>
          Pick {matchIndex + 1} of {totalMatches}
        </span>

        <div className="picker-result-links">
          <button
            type="button"
            className="try-another-link"
            onClick={onTryAnother}
            disabled={!hasMoreMatches}
          >
            {hasMoreMatches
              ? "Try another"
              : "No more matches"}
          </button>
        </div>
      </div>

      {shareMessage && (
        <p className="share-message" role="status">
          {shareMessage}
        </p>
      )}

      {hasMoreMatches && (
        <p className="picker-swipe-hint">
          Swipe left to try another
        </p>
      )}

      {!hasMoreMatches
        && totalMatches > 1 && (
        <p className="picker-exhausted">
          You've seen every matching game.
        </p>
      )}

      <button
        type="button"
        className="picker-start-over"
        onClick={onStartOver}
      >
        Start over
      </button>
    </section>
  )
}


export default PickerResult
