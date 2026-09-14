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


function DiscoverView({
  onViewWishlist,
}: Props) {
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
          : "Couldn't update your Want to Play list.",
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

        <button
          type="button"
          className="ghost-button discover-wishlist-link"
          onClick={onViewWishlist}
        >
          View Want to Play
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
          (recommendation) => {
            const {
              game,
              reasons,
              wishlisted,
            } = recommendation

            return (
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

                <div className="discover-actions">
                  <button
                    type="button"
                    className={
                      wishlisted
                        ? "primary-button wishlist-button saved"
                        : "primary-button wishlist-button"
                    }
                    disabled={
                      updatingIds.has(game.bgg_id)
                    }
                    onClick={() =>
                      toggleWishlist(recommendation)
                    }
                  >
                    {wishlisted
                      ? "Saved to Want to Play"
                      : "Want to Play"}
                  </button>

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
