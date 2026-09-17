import {
  useEffect,
  useState,
} from "react"

import {
  chooseRankingGame,
  getRankingMatchup,
  getRankings,
  markRankingGameUnplayed,
  restoreRankingGame,
  type RankingGame,
  type RankingsResponse,
} from "../api/client"


type RankingView =
  | "compare"
  | "list"

type ShareLimit =
  | 10
  | 20
  | 50
  | 100

const shareLimits: ShareLimit[] = [
  10,
  20,
  50,
  100,
]


const emptyRankings: RankingsResponse = {
  rankings: [],
  unplayed: [],
  summary: {
    games_count: 0,
    designers: [],
    publishers: [],
    mechanics: [],
    categories: [],
  },
}


function gameImage(game: RankingGame) {
  return (
    game.image_url
    ?? game.thumbnail_url
  )
}


function RankGamesView() {
  const [view, setView] =
    useState<RankingView>("compare")

  const [matchup, setMatchup] =
    useState<RankingGame[]>([])

  const [rankings, setRankings] =
    useState<RankingsResponse>(
      emptyRankings
    )

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [playedOnly, setPlayedOnly] =
    useState(true)

  const [shareLimit, setShareLimit] =
    useState<ShareLimit>(10)

  const [shareStatus, setShareStatus] =
    useState("")

  const visibleRankings =
    rankings.rankings.slice(
      0,
      shareLimit,
    )

  const [error, setError] =
    useState("")


  async function loadRankings(
    nextPlayedOnly = playedOnly,
  ) {
    const result = await getRankings(
      nextPlayedOnly
    )
    setRankings(result)
  }


  async function loadMatchup(
    excludeBggIds: number[] = [],
    nextPlayedOnly = playedOnly,
  ) {
    let result = await getRankingMatchup(
      excludeBggIds,
      nextPlayedOnly,
    )

    if (
      result.games.length < 2
      && excludeBggIds.length > 0
    ) {
      result = await getRankingMatchup(
        [],
        nextPlayedOnly,
      )
    }

    setMatchup(result.games)
  }


  useEffect(() => {
    async function load() {
      try {
        const [matchupResult, rankingsResult] =
          await Promise.all([
            getRankingMatchup([], true),
            getRankings(true),
          ])

        setMatchup(matchupResult.games)
        setRankings(rankingsResult)
      } catch (err) {
        console.error(err)
        setError(
          "Couldn't load your game rankings.",
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])


  async function changePlayedOnly(
    nextPlayedOnly: boolean,
  ) {
    setPlayedOnly(nextPlayedOnly)
    setSaving(true)
    setError("")

    try {
      await Promise.all([
        loadMatchup([], nextPlayedOnly),
        loadRankings(nextPlayedOnly),
      ])
    } catch (err) {
      console.error(err)
      setError(
        "Couldn't update the ranking filter.",
      )
    } finally {
      setSaving(false)
    }
  }


  async function shareRanking() {
    const games = rankings.rankings.slice(
      0,
      shareLimit,
    )

    if (games.length === 0) {
      return
    }

    const title = `My Top ${games.length} Board Games`
    const text = [
      title,
      "",
      ...games.map(
        (game, index) =>
          `${index + 1}. ${game.name}`,
      ),
      "",
      "Ranked with BoardGamePicker",
    ].join("\n")

    try {
      if (navigator.share) {
        await navigator.share({title, text})
        setShareStatus("Ranking shared")
      } else {
        await navigator.clipboard.writeText(text)
        setShareStatus("Ranking copied")
      }
    } catch (err) {
      if (
        err instanceof DOMException
        && err.name === "AbortError"
      ) {
        return
      }

      console.error(err)
      setShareStatus("Couldn't share ranking")
    }
  }


  async function chooseGame(
    winner: RankingGame,
  ) {
    const loser = matchup.find(
      (game) =>
        game.bgg_id !== winner.bgg_id
    )

    if (!loser) {
      return
    }

    setSaving(true)
    setError("")

    try {
      await chooseRankingGame(
        winner.bgg_id,
        loser.bgg_id,
      )

      await Promise.all([
        loadMatchup([
          winner.bgg_id,
          loser.bgg_id,
        ]),
        loadRankings(),
      ])
    } catch (err) {
      console.error(err)
      setError(
        "Couldn't save that choice.",
      )
    } finally {
      setSaving(false)
    }
  }


  async function skipPair() {
    setSaving(true)
    setError("")

    try {
      await loadMatchup(
        matchup.map(
          (game) => game.bgg_id
        )
      )
    } catch (err) {
      console.error(err)
      setError(
        "Couldn't find another pair.",
      )
    } finally {
      setSaving(false)
    }
  }


  async function markUnplayed(
    game: RankingGame,
  ) {
    setSaving(true)
    setError("")

    try {
      await markRankingGameUnplayed(
        game.bgg_id
      )

      await Promise.all([
        loadMatchup(
          matchup.map(
            (item) => item.bgg_id
          )
        ),
        loadRankings(),
      ])
    } catch (err) {
      console.error(err)
      setError(
        "Couldn't update that game.",
      )
    } finally {
      setSaving(false)
    }
  }


  async function restoreGame(
    game: RankingGame,
  ) {
    setSaving(true)
    setError("")

    try {
      await restoreRankingGame(
        game.bgg_id
      )

      await Promise.all([
        loadRankings(),
        loadMatchup(),
      ])
    } catch (err) {
      console.error(err)
      setError(
        "Couldn't restore that game.",
      )
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <section className="screen rankings-screen">
        <h1>
          Shuffling the shelf...
        </h1>
      </section>
    )
  }


  return (
    <section className="screen rankings-screen">
      <header>
        <h1>
          Rank your games
        </h1>

        <p className="subtitle">
          Pick the game you'd rather play. Your list gets sharper with every choice.
        </p>
      </header>

      <div
        className="ranking-view-tabs"
        aria-label="Ranking views"
      >
        <button
          type="button"
          className={
            view === "compare"
              ? "active"
              : ""
          }
          aria-pressed={view === "compare"}
          onClick={() => setView("compare")}
        >
          Compare
        </button>

        <button
          type="button"
          className={
            view === "list"
              ? "active"
              : ""
          }
          aria-pressed={view === "list"}
          onClick={() => setView("list")}
        >
          My ranking
          {rankings.rankings.length > 0
            ? ` · ${rankings.rankings.length}`
            : ""}
        </button>
      </div>

      <label className="ranking-played-filter">
        <input
          type="checkbox"
          checked={playedOnly}
          disabled={saving}
          onChange={(event) =>
            void changePlayedOnly(
              event.target.checked
            )
          }
        />

        <span>
          Only games I've played
        </span>
      </label>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {view === "compare" && (
        <div className="ranking-compare-view">
          {matchup.length === 2 ? (
            <>
              <p className="ranking-question">
                Which would you rather play?
              </p>

              <div className="ranking-matchup">
                {matchup.map((game) => (
                  <article
                    className="ranking-game-card"
                    key={game.bgg_id}
                  >
                    <div className="ranking-game-image">
                      {gameImage(game) ? (
                        <img
                          src={gameImage(game) ?? ""}
                          alt=""
                        />
                      ) : (
                        <span>?</span>
                      )}
                    </div>

                    <h2>{game.name}</h2>

                    {game.year_published && (
                      <p>{game.year_published}</p>
                    )}

                    <button
                      type="button"
                      className="ranking-choose-button"
                      disabled={saving}
                      onClick={() =>
                        void chooseGame(game)
                      }
                    >
                      Prefer this
                    </button>

                    <button
                      type="button"
                      className="ranking-unplayed-button"
                      disabled={saving}
                      onClick={() =>
                        void markUnplayed(game)
                      }
                    >
                      Haven't played
                    </button>
                  </article>
                ))}
              </div>

              <button
                type="button"
                className="ranking-skip-button"
                disabled={saving}
                onClick={() => void skipPair()}
              >
                {saving
                  ? "Saving..."
                  : "Skip this pair"}
              </button>
            </>
          ) : (
            <article className="ranking-empty-card">
              <h2>
                Two played games needed
              </h2>

              <p>
                {playedOnly
                  ? "Record a play for at least two games, or include unplayed games using the option above."
                  : "Add at least two base games to your collection, or restore games marked as not played."}
              </p>

              {rankings.unplayed.length > 0 && (
                <button
                  type="button"
                  onClick={() => setView("list")}
                >
                  Review unplayed games
                </button>
              )}
            </article>
          )}
        </div>
      )}

      {view === "list" && (
        <div className="ranking-list-view">
          {rankings.rankings.length > 0 && (
            <article className="ranking-share-card">
              <div className="ranking-share-heading">
                <p className="insight-label">
                  Show ranking
                </p>

                <button
                  type="button"
                  className="ranking-share-button"
                  onClick={() => void shareRanking()}
                >
                  Share
                </button>
              </div>

              <div className="ranking-share-controls">
                <div aria-label="Shared ranking size">
                  {shareLimits.map((limit) => (
                    <button
                      type="button"
                      className={
                        shareLimit === limit
                          ? "active"
                          : ""
                      }
                      aria-pressed={shareLimit === limit}
                      key={limit}
                      onClick={() =>
                        setShareLimit(limit)
                      }
                    >
                      Top {limit}
                    </button>
                  ))}
                </div>
              </div>

              {shareStatus && (
                <p role="status">{shareStatus}</p>
              )}
            </article>
          )}

          {rankings.rankings.length > 0 ? (
            <ol className="ranking-list">
              {visibleRankings.map((game) => (
                <li key={game.bgg_id}>
                  <span className="ranking-position">
                    {game.rank}
                  </span>

                  <div className="ranking-list-image">
                    {gameImage(game) ? (
                      <img
                        src={gameImage(game) ?? ""}
                        alt=""
                      />
                    ) : (
                      <span>?</span>
                    )}
                  </div>

                  <div className="ranking-list-copy">
                    <strong>{game.name}</strong>
                    <span>
                      {game.comparisons_count} comparisons · {game.wins} wins
                    </span>
                  </div>

                </li>
              ))}
            </ol>
          ) : (
            <article className="ranking-empty-card">
              <h2>No ranking yet</h2>
              <p>
                Make your first comparison to begin building your personal list.
              </p>
            </article>
          )}

          {rankings.unplayed.length > 0 && (
            <div className="ranking-unplayed-list">
              <p className="insight-label">
                Not played yet
              </p>

              {rankings.unplayed.map((game) => (
                <div
                  className="ranking-unplayed-row"
                  key={game.bgg_id}
                >
                  <span>{game.name}</span>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void restoreGame(game)
                    }
                  >
                    Add back
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}


export default RankGamesView
