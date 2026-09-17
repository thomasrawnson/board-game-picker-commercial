type Props = {
  maxPlayTime: number | null
  onSelect: (value: number) => void
  onContinue: () => void
  onBack: () => void
}

const timeOptions = [
  {
    label: "Filler",
    description: "≤15 min",
    value: 15,
  },
  {
    label: "Quick",
    description: "≤30 min",
    value: 30,
  },
  {
    label: "Standard",
    description: "≤60 min",
    value: 60,
  },
  {
    label: "Main event",
    description: "≤90 min",
    value: 90,
  },
  {
    label: "Deep dive",
    description: "≤120 min",
    value: 120,
  },
  {
    label: "All night",
    description: "No limit",
    value: 0,
  },
]

function TimeStep({
  maxPlayTime,
  onSelect,
  onContinue,
  onBack,
}: Props) {
  return (
    <section className="screen">
      <header>
        <h1>How long you got?</h1>

        <p className="subtitle">
          We'll only show games that
          fit.
        </p>
      </header>

      <div className="time-list">
        {timeOptions.map(
          (option) => {
            const selected =
              maxPlayTime ===
              option.value

            return (
              <button
                key={option.label}
                className={
                  selected
                    ? "time-option selected"
                    : "time-option"
                }
                onClick={() =>
                  onSelect(
                    option.value,
                  )
                }
              >
                <span className="time-option-main">
                  <span
                    className="time-option-dot"
                    aria-hidden="true"
                  />
                  <strong>
                    {option.label}
                  </strong>
                </span>

                <span className="time-option-meta">
                  {
                    option.description
                  }
                </span>
              </button>
            )
          },
        )}
      </div>

      <button
        className="primary-button"
        disabled={
          maxPlayTime === null
        }
        onClick={onContinue}
      >
        Continue
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

export default TimeStep
