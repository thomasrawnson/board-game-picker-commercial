import {
  useEffect,
  useState,
} from "react"

import {
  getCollectionInsights,
  getRankings,
  type CollectionInsights,
  type RankingSummary,
  type RankingsResponse,
} from "../api/client"

import PlayerProfile
  from "./players/PlayerProfile"


type StatsSection =
  | "collection"
  | "play"
  | "group"
  | "rank"
  | "recaps"

type RankSummaryLimit =
  | 10
  | 20
  | 50
  | 100

const rankSummaryLimits: RankSummaryLimit[] = [
  10,
  20,
  50,
  100,
]


const statsSections: Array<{
  id: StatsSection
  label: string
}> = [
  {
    id: "rank",
    label: "Rank",
  },
  {
    id: "collection",
    label: "Collection",
  },
  {
    id: "play",
    label: "Play",
  },
  {
    id: "group",
    label: "Friends",
  },
  {
    id: "recaps",
    label: "Recaps",
  },
]


function formatPlayedAt(
  value: string,
): string {
  const date =
    new Date(value)

  return new Intl.DateTimeFormat(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date)
}


function formatHours(
  minutes: number,
): string {
  const hours =
    minutes / 60

  if (hours < 10) {
    return hours.toFixed(1)
  }

  return (
    Math.round(hours)
      .toString()
  )
}


function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14 19 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


type Props = {
  onOpenGame:
    (bggId: number) => void
  onOpenRankings: () => void
}


function InsightsView({
  onOpenGame,
  onOpenRankings,
}: Props) {
  const [
    insights,
    setInsights,
  ] = useState<
    CollectionInsights | null
  >(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    rankingSummary,
    setRankingSummary,
  ] = useState<RankingSummary | null>(null)

  const [
    rankedGames,
    setRankedGames,
  ] = useState<RankingsResponse["rankings"]>([])

  const [
    rankShareStatus,
    setRankShareStatus,
  ] = useState("")

  const [
    rankSummaryLimit,
    setRankSummaryLimit,
  ] = useState<RankSummaryLimit>(20)

  const [
    rankSummaryLoading,
    setRankSummaryLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")

  const [
    selectedPlayerId,
    setSelectedPlayerId,
  ] = useState<number | null>(
    null,
  )

  const [
    showMonthlyPlays,
    setShowMonthlyPlays,
  ] = useState(false)

  const [
    showAllNeglected,
    setShowAllNeglected,
  ] = useState(false)

  const [
    showAllFavourites,
    setShowAllFavourites,
  ] = useState(false)

  const [
    showAllGroups,
    setShowAllGroups,
  ] = useState(false)

  const [
    activeSection,
    setActiveSection,
  ] = useState<StatsSection>(
    "rank"
  )


  useEffect(() => {
    async function loadInsights() {
      try {
        const [result, rankingResult] =
          await Promise.all([
            getCollectionInsights(),
            getRankings(true),
          ])

        setInsights(result)
        setRankingSummary(
          rankingResult.summary
        )
        setRankedGames(
          rankingResult.rankings
        )
      } catch (err) {
        console.error(err)

        setError(
          "Couldn't load your collection insights.",
        )
      } finally {
        setLoading(false)
      }
    }

    loadInsights()
  }, [])


  async function shareRankStats() {
    const games = rankedGames.slice(
      0,
      rankSummaryLimit,
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
      "Ranked with ShelfPick",
    ].join("\n")

    try {
      if (navigator.share) {
        await navigator.share({title, text})
        setRankShareStatus("Ranking shared")
      } else {
        await navigator.clipboard.writeText(text)
        setRankShareStatus("Ranking copied")
      }
    } catch (err) {
      if (
        err instanceof DOMException
        && err.name === "AbortError"
      ) {
        return
      }

      console.error(err)
      setRankShareStatus("Couldn't share ranking")
    }
  }

  async function changeRankSummaryLimit(
    nextLimit: RankSummaryLimit,
  ) {
    setRankSummaryLimit(nextLimit)
    setRankSummaryLoading(true)
    setRankShareStatus("")

    try {
      const result = await getRankings(
        true,
        nextLimit,
      )
      setRankingSummary(result.summary)
      setRankedGames(result.rankings)
    } catch (err) {
      console.error(err)
      setError(
        "Couldn't update your rank stats.",
      )
    } finally {
      setRankSummaryLoading(false)
    }
  }


  if (
    selectedPlayerId !== null
  ) {
    return (
      <PlayerProfile
        playerId={
          selectedPlayerId
        }
        onBack={() =>
          setSelectedPlayerId(
            null
          )
        }
        onSelectPlayer={(
          playerId: number,
        ) =>
          setSelectedPlayerId(
            playerId
          )
        }
      />
    )
  }


  if (loading) {
    return (
      <section className="screen insights-screen">
        <p className="eyebrow">
          Your shelf
        </p>

        <h1>
          Crunching the numbers...
        </h1>
      </section>
    )
  }


  if (
    error
    || !insights
  ) {
    return (
      <section className="screen insights-screen">
        <p className="eyebrow">
          Your shelf
        </p>

        <h1>
          Collection insights
        </h1>

        <p className="error-message">
          {error}
        </p>
      </section>
    )
  }


  return (
    <section className="screen insights-screen">
      <header>
        <h1>
          Insights
        </h1>

        <p className="subtitle">
          Your collection, plays,
          groups and memorable months.
        </p>
      </header>


      <div
        className="stats-section-tabs"
        aria-label="Insights sections"
      >
        {statsSections.map(
          (section) => (
            <button
              type="button"
              aria-pressed={
                activeSection
                === section.id
              }
              className={
                activeSection
                === section.id
                  ? "stats-section-tab active"
                  : "stats-section-tab"
              }
              key={section.id}
              onClick={() =>
                setActiveSection(
                  section.id
                )
              }
            >
              {section.label}
            </button>
          ),
        )}
      </div>


      {activeSection === "collection" && (
        <div
          className="stats-section-content"
        >
          <div className="stats-section-heading">
            <h2>
              Explore your shelf
            </h2>
          </div>

          <div className="insights-stat-grid">
            <article className="stat-card">
              <strong>
                {insights.total_games}
              </strong>

              <span>
                Games owned
              </span>
            </article>

            <article className="stat-card">
              <strong>
                {
                  insights
                    .collection_played_percentage
                }%
              </strong>

              <span>
                Shelf explored
              </span>
            </article>
          </div>

          <div className="insights-mini-grid">
            <article className="insight-mini-card">
              <span>
                Games played
              </span>

              <strong>
                {
                  insights
                    .played_games_count
                }
              </strong>
            </article>

            <article className="insight-mini-card">
              <span>
                Still waiting
              </span>

              <strong>
                {
                  insights
                    .never_played_count
                }
              </strong>
            </article>
          </div>
        </div>
      )}


      {activeSection === "play" && (
        <div
          className="stats-section-content"
        >
          <div className="stats-section-heading">
            <h2>
              Time around the table
            </h2>
          </div>

          <div className="insights-stat-grid">
            <article className="stat-card">
              <strong>
                {insights.total_plays}
              </strong>

              <span>
                Plays
              </span>
            </article>

            <article className="stat-card">
              <strong>
                {formatHours(
                  insights
                    .total_duration_minutes,
                )}
              </strong>

              <span>
                Hours played
              </span>
            </article>
          </div>

          <div className="insights-mini-grid">
            <article className="insight-mini-card">
              <span>
                Games played
              </span>

              <strong>
                {
                  insights
                    .played_games_count
                }
              </strong>
            </article>

            <article className="insight-mini-card">
              <span>
                Avg. play
              </span>

              <strong>
                {
                  insights
                    .average_duration_minutes
                  !== null
                    ? `${
                        insights
                          .average_duration_minutes
                      }m`
                    : "—"
                }
              </strong>
            </article>
          </div>
        </div>
      )}


      {activeSection === "rank" && (
        <div className="stats-section-content rank-insight-section">
          <section className="rank-insight-hero">
            <div>
              <p className="insight-label">
                Your ranking
              </p>

              <h2>
                Rank your shelf
              </h2>
            </div>

            <button
              type="button"
              className="rank-games-arrow"
              aria-label="Open game ranking"
              title="Rank your games"
              onClick={onOpenRankings}
            >
              <span aria-hidden="true">→</span>
            </button>
          </section>

          {rankingSummary
            && rankingSummary.games_count > 0
            ? (
              <>
                <section className="rank-insight-list-card">
                  <div className="rank-insight-list-heading">
                    <div>
                      <p className="insight-label">
                        Your favourites
                      </p>

                      <h2>
                        Top {rankSummaryLimit} games
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="rank-insight-share"
                      aria-label="Share ranking"
                      title="Share ranking"
                      disabled={rankSummaryLoading}
                      onClick={() => void shareRankStats()}
                    >
                      <ShareIcon />
                    </button>
                  </div>

                  <div
                    className="rank-insight-size-tabs"
                    aria-label="Ranking list size"
                  >
                    {rankSummaryLimits.map((limit) => (
                      <button
                        type="button"
                        className={
                          rankSummaryLimit === limit
                            ? "active"
                            : ""
                        }
                        aria-pressed={rankSummaryLimit === limit}
                        disabled={rankSummaryLoading}
                        key={limit}
                        onClick={() =>
                          void changeRankSummaryLimit(limit)
                        }
                      >
                        Top {limit}
                      </button>
                    ))}
                  </div>

                  <details className="rank-more-details">
                  <summary>
                    <span>
                      <strong>More rankings</strong>
                      <small>
                        Designers, publishers, mechanics and categories
                      </small>
                    </span>

                    <span
                      className="rank-more-chevron"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>

                  <div className="rank-summary-grid">
                    {([
                      ["Designers", rankingSummary.designers],
                      ["Publishers", rankingSummary.publishers],
                      ["Mechanics", rankingSummary.mechanics],
                      ["Categories", rankingSummary.categories],
                    ] as const).map(([label, items]) => (
                      <article
                        className="rank-summary-card"
                        key={label}
                      >
                        <p className="insight-label">
                          Top {label}
                        </p>

                        {items.length > 0 ? (
                          <ol>
                            {items.map((item) => (
                              <li key={item.name}>
                                <span>{item.name}</span>
                                <strong>{item.count}</strong>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="insight-empty">
                            Sync your collection to add this metadata.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </details>

                  <ol className="rank-insight-game-list">
                    {rankedGames
                      .slice(0, rankSummaryLimit)
                      .map((game, index) => (
                        <li key={game.bgg_id}>
                          <span className="rank-insight-position">
                            {index + 1}
                          </span>

                          <button
                            type="button"
                            className="rank-insight-game"
                            onClick={() =>
                              onOpenGame(game.bgg_id)
                            }
                          >
                            <span className="rank-insight-thumb">
                              {game.image_url
                                || game.thumbnail_url
                                ? (
                                  <img
                                    src={
                                      game.image_url
                                      ?? game.thumbnail_url
                                      ?? ""
                                    }
                                    alt=""
                                  />
                                )
                                : (
                                  <span aria-hidden="true">?</span>
                                )}
                            </span>

                            <span className="rank-insight-game-copy">
                              <strong>{game.name}</strong>
                              <small>
                                {game.comparisons_count} comparisons · {game.wins} wins
                              </small>
                            </span>
                          </button>
                        </li>
                      ))}
                  </ol>

                  {rankShareStatus && (
                    <p
                      className="rank-insight-share-status"
                      role="status"
                    >
                      {rankShareStatus}
                    </p>
                  )}
                </section>
              </>
            )
            : (
              <article className="rank-insight-empty">
                <h2>Start your ranking</h2>

                <p>
                  Make a few head-to-head choices and your Top 10, 20, 50 and 100 will start taking shape.
                </p>

                <button
                  type="button"
                  className="rank-games-primary"
                  onClick={onOpenRankings}
                >
                  Rank your first games
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            )}
        </div>
      )}


      {activeSection === "recaps" && (
        <div className="stats-section-heading">
          <h2>
            This month in games
          </h2>
        </div>
      )}


      {activeSection === "recaps" && (
      <article className="monthly-activity-card">
        <button
          type="button"
          className="monthly-activity-trigger"
          onClick={() =>
            setShowMonthlyPlays(
              (current) => !current
            )
          }
        >
          <div>
            <p className="insight-label">
              This month
            </p>

            <h2>
              Around the table
            </h2>
          </div>

          <span className="monthly-activity-chevron">
            {
              showMonthlyPlays
                ? "⌃"
                : "⌄"
            }
          </span>
        </button>

        <div className="monthly-activity-grid">
          <div className="monthly-activity-stat">
            <strong>
              {
                insights
                  .monthly_activity
                  .plays
              }
            </strong>

            <span>
              Plays
            </span>
          </div>

          <div className="monthly-activity-stat">
            <strong>
              {
                insights
                  .monthly_activity
                  .unique_games
              }
            </strong>

            <span>
              Games
            </span>
          </div>

          <div className="monthly-activity-stat">
            <strong>
              {
                insights
                  .monthly_activity
                  .new_games
              }
            </strong>

            <span>
              New
            </span>
          </div>

          <div className="monthly-activity-stat">
            <strong>
              {
                insights
                  .monthly_activity
                  .repeat_plays
              }
            </strong>

            <span>
              Repeat
            </span>
          </div>
        </div>

        {
          showMonthlyPlays
          && (
            <div className="monthly-play-list">
              {
                insights
                  .monthly_activity
                  .recent_plays
                  .map(
                    (play) => (
                      <div
                        key={
                          play.play_id
                        }
                        className="monthly-play-row"
                      >
                        <button
                          type="button"
                          className="monthly-play-game"
                          onClick={() =>
                            onOpenGame(
                              play.bgg_id
                            )
                          }
                        >
                          {
                            play
                              .game_name
                          }
                        </button>

                        <div className="monthly-play-meta">
                          <span>
                            {
                              formatPlayedAt(
                                play
                                  .played_at
                              )
                            }
                          </span>

                          <span>
                            {
                              play
                                .player_count
                            }{" "}
                            players
                          </span>
                        </div>
                      </div>
                    ),
                  )
              }

              {
                insights
                  .monthly_activity
                  .recent_plays
                  .length === 0
                && (
                  <p className="insight-empty">
                    No plays this month.
                  </p>
                )
              }
            </div>
          )
        }
      </article>
      )}


      {activeSection === "play" && (
      <div className="insight-feature-list">
        <article className="insight-feature">
          <p className="insight-label">
            Most played
          </p>

          {
            insights.most_played
              ? (
                <>
                  <h2>
                    {
                      insights
                        .most_played
                        .name
                    }
                  </h2>

                  <p className="insight-detail">
                    {
                      insights
                        .most_played
                        .play_count
                    }{" "}
                    {
                      insights
                        .most_played
                        .play_count
                      === 1
                        ? "play"
                        : "plays"
                    }
                  </p>
                </>
              )
              : (
                <p className="insight-empty">
                  No plays recorded yet.
                </p>
              )
          }
        </article>


        <article className="insight-feature">
          <p className="insight-label">
            Last played
          </p>

          {
            insights.last_played
              ? (
                <>
                  <h2>
                    {
                      insights
                        .last_played
                        .name
                    }
                  </h2>

                  <p className="insight-detail">
                    {
                      formatPlayedAt(
                        insights
                          .last_played
                          .played_at,
                      )
                    }
                  </p>
                </>
              )
              : (
                <p className="insight-empty">
                  Nothing has hit the
                  table yet.
                </p>
              )
          }
        </article>
      </div>
      )}


      {
        activeSection === "collection"
        && insights
          .neglected_games
          .length > 0
        && (
          <article className="players-card neglected-card">
            <div className="players-card-header">
              <div>
                <h2>
                  Waiting on the shelf
                </h2>
              </div>
            </div>

            <div className="player-list">
              {
                insights
                  .neglected_games
                  .slice(
                    0,
                    showAllNeglected
                      ? undefined
                      : 3
                  )
                  .map(
                    (
                      game,
                      index,
                    ) => (
                      <div
                        className="player-row neglected-game-row"
                        key={
                          game.bgg_id
                        }
                      >
                        <span className="player-rank">
                          {
                            index + 1
                          }
                        </span>

                        <button
                          type="button"
                          className="stats-game-link neglected-game-name"
                          onClick={() =>
                            onOpenGame(
                              game.bgg_id
                            )
                          }
                        >
                          <strong>
                            {
                              game.name
                            }
                          </strong>

                        </button>

                        <div className="player-stat">
                          <strong>
                            {
                              game
                                .play_count
                            }
                          </strong>

                          <span>
                            plays
                          </span>
                        </div>
                      </div>
                    ),
                  )
              }
            </div>

            {
              insights
                .neglected_games
                .length > 3
              && (
                <button
                  type="button"
                  className="insights-view-all"
                  onClick={() =>
                    setShowAllNeglected(
                      (current) =>
                        !current
                    )
                  }
                >
                  {
                    showAllNeglected
                      ? "Show less"
                      : "View all"
                  }
                </button>
              )
            }
          </article>
        )
      }


      {
        activeSection === "group"
        && insights
          .frequent_players
          .length > 0
        && (
          <article className="players-card">
            <div className="players-card-header">
              <div>
                <h2>
                  Friends
                </h2>
              </div>

              <span>
                Top 3
              </span>
            </div>

            <div className="player-list">
              {
                insights
                  .frequent_players
                  .slice(
                    0,
                    3
                  )
                  .map(
                    (
                      player,
                      index,
                    ) => (
                      <div
                        className="player-row"
                        key={
                          player.id
                        }
                      >
                        <span className="player-rank">
                          {
                            index + 1
                          }
                        </span>

                        <button
                          type="button"
                          className="player-name player-name-link"
                          onClick={() =>
                            setSelectedPlayerId(
                              player.id
                            )
                          }
                        >
                          {
                            player.name
                          }
                        </button>

                        <div className="player-stat">
                          <strong>
                            {
                              player
                                .play_count
                            }
                          </strong>

                          <span>
                            plays
                          </span>
                        </div>

                        <div className="player-stat">
                          <strong>
                            {
                              player
                                .win_count
                            }
                          </strong>

                          <span>
                            wins
                          </span>
                        </div>
                      </div>
                    ),
                  )
              }
            </div>
          </article>
        )
      }


      {
        activeSection === "group"
        && insights
          .top_games_by_player
          .length > 0
        && (
          <article className="players-card">
            <div className="players-card-header">
              <div>
                <h2>
                  Friends favourites
                </h2>
              </div>
            </div>

            <div className="player-list">
              {
                insights
                  .top_games_by_player
                  .slice(
                    0,
                    showAllFavourites
                      ? undefined
                      : 3
                  )
                  .map(
                    (
                      favourite,
                      index,
                    ) => (
                      <div
                        className="player-row favourite-game-row"
                        key={
                          favourite
                            .player_id
                        }
                      >
                        <span className="player-rank">
                          {
                            index + 1
                          }
                        </span>

                        <div className="favourite-game-copy">
                          <button
                            type="button"
                            className="favourite-player-link"
                            onClick={() =>
                              setSelectedPlayerId(
                                favourite
                                  .player_id
                              )
                            }
                          >
                            {
                              favourite
                                .player_name
                            }
                          </button>

                          <button
                            type="button"
                            className="stats-game-link favourite-game-link"
                            onClick={() =>
                              onOpenGame(
                                favourite
                                  .bgg_id
                              )
                            }
                          >
                            {
                              favourite
                                .game_name
                            }
                          </button>
                        </div>

                        <div className="player-stat">
                          <strong>
                            {
                              favourite
                                .play_count
                            }
                          </strong>

                          <span>
                            plays
                          </span>
                        </div>
                      </div>
                    ),
                  )
              }
            </div>

            {
              insights
                .top_games_by_player
                .length > 3
              && (
                <button
                  type="button"
                  className="insights-view-all"
                  onClick={() =>
                    setShowAllFavourites(
                      (current) =>
                        !current
                    )
                  }
                >
                  {
                    showAllFavourites
                      ? "Show less"
                      : "View all"
                  }
                </button>
              )
            }
          </article>
        )
      }


      {
        activeSection === "group"
        && insights
          .common_groups
          .length > 0
        && (
          <article className="players-card">
            <div className="players-card-header">
              <div>
                <p className="insight-label">
                  Regular groups
                </p>

                <h2>
                  Who plays together
                </h2>
              </div>
            </div>

            <div className="player-list">
              {
                insights
                  .common_groups
                  .slice(
                    0,
                    showAllGroups
                      ? undefined
                      : 3
                  )
                  .map(
                    (
                      group,
                      index,
                    ) => (
                      <div
                        className="player-row common-group-row"
                        key={
                          group
                            .player_ids
                            .join("-")
                        }
                      >
                        <span className="player-rank">
                          {
                            index + 1
                          }
                        </span>

                        <div className="player-name common-group-names">
                          {
                            group
                              .player_names
                              .join(" + ")
                          }
                        </div>

                        <div className="player-stat">
                          <strong>
                            {
                              group
                                .play_count
                            }
                          </strong>

                          <span>
                            plays
                          </span>
                        </div>
                      </div>
                    ),
                  )
              }
            </div>

            {
              insights
                .common_groups
                .length > 3
              && (
                <button
                  type="button"
                  className="insights-view-all"
                  onClick={() =>
                    setShowAllGroups(
                      (current) =>
                        !current
                    )
                  }
                >
                  {
                    showAllGroups
                      ? "Show less"
                      : "View all"
                  }
                </button>
              )
            }
          </article>
        )
      }


      {
        activeSection === "group"
        && insights.frequent_players.length === 0
        && insights.top_games_by_player.length === 0
        && insights.common_groups.length === 0
        && (
          <article className="stats-empty-card">
            <span aria-hidden="true">
              ◌
            </span>

            <h2>
              Group stories start with a play
            </h2>

            <p>
              Add players when logging games to reveal regular groups, favourite games and player profiles.
            </p>
          </article>
        )
      }


      {activeSection === "recaps" && (
        <article className="recaps-preview-card">
          <p className="insight-label">
            More stories to come
          </p>

          <h2>
            Your year in review
          </h2>

          <p>
            Yearly recaps will surface milestones, favourite groups, new discoveries and the games that defined your year.
          </p>
        </article>
      )}
    </section>
  )
}


export default InsightsView
