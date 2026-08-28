import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  getGameHistory,
  getGames,
  type Game,
  type GameHistory,
} from "../api/client"


type SortOption =
  | "name"
  | "rating"
  | "complexity"


function CollectionView() {
  const [games, setGames] =
    useState<Game[]>([])

  const [search, setSearch] =
    useState("")

  const [sort, setSort] =
    useState<SortOption>("name")

  const [selectedGame, setSelectedGame] =
    useState<Game | null>(null)

  const [gameHistory, setGameHistory] =
    useState<GameHistory | null>(null)

  const [historyLoading, setHistoryLoading] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  useEffect(() => {
    async function loadGames() {
      try {
        const result = await getGames()

        setGames(
          result.filter(
            (game) => game.owned,
          ),
        )
      } catch (err) {
        console.error(err)

        setError(
          "Couldn't load your collection.",
        )
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])


  useEffect(() => {
    async function loadHistory() {
      if (!selectedGame) {
        setGameHistory(null)
        return
      }

      setHistoryLoading(true)

      try {
        const history =
          await getGameHistory(
            selectedGame.bgg_id,
          )

        setGameHistory(history)
      } catch (err) {
        console.error(err)

        setGameHistory(null)
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [selectedGame])


  const filteredGames = useMemo(() => {
    const query =
      search.trim().toLowerCase()

    const results = games.filter(
      (game) => {
        if (!query) {
          return true
        }

        const searchable = [
          game.name,
          ...game.categories,
          ...game.mechanics,
        ]
          .join(" ")
          .toLowerCase()

        return searchable.includes(query)
      },
    )

    return [...results].sort(
      (a, b) => {
        if (sort === "rating") {
          return (
            (b.rating ?? -1) -
            (a.rating ?? -1)
          )
        }

        if (sort === "complexity") {
          return (
            (b.complexity ?? -1) -
            (a.complexity ?? -1)
          )
        }

        return a.name.localeCompare(
          b.name,
        )
      },
    )
  }, [games, search, sort])


  if (loading) {
    return (
      <section className="screen collection-screen">
        <p className="eyebrow">
          Your collection
        </p>

        <h1>
          Opening the cupboard...
        </h1>
      </section>
    )
  }


  if (error) {
    return (
      <section className="screen collection-screen">
        <p className="eyebrow">
          Your collection
        </p>

        <h1>Your games</h1>

        <p className="error-message">
          {error}
        </p>
      </section>
    )
  }


  if (selectedGame) {
    return (
      <section className="screen collection-screen">
        <button
          className="collection-back"
          onClick={() => {
            setSelectedGame(null)
            setGameHistory(null)
          }}
        >
          ← Back to collection
        </button>

        <article className="collection-detail">
          <div className="collection-detail-image">
            {selectedGame.image_url ||
            selectedGame.thumbnail_url ? (
              <img
                src={
                  selectedGame.image_url ??
                  selectedGame.thumbnail_url ??
                  ""
                }
                alt={selectedGame.name}
              />
            ) : (
              <div className="collection-placeholder">
                ?
              </div>
            )}
          </div>

          <p className="eyebrow">
            {selectedGame.year_published ??
              "Board game"}
          </p>

          <h1>
            {selectedGame.name}
          </h1>


          <div className="detail-stats">
            <div>
              <strong>
                {selectedGame.rating?.toFixed(
                  1,
                ) ?? "—"}
              </strong>

              <span>Rating</span>
            </div>

            <div>
              <strong>
                {selectedGame.complexity?.toFixed(
                  1,
                ) ?? "—"}
              </strong>

              <span>Weight</span>
            </div>

            <div>
              <strong>
                {selectedGame.max_play_time ??
                  "—"}
              </strong>

              <span>Minutes</span>
            </div>
          </div>


          <div className="detail-section">
            <p className="preference-label">
              Players
            </p>

            <p>
              {selectedGame.min_players ?? "?"}
              –
              {selectedGame.max_players ?? "?"}
            </p>
          </div>


          {selectedGame.categories.length >
            0 && (
            <div className="detail-section">
              <p className="preference-label">
                Categories
              </p>

              <div className="detail-tags">
                {selectedGame.categories.map(
                  (category) => (
                    <span key={category}>
                      {category}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}


          {selectedGame.mechanics.length >
            0 && (
            <div className="detail-section">
              <p className="preference-label">
                Mechanics
              </p>

              <div className="detail-tags">
                {selectedGame.mechanics.map(
                  (mechanic) => (
                    <span key={mechanic}>
                      {mechanic}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}


          <div className="detail-section game-history">
            <p className="preference-label">
              Your history
            </p>

            {historyLoading ? (
              <p className="history-empty">
                Loading your play history...
              </p>
            ) : gameHistory ? (
              <>
                <div className="history-stats">
                  <div>
                    <strong>
                      {gameHistory.play_count}
                    </strong>

                    <span>Plays</span>
                  </div>

                  <div>
                    <strong>
                      {gameHistory
                        .average_players
                        ?.toFixed(1) ?? "—"}
                    </strong>

                    <span>Avg players</span>
                  </div>

                  <div>
                    <strong>
                      {gameHistory
                        .average_duration_minutes
                        ?? "—"}
                    </strong>

                    <span>Avg mins</span>
                  </div>
                </div>


                {gameHistory.last_played_at && (
                  <p className="history-last-played">
                    Last played{" "}
                    {new Date(
                      gameHistory.last_played_at,
                    ).toLocaleDateString(
                      undefined,
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                )}


                {gameHistory.recent_plays.length >
                0 ? (
                  <div className="recent-plays">
                    <p className="preference-label">
                      Recent plays
                    </p>

                    {gameHistory.recent_plays.map(
                      (play) => (
                        <div
                          className="recent-play"
                          key={play.id}
                        >
                          <div>
                            <strong>
                              {new Date(
                                play.played_at,
                              ).toLocaleDateString(
                                undefined,
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </strong>

                            <span>
                              {play.player_count}{" "}
                              {play.player_count ===
                              1
                                ? "player"
                                : "players"}
                            </span>
                          </div>

                          <span>
                            {play.duration_minutes
                              ? `${play.duration_minutes} min`
                              : "—"}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="history-empty">
                    You haven't logged a play
                    of this game yet.
                  </p>
                )}
              </>
            ) : (
              <p className="history-empty">
                Play history unavailable.
              </p>
            )}
          </div>
        </article>
      </section>
    )
  }


  return (
    <section className="screen collection-screen">
      <header>
        <p className="eyebrow">
          Your collection
        </p>

        <h1>Your games</h1>

        <p className="subtitle">
          {games.length} games on your shelf.
        </p>
      </header>


      <div className="collection-tools">
        <input
          className="collection-search"
          type="search"
          value={search}
          placeholder="Search games, themes or mechanics"
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          className="collection-sort"
          value={sort}
          onChange={(event) =>
            setSort(
              event.target
                .value as SortOption,
            )
          }
        >
          <option value="name">
            A–Z
          </option>

          <option value="rating">
            Highest rated
          </option>

          <option value="complexity">
            Heaviest
          </option>
        </select>
      </div>


      <p className="collection-count">
        {filteredGames.length}{" "}
        {filteredGames.length === 1
          ? "game"
          : "games"}
      </p>


      <div className="collection-list">
        {filteredGames.map((game) => (
          <button
            className="collection-game"
            key={game.bgg_id}
            onClick={() =>
              setSelectedGame(game)
            }
          >
            <div className="collection-thumb">
              {game.thumbnail_url ||
              game.image_url ? (
                <img
                  src={
                    game.thumbnail_url ??
                    game.image_url ??
                    ""
                  }
                  alt=""
                />
              ) : (
                <span>?</span>
              )}
            </div>


            <div className="collection-game-info">
              <strong>
                {game.name}
              </strong>

              <span>
                {game.min_players ?? "?"}
                –
                {game.max_players ?? "?"}
                P
                {" · "}
                {game.max_play_time ?? "?"}
                MIN
              </span>

              {game.categories.length > 0 && (
                <small>
                  {game.categories
                    .slice(0, 2)
                    .join(" · ")}
                </small>
              )}
            </div>


            <span className="collection-chevron">
              ›
            </span>
          </button>
        ))}
      </div>


      {filteredGames.length === 0 && (
        <p className="collection-empty">
          No games match that search.
        </p>
      )}
    </section>
  )
}


export default CollectionView