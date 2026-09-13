import {
  useEffect,
  useState,
} from "react"

import {
  getDiscoverRecommendations,
  type DiscoverRecommendation,
} from "../api/client"


function DiscoverView() {
  const [
    recommendations,
    setRecommendations,
  ] =
    useState<
      DiscoverRecommendation[]
    >([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState("")


  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const results =
          await getDiscoverRecommendations()

        if (!cancelled) {
          setRecommendations(
            results
          )
        }
      } catch (err) {
        console.error(err)

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load recommendations."
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false
          )
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])


  return (
    <section className="screen discover-screen">
      <header>
        <p className="eyebrow">
          Discover
        </p>

        <h1>
          Find your next game
        </h1>

        <p className="subtitle">
          Games you don't already own,
          matched against your collection
          and what's popular right now.
        </p>
      </header>


      {loading && (
        <p className="subtitle">
          Finding games for you...
        </p>
      )}


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      {!loading &&
        !error &&
        recommendations.length === 0 && (
        <div className="discover-card">
          <h2>
            Nothing new just yet
          </h2>

          <p>
            We couldn't find a suitable
            recommendation right now.
            Check back later.
          </p>
        </div>
      )}


      <div className="discover-list">
        {recommendations.map(
          ({
            game,
            reasons,
          }) => (
            <article
              key={game.bgg_id}
              className="discover-card"
            >
              {game.image_url && (
                <img
                  className="discover-image"
                  src={
                    game.image_url
                  }
                  alt=""
                />
              )}

              <div>
                <h2>
                  {game.name}
                </h2>

                <p className="discover-meta">
                  {game.min_players}
                  {"–"}
                  {game.max_players}
                  {" players"}

                  {game.max_play_time
                    ? ` · ${game.max_play_time} min`
                    : ""}

                  {game.complexity
                    ? ` · ${game.complexity.toFixed(1)} complexity`
                    : ""}
                </p>

                <ul className="discover-reasons">
                    {reasons.map(
                        (reason: string) => (
                            <li key={reason}>
                            {reason}
                            </li>
                        ),
                        )}
                </ul>

                <a
                  className="ghost-button"
                  href={
                    `https://boardgamegeek.com/boardgame/${game.bgg_id}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  View on BGG
                </a>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  )
}


export default DiscoverView