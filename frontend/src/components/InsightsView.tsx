import { useEffect, useState } from "react"

import {
  getCollectionInsights,
  type CollectionInsights,
} from "../api/client"


function formatPlayedAt(
  value: string,
): string {
  const date = new Date(value)

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
  const hours = minutes / 60

  if (hours < 10) {
    return hours.toFixed(1)
  }

  return Math.round(hours).toString()
}


function InsightsView() {
  const [insights, setInsights] =
    useState<CollectionInsights | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

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

  if (error || !insights) {
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
          What you've played, who you've
          played with and what's still
          waiting on the shelf.
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
            {insights.played_games_count}
          </strong>
        </article>

        <article className="insight-mini-card">
          <span>
            Avg. play
          </span>

          <strong>
            {insights
              .average_duration_minutes !==
            null
              ? `${insights.average_duration_minutes}m`
              : "—"}
          </strong>
        </article>
      </div>

      <div className="insight-feature-list">
        <article className="insight-feature">
          <p className="insight-label">
            Most played
          </p>

          {insights.most_played ? (
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
                    .play_count === 1
                    ? "play"
                    : "plays"
                }
              </p>
            </>
          ) : (
            <p className="insight-empty">
              No plays recorded yet.
            </p>
          )}
        </article>

        <article className="insight-feature">
          <p className="insight-label">
            Last played
          </p>

          {insights.last_played ? (
            <>
              <h2>
                {
                  insights
                    .last_played
                    .name
                }
              </h2>

              <p className="insight-detail">
                {formatPlayedAt(
                  insights
                    .last_played
                    .played_at,
                )}
              </p>
            </>
          ) : (
            <p className="insight-empty">
              Nothing has hit the table yet.
            </p>
          )}
        </article>
      </div>

      {insights.frequent_players.length > 0 && (
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
              Top {
                insights
                  .frequent_players
                  .length
              }
            </span>
          </div>

          <div className="player-list">
            {insights.frequent_players.map(
              (player, index) => (
                <div
                  className="player-row"
                  key={player.name}
                >
                  <span className="player-rank">
                    {index + 1}
                  </span>

                  <div className="player-name">
                    {player.name}
                  </div>

                  <div className="player-stat">
                    <strong>
                      {player.play_count}
                    </strong>

                    <span>
                      plays
                    </span>
                  </div>

                  <div className="player-stat">
                    <strong>
                      {player.win_count}
                    </strong>

                    <span>
                      wins
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      )}

      <article className="shelf-callout">
        <strong>
          {insights.never_played_count}
        </strong>

        <div>
          <span>
            games waiting
          </span>

          <p>
            Still looking for their next
            night on the table.
          </p>
        </div>
      </article>
    </section>
  )
}


export default InsightsView