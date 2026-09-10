import {
  useEffect,
  useState,
} from "react"

import {
  getCollectionInsights,
  type CollectionInsights,
} from "../api/client"

import PlayerProfile
  from "./players/PlayerProfile"


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


type Props = {
  onOpenGame:
    (bggId: number) => void
}


function InsightsView({
  onOpenGame,
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


  useEffect(() => {
    async function loadInsights() {
      try {
        const result =
          await getCollectionInsights()

        setInsights(result)
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
        <p className="eyebrow">
          Your shelf
        </p>

        <h1>
          Collection insights
        </h1>

        <p className="subtitle">
          What you've played,
          who you've played with
          and what's still waiting
          on the shelf.
        </p>
      </header>


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
            {insights.total_plays}
          </strong>

          <span>
            Plays
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


      {
        insights
          .neglected_games
          .length > 0
        && (
          <article className="players-card neglected-card">
            <div className="players-card-header">
              <div>
                <p className="insight-label">
                  Needs some love
                </p>

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
        insights
          .frequent_players
          .length > 0
        && (
          <article className="players-card">
            <div className="players-card-header">
              <div>
                <p className="insight-label">
                  Table regulars
                </p>

                <h2>
                  Your players
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
        insights
          .top_games_by_player
          .length > 0
        && (
          <article className="players-card">
            <div className="players-card-header">
              <div>
                <p className="insight-label">
                  Player favourites
                </p>

                <h2>
                  Their go-to games
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
        insights
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


      <article className="shelf-callout">
        <strong>
          {
            insights
              .never_played_count
          }
        </strong>

        <div>
          <span>
            games waiting
          </span>

          <p>
            Still looking for their
            next night on the table.
          </p>
        </div>
      </article>
    </section>
  )
}


export default InsightsView