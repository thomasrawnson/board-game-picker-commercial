import {
  useEffect,
  useState,
} from "react"

import {
  addToWishlist,
  getDiscoverRecommendations,
  removeFromWishlist,
  type DiscoverRecommendation,
} from "../api/client"

type Props = {
  onViewWishlist: () => void
}

function recommendationLabel(
  index: number,
) {
  if (index === 0) {
    return "Top match"
  }

  if (index < 3) {
    return "Strong match"
  }

  return "Good fit"
}

function complexityLabel(
  value: number | null | undefined,
) {
  if (value == null) {
    return null
  }

  if (value <= 2) {
    return "Light"
  }

  if (value <= 3) {
    return "Medium"
  }

  if (value <= 4) {
    return "Heavy"
  }

  return "Very heavy"
}

function DiscoverView({
  onViewWishlist,
}: Props) {
  const [
    recommendations,
    setRecommendations,
  ] = useState<DiscoverRecommendation[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState("")

  const [
    updatingIds,
    setUpdatingIds,
  ] = useState<Set<number>>(
    new Set(),
  )

  const [
    actionError,
    setActionError,
  ] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const results =
          await getDiscoverRecommendations()

        if (!cancelled) {
          setRecommendations(results)
        }
      } catch (err) {
        console.error(err)

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load recommendations.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  async function toggleWishlist(
    recommendation: DiscoverRecommendation,
  ) {
    const bggId = recommendation.game.bgg_id
    const wasWishlisted = recommendation.wishlisted

    setActionError("")
    setUpdatingIds(
      (current) => new Set(current).add(bggId),
    )

    setRecommendations(
      (current) => current.map(
        (item) => item.game.bgg_id === bggId
          ? {
              ...item,
              wishlisted: !wasWishlisted,
            }
          : item,
      ),
    )

    try {
      if (wasWishlisted) {
        await removeFromWishlist(bggId)
      } else {
        await addToWishlist(bggId)
      }
    } catch (err) {
      setRecommendations(
        (current) => current.map(
          (item) => item.game.bgg_id === bggId
            ? {
                ...item,
                wishlisted: wasWishlisted,
              }
            : item,
        ),
      )

      setActionError(
        err instanceof Error
          ? err.message
          : "Couldn't update your Wishlist.",
      )
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current)
        next.delete(bggId)
        return next
      })
    }
  }

  return (
    <section className="screen discover-screen">
      <header className="discover-header">
        <div>
          <h1>Find your next game</h1>
          <p className="subtitle">
            Recommendations beyond your shelf.
          </p>
        </div>

        <button
          type="button"
          className="discover-wishlist-link"
          onClick={onViewWishlist}
        >
          Wishlist
          <span aria-hidden="true">→</span>
        </button>
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

      {actionError && (
        <p className="error-message">
          {actionError}
        </p>
      )}

      {!loading
        && !error
        && recommendations.length === 0
        && (
          <div className="discover-empty">
            <h2>Nothing new just yet</h2>
            <p>
              No suitable recommendations right now.
              Check back later.
            </p>
          </div>
        )}

      <div className="discover-list">
        {recommendations.map(
          (recommendation, index) => {
            const {
              game,
              reasons,
              wishlisted,
            } = recommendation

            const complexity =
              complexityLabel(game.complexity)

            const primaryReason =
              reasons[0] ?? null

            const extraReasons =
              reasons.slice(1)

            return (
              <article
                key={game.bgg_id}
                className="discover-card"
              >
                <div className="discover-media">
                  {game.image_url ? (
                    <img
                      className="discover-image"
                      src={game.image_url}
                      alt=""
                    />
                  ) : (
                    <div
                      className="discover-image-placeholder"
                      aria-hidden="true"
                    >
                      ?
                    </div>
                  )}

                  <button
                    type="button"
                    className={
                      wishlisted
                        ? "wishlist-bookmark-button saved"
                        : "wishlist-bookmark-button"
                    }
                    aria-label={
                      wishlisted
                        ? `Remove ${game.name} from Wishlist`
                        : `Save ${game.name} to Wishlist`
                    }
                    aria-pressed={wishlisted}
                    title={
                      wishlisted
                        ? "Remove from Wishlist"
                        : "Save to Wishlist"
                    }
                    disabled={
                      updatingIds.has(game.bgg_id)
                    }
                    onClick={() =>
                      void toggleWishlist(recommendation)
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="wishlist-bookmark-icon"
                    >
                      <path
                        d="M6.75 4.75A1.75 1.75 0 0 1 8.5 3h7A1.75 1.75 0 0 1 17.25 4.75v15l-5.25-3.2-5.25 3.2v-15Z"
                        fill={
                          wishlisted
                            ? "currentColor"
                            : "none"
                        }
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="discover-copy">
                  <div className="discover-title-row">
                    <div>
                      <p className="discover-match-score">
                        {recommendationLabel(index)}
                      </p>

                      <h2>{game.name}</h2>
                    </div>
                  </div>

                  <p className="discover-meta">
                    {game.min_players}
                    {"–"}
                    {game.max_players}
                    {" players"}
                    {game.max_play_time
                      ? ` · ${game.max_play_time} min`
                      : ""}
                    {complexity
                      ? ` · ${complexity}`
                      : ""}
                  </p>

                  {primaryReason && (
                    <p className="discover-primary-reason">
                      {primaryReason}
                    </p>
                  )}

                  {extraReasons.length > 0 && (
                    <details className="discover-reason-details">
                      <summary>
                        Why this match?
                      </summary>

                      <ul className="discover-reasons">
                        {extraReasons.map(
                          (reason: string) => (
                            <li key={reason}>
                              {reason}
                            </li>
                          ),
                        )}
                      </ul>
                    </details>
                  )}

                  <div className="discover-actions">
                    <a
                      className="discover-bgg-link"
                      href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on BGG
                    </a>
                  </div>
                </div>
              </article>
            )
          },
        )}
      </div>
    </section>
  )
}

export default DiscoverView
