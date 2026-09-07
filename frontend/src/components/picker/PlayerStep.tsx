import {
  useEffect,
  useMemo,
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

  const [
    playerSearch,
    setPlayerSearch,
  ] = useState("")


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


  const selectedPlayers =
    useMemo(
      () =>
        knownPlayers.filter(
          (player) =>
            selectedPlayerIds.includes(
              player.id
            ),
        ),
      [
        knownPlayers,
        selectedPlayerIds,
      ],
    )


  const filteredPlayers =
    useMemo(() => {
      const query =
        playerSearch
          .trim()
          .toLowerCase()

      if (!query) {
        return knownPlayers
      }

      return knownPlayers.filter(
        (player) =>
          player.name
            .toLowerCase()
            .includes(query),
      )
    }, [
      knownPlayers,
      playerSearch,
    ])


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


  function closePlayerPicker() {
    setPlayerPickerOpen(false)
    setPlayerSearch("")
  }


  const selectedPlayerNames =
    selectedPlayers
      .map(
        (player) =>
          player.name
      )
      .join(", ")


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
            <div className="player-picker-trigger-copy">
              <strong>
                Choose players
              </strong>

              <span>
                {
                  selectedPlayers.length
                  > 0
                    ? selectedPlayerNames
                    : "Select regular players"
                }
              </span>
            </div>

            <span className="player-picker-trigger-chevron">
              ›
            </span>
          </button>


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
            onClick={
              closePlayerPicker
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

                  <p>
                    Pick everyone at
                    the table.
                  </p>
                </div>

                <button
                  type="button"
                  className="player-picker-close"
                  aria-label="Close player picker"
                  onClick={
                    closePlayerPicker
                  }
                >
                  ×
                </button>
              </div>


              <div className="player-picker-search-wrap">
                <input
                  type="search"
                  className="player-picker-search"
                  placeholder="Search players..."
                  value={
                    playerSearch
                  }
                  onChange={(
                    event,
                  ) =>
                    setPlayerSearch(
                      event
                        .target
                        .value
                    )
                  }
                  autoFocus
                />
              </div>


              <div className="player-picker-list">
                {
                  filteredPlayers.length
                  > 0
                    ? filteredPlayers.map(
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
                              <span className="player-picker-row-name">
                                {
                                  player.name
                                }
                              </span>

                              <span
                                className={
                                  selected
                                    ? "player-picker-check selected"
                                    : "player-picker-check"
                                }
                              >
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
                    : (
                      <p className="player-picker-empty">
                        No players found.
                      </p>
                    )
                }
              </div>


              <div className="player-picker-footer">
                <span>
                  {
                    selectedPlayerIds
                      .length
                  }
                  {" "}
                  {
                    selectedPlayerIds
                      .length === 1
                      ? "player selected"
                      : "players selected"
                  }
                </span>

                <button
                  type="button"
                  className="primary-button player-picker-done"
                  onClick={
                    closePlayerPicker
                  }
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )
      }
    </section>
  )
}


export { PlayerStep }