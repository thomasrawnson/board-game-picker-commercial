import type {
  PickerMode,
  PickerPlayStyle,
} from "../../api/client"

import Disclosure
  from "../ui/Disclosure"

import ActionRow
  from "../ui/ActionRow"


type Props = {
  preferredCategories: string[]
  preferredMechanics: string[]
  youngestPlayerAge: number | null
  playStyle: PickerPlayStyle
  mode: PickerMode
  error: string
  loading: boolean
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
  youngestPlayerAge,
  playStyle,
  mode,
  error,
  loading,
  onYoungestPlayerAgeChange,
  onPlayStyleChange,
  onModeChange,
  onOpenTheme,
  onOpenPlayStyle,
  onReveal,
  onBack,
}: Props) {
  return (
    <section className="screen picker-step-screen fine-tune-screen">
      <header>
        <h1>
          Any preferences?
        </h1>

        <p className="subtitle">
          Optional — skip this if you're happy to be surprised.
        </p>
      </header>




      <Disclosure
        label="More preferences"
        hint="Pick style, play style, theme, mechanics and age"
        className="advanced-filters"
      >
        <div className="advanced-pick-style">
          <span className="advanced-preference-label">
            Pick style
          </span>

          <div className="picker-mode-list compact">
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
                  title={option.description}
                  onClick={() =>
                    onModeChange(
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

        <div className="advanced-play-style">
          <span className="advanced-preference-label">
            Play style
          </span>
          <div className="play-style-grid">
            {playStyleOptions.map((option) => (
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
            ))}
          </div>
        </div>

        <div className="preference-link-list">
          <ActionRow
            label="Theme"
            value={selectionSummary(
              preferredCategories,
            )}
            onClick={onOpenTheme}
          />

          <ActionRow
            label="Mechanics"
            value={selectionSummary(
              preferredMechanics,
            )}
            onClick={onOpenPlayStyle}
          />
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
      </Disclosure>


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
              : "Find a game"}
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
