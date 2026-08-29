type Props = {
  preferredCategories: string[]
  preferredMechanics: string[]
  error: string
  loading: boolean
  onToggleCategory: (
    category: string,
  ) => void
  onToggleMechanic: (
    mechanic: string,
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

function PreferenceStep({
  preferredCategories,
  preferredMechanics,
  error,
  loading,
  onToggleCategory,
  onToggleMechanic,
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
          Optional — choose anything
          that sounds good.
        </p>
      </header>

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