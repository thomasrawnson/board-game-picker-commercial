type Props = {
  players: number | null
  selectedPlayerIds: number[]
  onSelectCount:
    (players: number | null) => void
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


function PlayerStep({
  players,
  selectedPlayerIds,
  onSelectCount,
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
    <section className="screen picker-step-screen">
      <header>
        <h1>
          Who's playing?
        </h1>

        <p className="subtitle">
          Choose your regular players
          or just pick a group size.
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
            Choose players
          </strong>

          <small>
            {selectedPlayerIds.length
              > 0
              ? `${selectedPlayerIds.length} regular player${
                  selectedPlayerIds.length
                  === 1
                    ? ""
                    : "s"
                } selected`
              : "Select regular players"}
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
              onClick={() =>
                chooseCount(
                  option
                )
              }
            >
              <strong>
                {option === 6
                  ? "6+"
                  : option}
              </strong>

              <span>
                {option === 1
                  ? "Solo"
                  : "Players"}
              </span>
            </button>
          ),
        )}
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