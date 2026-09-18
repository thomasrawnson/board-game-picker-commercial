type Props = {
  players: number | null
  selectedPlayerIds: number[]
  maxComplexity: number | null
  onSelectCount:
    (players: number | null) => void
  onComplexityChange:
    (value: number | null) => void
  onChoosePlayers: () => void
  onContinue: () => void
}


const playerOptions = [
  1,
  2,
  3,
  4,
  5,
  6,
]


const complexityOptions = [
  {
    label: "Any",
    value: null,
  },
  {
    label: "Light",
    value: 2,
  },
  {
    label: "Medium",
    value: 3,
  },
  {
    label: "Heavy",
    value: 4,
  },
]


function PlayerStep({
  players,
  selectedPlayerIds,
  maxComplexity,
  onSelectCount,
  onComplexityChange,
  onChoosePlayers,
  onContinue,
}: Props) {
  function chooseCount(
    count: number,
  ) {
    onSelectCount(
      count
    )
  }


  return (
    <section className="screen picker-step-screen player-step-screen">
      <header>
        <h1>
          Who's playing?
        </h1>

        <p className="subtitle">
          Choose friends or pick a
          group size.
        </p>
      </header>


      <button
        type="button"
        className="picker-navigation-card"
        onClick={
          onChoosePlayers
        }
      >
        <span>
          <strong>
            Choose friends
          </strong>

          <small>
            {selectedPlayerIds.length
              > 0
              ? `${selectedPlayerIds.length} friend${
                  selectedPlayerIds.length
                  === 1
                    ? ""
                    : "s"
                } selected`
              : "Select from your regular group"}
          </small>
        </span>

        <span
          className="picker-navigation-chevron"
          aria-hidden="true"
        >
          ›
        </span>
      </button>


      <p className="player-or">
        or choose a group size
      </p>


      <div className="player-grid">
        {playerOptions.map(
          (option) => (
            <button
              key={option}
              type="button"
              className={
                players === option
                && selectedPlayerIds
                  .length === 0
                  ? option === 1
                    ? "player-chip solo selected"
                    : "player-chip selected"
                  : option === 1
                    ? "player-chip solo"
                    : "player-chip"
              }
              aria-label={
                option === 1
                  ? "Solo"
                  : `${option === 6 ? "6 or more" : option} players`
              }
              onClick={() =>
                chooseCount(
                  option
                )
              }
            >
              <strong>
                {option === 1
                  ? "Solo"
                  : option === 6
                    ? "6+"
                    : option}
              </strong>
            </button>
          ),
        )}
      </div>


      <div className="preference-section player-complexity-section">
        <p className="preference-label">
          Complexity
        </p>

        <div className="complexity-grid">
          {complexityOptions.map(
            (option) => {
              const selected =
                maxComplexity === option.value

              return (
                <button
                  key={option.label}
                  type="button"
                  className={
                    selected
                      ? "complexity-option selected"
                      : "complexity-option"
                  }
                  aria-pressed={selected}
                  onClick={() =>
                    onComplexityChange(
                      option.value
                    )
                  }
                >
                  <strong>
                    {option.label}
                  </strong>
                </button>
              )
            },
          )}
        </div>
      </div>


      <div className="picker-step-actions">
        <button
          type="button"
          className="primary-button"
          disabled={
            players === null
          }
          onClick={
            onContinue
          }
        >
          Continue
        </button>
      </div>
    </section>
  )
}


export {
  PlayerStep,
}
