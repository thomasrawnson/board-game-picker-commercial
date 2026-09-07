import {
  useEffect,
  useState,
} from "react"

import {
  getPlayers,
  type Player,
} from "../../api/client"


type Props = {
  players: number | null
  selectedPlayerIds: number[]
  onSelectCount:
    (players: number) => void
  onSelectPlayers:
    (playerIds: number[]) => void
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
  selectedPlayerIds,
  onSelectCount,
  onSelectPlayers,
  onContinue,
}: Props) {
  const [
    knownPlayers,
    setKnownPlayers,
  ] = useState<Player[]>([])


  useEffect(() => {
    async function loadPlayers() {
      try {
        const result =
          await getPlayers()

        setKnownPlayers(
          result
        )
      } catch (err) {
        console.error(err)
      }
    }

    loadPlayers()
  }, [])


  function togglePlayer(
    playerId: number,
  ) {
    if (
      selectedPlayerIds.includes(
        playerId
      )
    ) {
      const next =
        selectedPlayerIds.filter(
          (id) =>
            id !== playerId
        )

      onSelectPlayers(
        next
      )

      if (next.length > 0) {
        onSelectCount(
          next.length
        )
      }

      return
    }

    const next = [
      ...selectedPlayerIds,
      playerId,
    ]

    onSelectPlayers(
      next
    )

    onSelectCount(
      next.length
    )
  }


  function chooseCount(
    count: number,
  ) {
    onSelectPlayers([])
    onSelectCount(count)
  }


  return (
    <section className="screen">
      <header>
        <p className="eyebrow">
          Game night
        </p>

        <h1>
          Who's playing?
        </h1>

        <p className="subtitle">
          Choose your regular players
          or just pick a group size.
        </p>
      </header>


      {knownPlayers.length > 0 && (
        <div className="known-player-section">
          <p className="preference-label">
            Players
          </p>

          <div className="known-player-grid">
            {knownPlayers.map(
              (player) => {
                const selected =
                  selectedPlayerIds
                    .includes(
                      player.id
                    )

                return (
                  <button
                    key={player.id}
                    type="button"
                    className={
                      selected
                        ? "known-player-chip selected"
                        : "known-player-chip"
                    }
                    onClick={() =>
                      togglePlayer(
                        player.id
                      )
                    }
                  >
                    {player.name}
                  </button>
                )
              },
            )}
          </div>

          <p className="player-or">
            or choose a group size
          </p>
        </div>
      )}


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
                  ? "player-chip selected"
                  : "player-chip"
              }
              onClick={() =>
                chooseCount(
                  option
                )
              }
            >
              <strong>
                {option === 7
                  ? "7+"
                  : option}
              </strong>

              <span>
                Players
              </span>
            </button>
          ),
        )}
      </div>


      {selectedPlayerIds.length > 0 && (
        <p className="selected-player-count">
          {selectedPlayerIds.length}
          {" "}
          selected
        </p>
      )}


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
    </section>
  )
}


export { PlayerStep }