import type {
  PickerMode,
} from "../../api/client"


type Props = {
  preferredCategories: string[]
  preferredMechanics: string[]
  maxComplexity: number | null
  mode: PickerMode
  error: string
  loading: boolean
  onToggleCategory: (
    category: string,
  ) => void
  onToggleMechanic: (
    mechanic: string,
  ) => void
  onComplexityChange: (
    value: number | null,
  ) => void
  onModeChange: (
    mode: PickerMode,
  ) => void
  onReveal: () => void
  onBack: () => void
}


const categoryOptions = [
  "Adventure",
  "Economic",
  "Fantasy",
  "Science Fiction",
]


const mechanicOptions = [
  "Cooperative Game",
  "Deck Building",
  "Hand Management",
  "Worker Placement",
]


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


function PreferenceStep({
  preferredCategories,
  preferredMechanics,
  maxComplexity,
  mode,
  error,
  loading,
  onToggleCategory,
  onToggleMechanic,
  onComplexityChange,
  onModeChange,
  onReveal,
  onBack,
}: Props) {
  return (
    <section className="screen">
      <header>
        <p className="eyebrow">
          Game night
        </p>

        <h1>
          What are you in the mood
          for?
        </h1>

        <p className="subtitle">
          Fine-tune it, or leave the
          choices open.
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
                className={
                  mode === option.value
                    ? "picker-mode-option selected"
                    : "picker-mode-option"
                }
                onClick={() =>
                  onModeChange(
                    option.value,
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
          Weight
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
                  className={
                    selected
                      ? "complexity-option selected"
                      : "complexity-option"
                  }
                  onClick={() =>
                    onComplexityChange(
                      option.value,
                    )
                  }
                >
                  <strong>
                    {option.label}
                  </strong>

                  <span>
                    {
                      option.description
                    }
                  </span>
                </button>
              )
            },
          )}
        </div>
      </div>


      <div className="preference-section">
        <p className="preference-label">
          Theme
        </p>

        <div className="preference-grid">
          {categoryOptions.map(
            (category) => (
              <button
                key={category}
                className={
                  preferredCategories.includes(
                    category,
                  )
                    ? "preference-chip selected"
                    : "preference-chip"
                }
                onClick={() =>
                  onToggleCategory(
                    category,
                  )
                }
              >
                {category}
              </button>
            ),
          )}
        </div>
      </div>


      <div className="preference-section">
        <p className="preference-label">
          Play style
        </p>

        <div className="preference-grid">
          {mechanicOptions.map(
            (mechanic) => (
              <button
                key={mechanic}
                className={
                  preferredMechanics.includes(
                    mechanic,
                  )
                    ? "preference-chip selected"
                    : "preference-chip"
                }
                onClick={() =>
                  onToggleMechanic(
                    mechanic,
                  )
                }
              >
                {mechanic}
              </button>
            ),
          )}
        </div>
      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <button
        className="primary-button"
        onClick={onReveal}
        disabled={loading}
      >
        {loading
          ? "Searching the shelf..."
          : mode === "surprise"
            ? "Surprise me"
            : "Reveal a game"}
      </button>


      <button
        className="ghost-button"
        onClick={onBack}
      >
        Back
      </button>
    </section>
  )
}


export default PreferenceStep