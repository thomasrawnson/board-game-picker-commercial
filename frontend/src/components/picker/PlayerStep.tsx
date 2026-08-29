type Props = {
  players: number | null
  onSelect: (players: number) => void
  onContinue: () => void
}

const playerOptions = [
  2,
  3,
  4,
  5,
  6,
  7,
]

function PlayerStep({
  players,
  onSelect,
  onContinue,
}: Props) {
  return (
    <section className="screen">
      <header>
        <p className="eyebrow">
          Game night
        </p>

        <h1>Who's playing?</h1>

        <p className="subtitle">
          Pick a number, we'll do the
          rest.
        </p>
      </header>

      <div className="player-grid">
        {playerOptions.map(
          (option) => (
            <button
              key={option}
              className={
                players === option
                  ? "player-chip selected"
                  : "player-chip"
              }
              onClick={() =>
                onSelect(option)
              }
            >
              <strong>
                {option === 7
                  ? "7+"
                  : option}
              </strong>

              <span>Players</span>
            </button>
          ),
        )}
      </div>

      <button
        className="primary-button"
        disabled={
          players === null
        }
        onClick={onContinue}
      >
        Continue
      </button>
    </section>
  )
}

export { PlayerStep }