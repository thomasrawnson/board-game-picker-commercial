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
    (players: number | null) => void
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

  const [
    playerPickerOpen,
    setPlayerPickerOpen,
  ] = useState(false)


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

      onSelectCount(
        next.length > 0
          ? next.length
          : null
      )

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


  const selectedPlayers =
    knownPlayers.filter(
      (player) =>
        selectedPlayerIds.includes(
          player.id
        ),
    )


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
          <button
            type="button"
            className="player-picker-trigger"
            onClick={() =>
              setPlayerPickerOpen(
                true
              )
            }
          >
            <span>
              Choose players
            </span>

            <strong>
              {
                selectedPlayerIds
                  .length > 0
                  ? `${
                      selectedPlayerIds
                        .length
                    } selected`
                  : "Optional"
              }
            </strong>
          </button>


          {
            selectedPlayers.length
            > 0
            && (
              <div className="selected-player-summary">
                {
                  selectedPlayers.map(
                    (player) => (
                      <span
                        key={
                          player.id
                        }
                        className="selected-player-pill"
                      >
                        {
                          player.name
                        }
                      </span>
                    ),
                  )
                }
              </div>
            )
          }


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
                {
                  option === 7
                    ? "7+"
                    : option
                }
              </strong>

              <span>
                Players
              </span>
            </button>
          ),
        )}
      </div>


      {
        selectedPlayerIds.length
        > 0
        && (
          <p className="selected-player-count">
            {
              selectedPlayerIds
                .length
            }
            {" "}
            selected
          </p>
        )
      }


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


      {
        playerPickerOpen
        && (
          <div
            className="player-picker-backdrop"
            onClick={() =>
              setPlayerPickerOpen(
                false
              )
            }
          >
            <div
              className="player-picker-panel"
              onClick={(
                event,
              ) =>
                event
                  .stopPropagation()
              }
            >
              <div className="player-picker-header">
                <div>
                  <p className="eyebrow">
                    Players
                  </p>

                  <h2>
                    Who's playing?
                  </h2>
                </div>

                <button
                  type="button"
                  className="player-picker-close"
                  onClick={() =>
                    setPlayerPickerOpen(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>


              <div className="player-picker-list">
                {
                  knownPlayers.map(
                    (player) => {
                      const selected =
                        selectedPlayerIds
                          .includes(
                            player.id
                          )

                      return (
                        <button
                          key={
                            player.id
                          }
                          type="button"
                          className={
                            selected
                              ? "player-picker-row selected"
                              : "player-picker-row"
                          }
                          onClick={() =>
                            togglePlayer(
                              player.id
                            )
                          }
                        >
                          <span>
                            {
                              player.name
                            }
                          </span>

                          <span className="player-picker-check">
                            {
                              selected
                                ? "✓"
                                : ""
                            }
                          </span>
                        </button>
                      )
                    },
                  )
                }
              </div>


              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setPlayerPickerOpen(
                    false
                  )
                }
              >
                Done
              </button>
            </div>
          </div>
        )
      }
    </section>
  )
}


export { PlayerStep }