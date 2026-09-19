import RetryNotice from "./ui/RetryNotice"
import {
  useEffect,
  useRef,
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

  const [reloadKey, setReloadKey] = useState(0)
  const pendingIds = useRef(new Set<number>())
  function retry() { setLoading(true); setReloadKey(current => current + 1) }
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const results =
          await getDiscoverRecommendations()

        if (!cancelled) {
          setRecommendations(results)
          setError("")
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
  }, [reloadKey])

  async function toggleWishlist(
    recommendation: DiscoverRecommendation,
  ) {
    const bggId = recommendation.game.bgg_id
    if (pendingIds.current.has(bggId)) return
    pendingIds.current.add(bggId)
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
          : "Couldn't update Want to Play.",
      )
    } finally {
      pendingIds.current.delete(bggId)
      setUpdatingIds((current) => {
        const next = new Set(current)
        next.delete(bggId)
        return next
      })
    }
  }

  function dismissRecommendation(
    bggId: number,
  ) {
    setRecommendations(
      (current) => current.filter(
        (item) => item.game.bgg_id !== bggId,
      ),
    )
  }

  return (
    <section className="screen discover-screen">
      <header className="discover-header">
        <div>
          <h1>Discover games</h1>
          <p className="subtitle">
            Recommendations beyond your shelf.
          </p>
        </div>

        <button
          type="button"
          className="discover-wishlist-link"
          onClick={onViewWishlist}
        >
          Want to Play
          <span aria-hidden="true">→</span>
        </button>
      </header>

      {loading && (
        <p className="subtitle">
          Finding games for you...
        </p>
      )}

      {error && (
        <RetryNotice message={error} busy={loading} onRetry={retry} />
      )}

      {actionError && (
        <p className="error-message" role="alert">
          {actionError}
        </p>
      )}

      {!loading
        && !error
        && recommendations.length === 0
        && (
          <div className="discover-empty">
            <h2>No more recommendations</h2>
            <p>
              You have worked through the current list.
              Check back later for more ideas.
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

            return (
              <article
                key={game.bgg_id}
                className="discover-card"
              >
                <button
                  type="button"
                  className={
                    wishlisted
                      ? "discover-save-button saved"
                      : "discover-save-button"
                  }
                  aria-label={
                    wishlisted
                      ? `Remove ${game.name} from Want to Play`
                      : `Save ${game.name} to Want to Play`
                  }
                  aria-pressed={wishlisted}
                  title={
                    wishlisted
                      ? "Remove from Want to Play"
                      : "Save to Want to Play"
                  }
                  disabled={
                    updatingIds.has(game.bgg_id)
                  }
                  onClick={() =>
                    void toggleWishlist(recommendation)
                  }
                >
                  {wishlisted ? "✓" : "+"}
                </button>

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
                </div>

                <div className="discover-copy">
                  <h2>{game.name}</h2>

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

                  <span className="discover-match-pill">
                    {recommendationLabel(index)}
                  </span>

                  {reasons.length > 0 && (
                    <details className="discover-reason-details">
                      <summary>
                        Why this match?
                      </summary>

                      <ul className="discover-reasons">
                        {reasons.map(
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

                    <button
                      type="button"
                      className="discover-dismiss-button"
                      onClick={() =>
                        dismissRecommendation(game.bgg_id)
                      }
                    >
                      Not interested
                    </button>
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
