type Props = {
  selected: string[]
  onToggle: (
    value: string,
  ) => void
  onClear: () => void
  onDone: () => void
  onBack: () => void
}


const playStyleOptions = [
  "Cooperative Game",
  "Deck Building",
  "Hand Management",
  "Worker Placement",
]


function PlayStyleStep({
  selected,
  onToggle,
  onClear,
  onDone,
  onBack,
}: Props) {
  return (
    <section className="screen picker-selection-screen">
      <header>
        <p className="eyebrow">
          Preferences
        </p>

        <h1>
          Pick a play style
        </h1>

        <p className="subtitle">
          Choose the kind of game
          you feel like playing.
        </p>
      </header>


      <div className="picker-selection-list">
        {playStyleOptions.map(
          (style) => {
            const isSelected =
              selected.includes(
                style
              )

            return (
              <button
                key={style}
                type="button"
                className={
                  isSelected
                    ? "picker-selection-row selected"
                    : "picker-selection-row"
                }
                aria-pressed={
                  isSelected
                }
                onClick={() =>
                  onToggle(
                    style
                  )
                }
              >
                <span>
                  {style}
                </span>

                <span
                  className={
                    isSelected
                      ? "picker-selection-check selected"
                      : "picker-selection-check"
                  }
                  aria-hidden="true"
                >
                  {isSelected
                    ? "✓"
                    : ""}
                </span>
              </button>
            )
          },
        )}
      </div>


      <div className="picker-selection-footer">
        {selected.length > 0 && (
          <button
            type="button"
            className="picker-clear-button"
            onClick={
              onClear
            }
          >
            Clear selection
          </button>
        )}

        <button
          type="button"
          className="primary-button"
          onClick={
            onDone
          }
        >
          Done
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


export default PlayStyleStep