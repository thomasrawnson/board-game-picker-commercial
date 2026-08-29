type Props = {
  maxPlayTime: number | null
  onSelect: (value: number) => void
  onContinue: () => void
  onBack: () => void
}

const timeOptions = [
  {
    label: "Quick",
    description: "under 30 min",
    value: 30,
  },
  {
    label: "Standard",
    description: "up to 60 min",
    value: 60,
  },
  {
    label: "Deep dive",
    description: "up to 120 min",
    value: 120,
  },
  {
    label: "All night",
    description: "no limit",
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
        <p className="eyebrow">
          Game night
        </p>

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