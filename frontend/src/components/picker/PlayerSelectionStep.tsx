import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  getPlayers,
  type Player,
} from "../../api/client"

import LoadingMessage
  from "../ui/LoadingMessage"


type Props = {
  selectedPlayerIds: number[]
  onChange: (
    playerIds: number[],
  ) => void
  onDone: () => void
  onBack: () => void
}


function PlayerSelectionStep({
  selectedPlayerIds,
  onChange,
  onDone,
  onBack,
}: Props) {
  const [
    players,
    setPlayers,
  ] = useState<Player[]>([])

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    loading,
    setLoading,
  ] = useState(true)


  useEffect(() => {
    async function loadPlayers() {
      try {
        const result =
          await getPlayers()

        setPlayers(
          result
        )
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])


  const filteredPlayers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      if (!query) {
        return players
      }

      return players.filter(
        (player) =>
          player.name
            .toLowerCase()
            .includes(
              query
            ),
      )
    }, [
      players,
      search,
    ])


  function togglePlayer(
    playerId: number,
  ) {
    if (
      selectedPlayerIds.includes(
        playerId
      )
    ) {
      onChange(
        selectedPlayerIds.filter(
          (id) =>
            id !== playerId
        )
      )

      return
    }

    onChange([
      ...selectedPlayerIds,
      playerId,
    ])
  }


  return (
    <section className="screen picker-selection-screen">
      <header>
        <p className="eyebrow">
          Players
        </p>

        <h1>
          Who's playing?
        </h1>

        <p className="subtitle">
          Pick everyone who's at
          the table.
        </p>
      </header>


      <label
        className="picker-search-label"
      >
        <span className="sr-only">
          Search players
        </span>

        <input
          type="search"
          className="player-picker-search"
          placeholder="Search players..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />
      </label>


      <div className="picker-selection-list">
        {loading ? (
          <p className="picker-selection-empty">
            <LoadingMessage
              messages={[
                "Gathering the usual suspects...",
                "Checking who's free tonight...",
              ]}
            />
          </p>
        ) : filteredPlayers.length
          > 0 ? (
          filteredPlayers.map(
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
                      ? "picker-selection-row selected"
                      : "picker-selection-row"
                  }
                  aria-pressed={
                    selected
                  }
                  onClick={() =>
                    togglePlayer(
                      player.id
                    )
                  }
                >
                  <span>
                    {player.name}
                  </span>

                  <span
                    className={
                      selected
                        ? "picker-selection-check selected"
                        : "picker-selection-check"
                    }
                    aria-hidden="true"
                  >
                    {selected
                      ? "✓"
                      : ""}
                  </span>
                </button>
              )
            },
          )
        ) : (
          <p className="picker-selection-empty">
            No players match that search — check the spelling, or add someone new.
          </p>
        )}
      </div>


      <div className="picker-selection-footer">
        <span>
          {selectedPlayerIds.length}{" "}
          {selectedPlayerIds.length
            === 1
            ? "player selected"
            : "players selected"}
        </span>

        <button
          type="button"
          className="primary-button"
          disabled={
            selectedPlayerIds.length
            === 0
          }
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


export default PlayerSelectionStep