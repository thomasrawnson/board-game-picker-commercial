import {
  useState,
} from "react"

import {
  addGameToCollection,
  searchBGGGames,
  type BGGSearchResult,
  type Game,
} from "../../api/client"


type Props = {
  onGameAdded: (
    game: Game,
  ) => void
  onClose: () => void
}


function AddGameSearch({
  onGameAdded,
  onClose,
}: Props) {
  const [
    query,
    setQuery,
  ] = useState("")

  const [
    results,
    setResults,
  ] = useState<
    BGGSearchResult[]
  >([])

  const [
    searching,
    setSearching,
  ] = useState(false)

  const [
    addingId,
    setAddingId,
  ] = useState<number | null>(
    null
  )

  const [
    error,
    setError,
  ] = useState("")


  async function search() {
    const cleaned =
      query.trim()

    if (cleaned.length < 2) {
      return
    }

    setSearching(true)
    setError("")

    try {
      const found =
        await searchBGGGames(
          cleaned
        )

      setResults(
        found
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't search BoardGameGeek."
      )
    } finally {
      setSearching(false)
    }
  }


  async function addGame(
    result: BGGSearchResult,
  ) {
    setAddingId(
      result.bgg_id
    )

    setError("")

    try {
      const game =
        await addGameToCollection(
          result.bgg_id
        )

      onGameAdded(
        game
      )

      setResults(
        (current) =>
          current.map(
            (item) =>
              item.bgg_id
              === result.bgg_id
                ? {
                    ...item,
                    owned: true,
                  }
                : item
          )
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't add that game."
      )
    } finally {
      setAddingId(
        null
      )
    }
  }


  return (
    <section className="add-game-panel">
      <div className="add-game-header">
        <div>
          <p className="eyebrow">
            Add a game
          </p>

          <h2>
            Search BoardGameGeek
          </h2>
        </div>

        <button
          type="button"
          className="ghost-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>


      <div className="add-game-search-row">
        <input
          className="setup-input"
          type="search"
          value={query}
          placeholder="e.g. Heat: Pedal to the Metal"
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key
              === "Enter"
            ) {
              void search()
            }
          }}
        />

        <button
          type="button"
          className="primary-button"
          disabled={
            searching
            || query.trim()
              .length < 2
          }
          onClick={() =>
            void search()
          }
        >
          {searching
            ? "Searching..."
            : "Search"}
        </button>
      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="add-game-results">
        {results.map(
          (result) => (
            <div
              key={
                result.bgg_id
              }
              className="add-game-result"
            >
              <div>
                <strong>
                  {result.name}
                </strong>

                {result.year_published && (
                  <span>
                    {
                      result.year_published
                    }
                  </span>
                )}
              </div>

              <button
                type="button"
                className="ghost-button"
                disabled={
                  result.owned
                  || addingId
                    === result.bgg_id
                }
                onClick={() =>
                  void addGame(
                    result
                  )
                }
              >
                {result.owned
                  ? "Owned"
                  : addingId
                    === result.bgg_id
                    ? "Adding..."
                    : "Add"}
              </button>
            </div>
          ),
        )}
      </div>
    </section>
  )
}


export default AddGameSearch