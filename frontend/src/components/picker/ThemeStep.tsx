type Props = {
  selected: string[]
  onToggle: (
    value: string,
  ) => void
  onClear: () => void
  onDone: () => void
  onBack: () => void
}


const themeOptions = [
  "Adventure",
  "Economic",
  "Fantasy",
  "Science Fiction",
]


function ThemeStep({
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
          Pick a theme
        </h1>

        <p className="subtitle">
          Choose any that sound good
          tonight.
        </p>
      </header>


      <div className="picker-selection-list">
        {themeOptions.map(
          (theme) => {
            const isSelected =
              selected.includes(
                theme
              )

            return (
              <button
                key={theme}
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
                    theme
                  )
                }
              >
                <span>
                  {theme}
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


export default ThemeStep