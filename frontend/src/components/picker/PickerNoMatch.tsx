import type {
  PickerNoMatchGuidance,
} from "../../api/client"
import { pickerEmptyKind } from "../../ui-empty-state"


type Props = {
  playerCount: number
  guidance: PickerNoMatchGuidance | null
  hasTimeLimit: boolean
  hasComplexityLimit: boolean
  loading: boolean
  error: string
  onRelaxTime: () => void
  onRelaxComplexity: () => void
  onRelaxBoth: () => void
  onAdjustChoices: () => void
  onStartOver: () => void
  onViewCollection: () => void
}


function PickerNoMatch({
  playerCount,
  guidance,
  hasTimeLimit,
  hasComplexityLimit,
  loading,
  error,
  onRelaxTime,
  onRelaxComplexity,
  onRelaxBoth,
  onAdjustChoices,
  onStartOver,
  onViewCollection,
}: Props) {
  const emptyKind = pickerEmptyKind(guidance)
  const excluded =
    guidance
      ?.player_count_exclusions
    ?? 0

  const showCombinedRelaxation =
    hasTimeLimit
    && hasComplexityLimit
    && Boolean(
      guidance?.can_relax_both
    )
    && !guidance?.can_relax_time
    && !guidance?.can_relax_complexity


  return (
    <section className="screen picker-no-match-screen">
      <div
        className="picker-no-match-icon"
        aria-hidden="true"
      >
        ?
      </div>

      <header>
        <p className="eyebrow">
          Honest answer
        </p>

        <h1>
          {emptyKind === "empty"
            ? "Add games before you pick"
            : "No confident match yet"}
        </h1>

        <p className="subtitle">
          {emptyKind === "empty"
            ? "Picker chooses from the owned games on your shelf. Add a game, then come back to find a fit."
            : <>
                No owned game fits every choice for{" "}
                {playerCount} player
                {playerCount === 1 ? "" : "s"}
                {" "}Adjust your choices or relax a limit below.
              </>}
        </p>
      </header>

      {emptyKind === "no_matches" && excluded > 0 && (
        <div className="picker-trust-note">
          <strong>
            {excluded} game
            {excluded === 1 ? " was" : "s were"}
            {" "}left out
          </strong>

          <p>
            BoardGameGeek voters do not
            recommend
            {excluded === 1 ? " it" : " them"}
            {" "}at {playerCount} player
            {playerCount === 1 ? "" : "s"}.
          </p>
        </div>
      )}

      <div className="picker-no-match-actions">
        {emptyKind === "empty" && (
          <button
            type="button"
            className="primary-button"
            onClick={onViewCollection}
            disabled={loading}
          >
            Open Collection
          </button>
        )}

        {emptyKind === "no_matches" && <>
        {hasTimeLimit
          && guidance?.can_relax_time && (
          <button
            type="button"
            className="primary-button"
            onClick={onRelaxTime}
            disabled={loading}
          >
            {loading
              ? "Checking…"
              : "Remove time limit"}
          </button>
        )}

        {hasComplexityLimit
          && guidance?.can_relax_complexity && (
          <button
            type="button"
            className="primary-button"
            onClick={onRelaxComplexity}
            disabled={loading}
          >
            {loading
              ? "Checking…"
              : "Remove complexity limit"}
          </button>
        )}

        {showCombinedRelaxation && (
          <button
            type="button"
            className="primary-button"
            onClick={onRelaxBoth}
            disabled={loading}
          >
            {loading
              ? "Checking…"
              : "Relax time and complexity"}
          </button>
        )}

        <button
          type="button"
          className="secondary-button"
          onClick={onAdjustChoices}
          disabled={loading}
        >
          Adjust choices
        </button>
        </>}
      </div>

      {error && (
        <p
          className="error-message"
          role="alert"
        >
          {error}
        </p>
      )}

      {emptyKind === "no_matches" && <p className="picker-safety-copy">
        Player-count quality stays fixed.
        We won't suggest a game the community
        rejects at this group size.
      </p>}

      <button
        type="button"
        className="ghost-button"
        onClick={onStartOver}
        disabled={loading}
      >
        Start over
      </button>
    </section>
  )
}


export default PickerNoMatch
