import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  getCollectionStats,
  getGameHistory,
  getGames,
  recordPlay,
  removeFromCollection,
  type CollectionGameStats,
  type Game,
  type GameHistory,
  type PlayParticipant,
} from "../api/client"


type SortOption =
  | "name"
  | "recent"
  | "most-played"
  | "rating"
  | "complexity"

type PlayFilter =
  | "all"
  | "played"
  | "never"

type PlayerForm = {
  name: string
  score: string
  isWinner: boolean
}


function todayValue() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0")

  const day = String(
    now.getDate(),
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}


function CollectionView() {
  const [games, setGames] =
    useState<Game[]>([])

  const [collectionStats, setCollectionStats] =
    useState<CollectionGameStats[]>([])

  const [search, setSearch] =
    useState("")

  const [sort, setSort] =
    useState<SortOption>("name")

  const [playFilter, setPlayFilter] =
    useState<PlayFilter>("all")

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

  const [showPlayForm, setShowPlayForm] =
    useState(false)

  const [playDate, setPlayDate] =
    useState(todayValue())

  const [duration, setDuration] =
    useState("")

  const [players, setPlayers] =
    useState<PlayerForm[]>([
      {
        name: "",
        score: "",
        isWinner: false,
      },
    ])

  const [savingPlay, setSavingPlay] =
    useState(false)

  const [playError, setPlayError] =
    useState("")

  const [playSaved, setPlaySaved] =
    useState(false)

  const savedScrollPosition =
    useRef(0)


  useEffect(() => {
    async function loadGames() {
      try {
        const [
          gamesResult,
          statsResult,
        ] = await Promise.all([
          getGames(),
          getCollectionStats(),
        ])

        setGames(
          gamesResult.filter(
            (game) => game.owned,
          ),
        )

        setCollectionStats(
          statsResult,
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
    if (selectedGame !== null) {
      return
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top: savedScrollPosition.current,
        behavior: "instant",
      })
    })
  }, [selectedGame])


  async function refreshHistory(
    game: Game,
  ) {
    setHistoryLoading(true)

    try {
      const history =
        await getGameHistory(
          game.bgg_id,
        )

      setGameHistory(history)

      setCollectionStats(
        (currentStats) => {
          const existing =
            currentStats.find(
              (stats) =>
                stats.bgg_id ===
                game.bgg_id,
            )

          const updated = {
            bgg_id: game.bgg_id,
            play_count:
              history.play_count,
            last_played_at:
              history.last_played_at,
          }

          if (!existing) {
            return [
              ...currentStats,
              updated,
            ]
          }

          return currentStats.map(
            (stats) =>
              stats.bgg_id ===
              game.bgg_id
                ? updated
                : stats,
          )
        },
      )
    } catch (err) {
      console.error(err)

      setGameHistory(null)
    } finally {
      setHistoryLoading(false)
    }
  }


  useEffect(() => {
    if (!selectedGame) {
      setGameHistory(null)
      return
    }

    refreshHistory(selectedGame)
  }, [selectedGame])


  const statsByGame =
    useMemo(() => {
      return new Map(
        collectionStats.map(
          (stats) => [
            stats.bgg_id,
            stats,
          ],
        ),
      )
    }, [collectionStats])


  const filteredGames =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      const results =
        games.filter(
          (game) => {
            const stats =
              statsByGame.get(
                game.bgg_id,
              )

            const playCount =
              stats?.play_count ?? 0

            if (
              playFilter ===
                "played" &&
              playCount === 0
            ) {
              return false
            }

            if (
              playFilter ===
                "never" &&
              playCount > 0
            ) {
              return false
            }

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

            return searchable.includes(
              query,
            )
          },
        )

      return [...results].sort(
        (a, b) => {
          const aStats =
            statsByGame.get(
              a.bgg_id,
            )

          const bStats =
            statsByGame.get(
              b.bgg_id,
            )

          if (sort === "recent") {
            const aDate =
              aStats?.last_played_at
                ? new Date(
                    aStats.last_played_at,
                  ).getTime()
                : 0

            const bDate =
              bStats?.last_played_at
                ? new Date(
                    bStats.last_played_at,
                  ).getTime()
                : 0

            return bDate - aDate
          }

          if (
            sort === "most-played"
          ) {
            return (
              (bStats?.play_count ??
                0) -
              (aStats?.play_count ??
                0)
            )
          }

          if (sort === "rating") {
            return (
              (b.rating ?? -1) -
              (a.rating ?? -1)
            )
          }

          if (
            sort === "complexity"
          ) {
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
    }, [
      games,
      search,
      sort,
      playFilter,
      statsByGame,
    ])


  function resetPlayForm() {
    setPlayDate(todayValue())
    setDuration("")

    setPlayers([
      {
        name: "",
        score: "",
        isWinner: false,
      },
    ])

    setPlayError("")
  }


  function updatePlayer(
    index: number,
    changes: Partial<PlayerForm>,
  ) {
    setPlayers(
      players.map(
        (
          player,
          playerIndex,
        ) =>
          playerIndex === index
            ? {
                ...player,
                ...changes,
              }
            : player,
      ),
    )
  }


  function addPlayer() {
    setPlayers([
      ...players,
      {
        name: "",
        score: "",
        isWinner: false,
      },
    ])
  }


  function removePlayer(
    index: number,
  ) {
    if (players.length === 1) {
      return
    }

    setPlayers(
      players.filter(
        (_, playerIndex) =>
          playerIndex !== index,
      ),
    )
  }


  async function handleSavePlay() {
    if (!selectedGame) {
      return
    }

    const cleanedPlayers =
      players.map(
        (
          player,
        ): PlayParticipant => ({
          name:
            player.name.trim(),

          score:
            player.score.trim() ===
            ""
              ? null
              : Number(
                  player.score,
                ),

          is_winner:
            player.isWinner,
        }),
      )

    if (
      cleanedPlayers.some(
        (player) =>
          player.name.length ===
          0,
      )
    ) {
      setPlayError(
        "Please enter a name for every player.",
      )

      return
    }

    if (
      cleanedPlayers.some(
        (player) =>
          player.score !==
            null &&
          Number.isNaN(
            player.score,
          ),
      )
    ) {
      setPlayError(
        "Scores must be numbers.",
      )

      return
    }

    const durationMinutes =
      duration.trim() === ""
        ? null
        : Number(duration)

    if (
      durationMinutes !== null &&
      (
        Number.isNaN(
          durationMinutes,
        ) ||
        durationMinutes < 0
      )
    ) {
      setPlayError(
        "Duration must be a valid number.",
      )

      return
    }

    setSavingPlay(true)
    setPlayError("")
    setPlaySaved(false)

    try {
      const playedAt =
        new Date(
          `${playDate}T12:00:00`,
        ).toISOString()

      await recordPlay(
        selectedGame.bgg_id,
        playedAt,
        durationMinutes,
        cleanedPlayers,
      )

      resetPlayForm()

      setShowPlayForm(false)
      setPlaySaved(true)

      await refreshHistory(
        selectedGame,
      )
    } catch (err) {
      console.error(err)

      setPlayError(
        "Couldn't save this play.",
      )
    } finally {
      setSavingPlay(false)
    }
  }


  async function handleRemoveFromCollection() {
    if (!selectedGame) {
      return
    }

    const confirmed =
      window.confirm(
        `Remove ${selectedGame.name} from your collection?`,
      )

    if (!confirmed) {
      return
    }

    try {
      await removeFromCollection(
        selectedGame.bgg_id,
      )

      setGames(
        (currentGames) =>
          currentGames.filter(
            (game) =>
              game.bgg_id !==
              selectedGame.bgg_id,
          ),
      )

      setCollectionStats(
        (currentStats) =>
          currentStats.filter(
            (stats) =>
              stats.bgg_id !==
              selectedGame.bgg_id,
          ),
      )

      setSelectedGame(null)
      setGameHistory(null)
      setShowPlayForm(false)

      resetPlayForm()
    } catch (err) {
      console.error(err)

      window.alert(
        "Couldn't remove this game from your collection.",
      )
    }
  }


  function openGame(
    game: Game,
  ) {
    savedScrollPosition.current =
      window.scrollY

    setPlaySaved(false)
    setSelectedGame(game)
  }


  function closeGame() {
    setSelectedGame(null)
    setGameHistory(null)
    setShowPlayForm(false)
    setPlaySaved(false)

    resetPlayForm()
  }


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
          onClick={closeGame}
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
                alt={
                  selectedGame.name
                }
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


          <button
            className="primary-button log-play-button"
            onClick={() => {
              setShowPlayForm(
                !showPlayForm,
              )

              setPlayError("")
              setPlaySaved(false)
            }}
          >
            {showPlayForm
              ? "Cancel"
              : "Log a play"}
          </button>


          {showPlayForm && (
            <div className="play-form">
              <div className="play-form-heading">
                <div>
                  <p className="preference-label">
                    New play
                  </p>

                  <strong>
                    {
                      selectedGame.name
                    }
                  </strong>
                </div>
              </div>


              <div className="play-form-grid">
                <label>
                  <span>Date</span>

                  <input
                    type="date"
                    value={playDate}
                    onChange={(
                      event,
                    ) =>
                      setPlayDate(
                        event.target
                          .value,
                      )
                    }
                  />
                </label>


                <label>
                  <span>
                    Duration
                  </span>

                  <div className="duration-input">
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="60"
                      value={duration}
                      onChange={(
                        event,
                      ) =>
                        setDuration(
                          event.target
                            .value,
                        )
                      }
                    />

                    <small>
                      min
                    </small>
                  </div>
                </label>
              </div>


              <div className="player-form-heading">
                <p className="preference-label">
                  Players
                </p>

                <span>
                  {players.length}
                </span>
              </div>


              <div className="player-forms">
                {players.map(
                  (
                    player,
                    index,
                  ) => (
                    <div
                      className="player-form-card"
                      key={index}
                    >
                      <div className="player-form-number">
                        <strong>
                          Player{" "}
                          {index + 1}
                        </strong>

                        {players.length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removePlayer(
                                index,
                              )
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>


                      <div className="player-input-row">
                        <label>
                          <span>
                            Name
                          </span>

                          <input
                            type="text"
                            value={
                              player.name
                            }
                            placeholder="Player name"
                            onChange={(
                              event,
                            ) =>
                              updatePlayer(
                                index,
                                {
                                  name:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                          />
                        </label>


                        <label className="score-field">
                          <span>
                            Score
                          </span>

                          <input
                            type="number"
                            inputMode="decimal"
                            value={
                              player.score
                            }
                            placeholder="—"
                            onChange={(
                              event,
                            ) =>
                              updatePlayer(
                                index,
                                {
                                  score:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                          />
                        </label>
                      </div>


                      <label className="winner-toggle">
                        <input
                          type="checkbox"
                          checked={
                            player.isWinner
                          }
                          onChange={(
                            event,
                          ) =>
                            updatePlayer(
                              index,
                              {
                                isWinner:
                                  event
                                    .target
                                    .checked,
                              },
                            )
                          }
                        />

                        <span>
                          Winner
                        </span>
                      </label>
                    </div>
                  ),
                )}
              </div>


              <button
                type="button"
                className="add-player-button"
                onClick={addPlayer}
              >
                + Add player
              </button>


              {playError && (
                <p className="error-message">
                  {playError}
                </p>
              )}


              <button
                className="primary-button save-play-button"
                disabled={
                  savingPlay
                }
                onClick={
                  handleSavePlay
                }
              >
                {savingPlay
                  ? "Saving..."
                  : "Save play"}
              </button>
            </div>
          )}


          {playSaved && (
            <p className="play-confirmation">
              Play saved.
            </p>
          )}


          <div className="detail-section">
            <p className="preference-label">
              Players
            </p>

            <p>
              {selectedGame.min_players ??
                "?"}
              –
              {selectedGame.max_players ??
                "?"}
            </p>
          </div>


          {selectedGame.categories
            .length > 0 && (
            <div className="detail-section">
              <p className="preference-label">
                Categories
              </p>

              <div className="detail-tags">
                {selectedGame.categories.map(
                  (category) => (
                    <span
                      key={
                        category
                      }
                    >
                      {category}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}


          {selectedGame.mechanics
            .length > 0 && (
            <div className="detail-section">
              <p className="preference-label">
                Mechanics
              </p>

              <div className="detail-tags">
                {selectedGame.mechanics.map(
                  (mechanic) => (
                    <span
                      key={
                        mechanic
                      }
                    >
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
                Loading your play
                history...
              </p>
            ) : gameHistory ? (
              <>
                <div className="history-stats">
                  <div>
                    <strong>
                      {
                        gameHistory.play_count
                      }
                    </strong>

                    <span>
                      Plays
                    </span>
                  </div>


                  <div>
                    <strong>
                      {gameHistory
                        .average_players
                        ?.toFixed(
                          1,
                        ) ?? "—"}
                    </strong>

                    <span>
                      Avg players
                    </span>
                  </div>


                  <div>
                    <strong>
                      {gameHistory
                        .average_duration_minutes ??
                        "—"}
                    </strong>

                    <span>
                      Avg mins
                    </span>
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


                {gameHistory
                  .recent_plays
                  .length > 0 ? (
                  <div className="recent-plays">
                    <p className="preference-label">
                      Recent plays
                    </p>


                    {gameHistory.recent_plays.map(
                      (play) => (
                        <div
                          className="recent-play-detail"
                          key={
                            play.id
                          }
                        >
                          <div className="recent-play-header">
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
                                {
                                  play.player_count
                                }{" "}
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


                          {play
                            .participants
                            .length >
                            0 && (
                            <div className="play-participants">
                              {play.participants.map(
                                (
                                  participant,
                                ) => (
                                  <div
                                    className={
                                      participant
                                        .is_winner
                                        ? "history-player winner"
                                        : "history-player"
                                    }
                                    key={
                                      participant.id
                                    }
                                  >
                                    <span>
                                      {
                                        participant.name
                                      }

                                      {participant
                                        .is_winner &&
                                        " · Winner"}
                                    </span>

                                    <strong>
                                      {participant
                                        .score ??
                                        "—"}
                                    </strong>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="history-empty">
                    You haven't logged
                    a play of this game
                    yet.
                  </p>
                )}
              </>
            ) : (
              <p className="history-empty">
                Play history
                unavailable.
              </p>
            )}
          </div>


          <div className="detail-section collection-danger-zone">
            <button
              className="remove-collection-button"
              onClick={
                handleRemoveFromCollection
              }
            >
              Remove from collection
            </button>
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
          {games.length} games on
          your shelf.
        </p>
      </header>


      <div className="collection-tools">
        <input
          className="collection-search"
          type="search"
          value={search}
          placeholder="Search games, themes or mechanics"
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
        />


        <div className="collection-filter-tabs">
          <button
            className={
              playFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setPlayFilter("all")
            }
          >
            All
          </button>

          <button
            className={
              playFilter ===
              "played"
                ? "active"
                : ""
            }
            onClick={() =>
              setPlayFilter(
                "played",
              )
            }
          >
            Played
          </button>

          <button
            className={
              playFilter ===
              "never"
                ? "active"
                : ""
            }
            onClick={() =>
              setPlayFilter(
                "never",
              )
            }
          >
            Never played
          </button>
        </div>


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

          <option value="recent">
            Recently played
          </option>

          <option value="most-played">
            Most played
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
        {filteredGames.map(
          (game) => {
            const stats =
              statsByGame.get(
                game.bgg_id,
              )

            return (
              <button
                className="collection-game"
                key={game.bgg_id}
                onClick={() =>
                  openGame(game)
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
                    {game.min_players ??
                      "?"}
                    –
                    {game.max_players ??
                      "?"}
                    P
                    {" · "}
                    {game.max_play_time ??
                      "?"}
                    MIN
                  </span>


                  {game.categories
                    .length > 0 && (
                    <small>
                      {game.categories
                        .slice(0, 2)
                        .join(" · ")}
                    </small>
                  )}


                  {!stats ||
                  stats.play_count ===
                    0 ? (
                    <small className="collection-play-meta">
                      Never played
                    </small>
                  ) : (
                    <small className="collection-play-meta">
                      {
                        stats.play_count
                      }{" "}
                      {stats.play_count ===
                      1
                        ? "play"
                        : "plays"}

                      {stats.last_played_at &&
                        ` · Last played ${new Date(
                          stats.last_played_at,
                        ).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}`}
                    </small>
                  )}
                </div>


                <span className="collection-chevron">
                  ›
                </span>
              </button>
            )
          },
        )}
      </div>


      {filteredGames.length ===
        0 && (
        <p className="collection-empty">
          No games match these
          filters.
        </p>
      )}
    </section>
  )
}


export default CollectionView