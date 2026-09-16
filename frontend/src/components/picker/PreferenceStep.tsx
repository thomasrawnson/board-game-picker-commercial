import type {
  PickerMode,
  PickerPlayStyle,
} from "../../api/client"


type Props = {
  preferredCategories: string[]
  preferredMechanics: string[]
  maxComplexity: number | null
  youngestPlayerAge: number | null
  playStyle: PickerPlayStyle
  mode: PickerMode
  error: string
  loading: boolean
  onComplexityChange: (
    value: number | null,
  ) => void
  onYoungestPlayerAgeChange: (
    value: number | null,
  ) => void
  onPlayStyleChange: (
    value: PickerPlayStyle,
  ) => void
  onModeChange: (
    mode: PickerMode,
  ) => void
  onOpenTheme: () => void
  onOpenPlayStyle: () => void
  onReveal: () => void
  onBack: () => void
}


const complexityOptions = [
  {
    label: "Any",
    description: "Anything goes",
    value: null,
  },
  {
    label: "Light",
    description: "Up to 2.0",
    value: 2,
  },
  {
    label: "Medium",
    description: "Up to 3.0",
    value: 3,
  },
  {
    label: "Heavy",
    description: "Up to 4.0",
    value: 4,
  },
]


const modeOptions: {
  value: PickerMode
  label: string
  description: string
}[] = [
  {
    value: "best_match",
    label: "Best match",
    description:
      "Give me the strongest fit",
  },
  {
    value: "different",
    label: "Something different",
    description:
      "Bring neglected games forward",
  },
  {
    value: "surprise",
    label: "Surprise me",
    description:
      "Pick a wildcard that still fits",
  },
]


const playStyleOptions: {
  value: PickerPlayStyle
  label: string
}[] = [
  {
    value: "any",
    label: "Either",
  },
  {
    value: "cooperative",
    label: "Cooperative",
  },
  {
    value: "competitive",
    label: "Competitive",
  },
]


const ageOptions = [
  null,
  6,
  8,
  10,
  12,
  14,
  16,
]


function selectionSummary(
  values: string[],
) {
  if (values.length === 0) {
    return "Any"
  }

  if (values.length === 1) {
    return values[0]
  }

  return `${values.length} selected`
}


function PreferenceStep({
  preferredCategories,
  preferredMechanics,
  maxComplexity,
  youngestPlayerAge,
  playStyle,
  mode,
  error,
  loading,
  onComplexityChange,
  onYoungestPlayerAgeChange,
  onPlayStyleChange,
  onModeChange,
  onOpenTheme,
  onOpenPlayStyle,
  onReveal,
  onBack,
}: Props) {
  return (
    <section className="screen picker-step-screen">
      <header>
        <p className="eyebrow">
          Game night
        </p>

        <h1>
          Fine-tune the pick
        </h1>

        <p className="subtitle">
          Keep it broad or add a few
          preferences.
        </p>
      </header>


      <div className="preference-section">
        <p className="preference-label">
          How should we pick?
        </p>

        <div className="picker-mode-list">
          {modeOptions.map(
            (option) => (
              <button
                key={option.value}
                type="button"
                className={
                  mode === option.value
                    ? "picker-mode-option selected"
                    : "picker-mode-option"
                }
                aria-pressed={
                  mode === option.value
                }
                onClick={() =>
                  onModeChange(
                    option.value
                  )
                }
              >
                <strong>
                  {option.label}
                </strong>

                <span>
                  {option.description}
                </span>
              </button>
            ),
          )}
        </div>
      </div>


      <div className="preference-section">
        <p className="preference-label">
          Game type
        </p>

        <div className="play-style-grid">
          {playStyleOptions.map(
            (option) => (
              <button
                key={option.value}
                type="button"
                className={
                  playStyle === option.value
                    ? "preference-chip selected"
                    : "preference-chip"
                }
                aria-pressed={
                  playStyle === option.value
                }
                onClick={() =>
                  onPlayStyleChange(
                    option.value
                  )
                }
              >
                {option.label}
              </button>
            ),
          )}
        </div>
      </div>


      <div className="preference-section">
        <p className="preference-label">
          Complexity
        </p>

        <div className="complexity-grid">
          {complexityOptions.map(
            (option) => {
              const selected =
                maxComplexity ===
                option.value

              return (
                <button
                  key={option.label}
                  type="button"
                  className={
                    selected
                      ? "complexity-option selected"
                      : "complexity-option"
                  }
                  aria-pressed={
                    selected
                  }
                  onClick={() =>
                    onComplexityChange(
                      option.value
                    )
                  }
                >
                  <strong>
                    {option.label}
                  </strong>

                  <span>
                    {option.description}
                  </span>
                </button>
              )
            },
          )}
        </div>
      </div>


      <details className="advanced-filters">
        <summary>
          <span>
            <strong>Advanced filters</strong>
            <small>
              Theme, mechanics and age
            </small>
          </span>
        </summary>

        <div className="preference-link-list">
        <button
          type="button"
          className="picker-navigation-card"
          onClick={
            onOpenTheme
          }
        >
          <span>
            <strong>
              Theme
            </strong>

            <small>
              {selectionSummary(
                preferredCategories
              )}
            </small>
          </span>

          <span
            className="picker-navigation-chevron"
            aria-hidden="true"
          >
            ›
          </span>
        </button>


        <button
          type="button"
          className="picker-navigation-card"
          onClick={
            onOpenPlayStyle
          }
        >
          <span>
            <strong>
              Mechanics
            </strong>

            <small>
              {selectionSummary(
                preferredMechanics
              )}
            </small>
          </span>

          <span
            className="picker-navigation-chevron"
            aria-hidden="true"
          >
            ›
          </span>
        </button>
        </div>

        <div className="advanced-age-filter">
          <p className="preference-label">
            Youngest player age
          </p>

          <div className="age-filter-grid">
            {ageOptions.map(
              (age) => (
                <button
                  key={age ?? "any"}
                  type="button"
                  className={
                    youngestPlayerAge === age
                      ? "preference-chip selected"
                      : "preference-chip"
                  }
                  aria-pressed={
                    youngestPlayerAge === age
                  }
                  onClick={() =>
                    onYoungestPlayerAgeChange(
                      age
                    )
                  }
                >
                  {age === null
                    ? "Any"
                    : `${age}+`}
                </button>
              ),
            )}
          </div>
        </div>
      </details>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="picker-step-actions">
        <button
          type="button"
          className="primary-button"
          onClick={
            onReveal
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Searching the shelf..."
            : mode === "surprise"
              ? "Surprise me"
              : "Reveal a game"}
        </button>

        <button
          type="button"
          className="ghost-button"
          onClick={
            onBack
          }
        >
          Back
        </button>
      </div>
    </section>
  )
}


export default PreferenceStep
