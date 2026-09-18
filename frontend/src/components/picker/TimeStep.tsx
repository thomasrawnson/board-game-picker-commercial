type Props = {
  maxPlayTime: number | null
  onSelect: (value: number) => void
  onContinue: () => void
  onBack: () => void
}

const timeOptions = [
  { label: "Filler", description: "≤15 min", value: 15 },
  { label: "Quick", description: "≤30 min", value: 30 },
  { label: "Standard", description: "≤60 min", value: 60 },
  { label: "Main event", description: "≤90 min", value: 90 },
  { label: "Deep dive", description: "≤120 min", value: 120 },
  { label: "All night", description: "No limit", value: 0 },
]

function TimeStep({
  maxPlayTime,
  onSelect,
  onContinue,
  onBack,
}: Props) {
  return (
    <section className="screen picker-step-screen time-step-screen">
      <header>
        <h1>How long have you got?</h1>
        <p className="subtitle">Choose the time you have.</p>
      </header>

      <div className="time-grid">
        {timeOptions.map((option) => {
          const selected = maxPlayTime === option.value

          return (
            <button
              key={option.label}
              type="button"
              className={
                selected
                  ? "time-tile selected"
                  : "time-tile"
              }
              aria-pressed={selected}
              onClick={() => onSelect(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          )
        })}
      </div>

      <div className="picker-step-actions">
        <button
          type="button"
          className="primary-button"
          disabled={maxPlayTime === null}
          onClick={onContinue}
        >
          Continue
        </button>

        <button
          type="button"
          className="ghost-button"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </section>
  )
}

export default TimeStep
