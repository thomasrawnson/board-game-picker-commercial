import {
  useEffect,
  useState,
} from "react"

import {
  getWishlist,
  removeFromWishlist,
  type Game,
} from "../api/client"


function WishlistView() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [removingId, setRemovingId] = useState<number | null>(null)

  useEffect(() => {
    async function loadWishlist() {
      try {
        setGames(await getWishlist())
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't load your Want to Play list.",
        )
      } finally {
        setLoading(false)
      }
    }

    void loadWishlist()
  }, [])

  async function removeGame(game: Game) {
    setRemovingId(game.bgg_id)
    setError("")

    try {
      await removeFromWishlist(game.bgg_id)
      setGames(
        (current) => current.filter(
          (item) => item.bgg_id !== game.bgg_id,
        ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't remove that game.",
      )
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <p className="subtitle">
        Opening your Want to Play list...
      </p>
    )
  }

  return (
    <>
      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {games.length === 0 && !error && (
        <div className="collection-empty">
          <strong>No saved games yet</strong>
          <p>
            Save recommendations from Discover and
            they will appear here.
          </p>
        </div>
      )}

      <div className="wishlist-list">
        {games.map((game) => (
          <article
            className="wishlist-card"
            key={game.bgg_id}
          >
            {game.image_url && (
              <img
                className="wishlist-image"
                src={game.image_url}
                alt=""
              />
            )}

            <div className="wishlist-card-body">
              <h2>{game.name}</h2>

              <p className="wishlist-meta">
                {game.min_players !== null
                  && game.max_players !== null
                  ? `${game.min_players}–${game.max_players} players`
                  : "Player count unavailable"}

                {game.max_play_time !== null
                  ? ` · ${game.max_play_time} min`
                  : ""}

                {game.complexity !== null
                  ? ` · ${game.complexity.toFixed(1)} complexity`
                  : ""}
              </p>

              <button
                type="button"
                className="ghost-button wishlist-remove"
                disabled={removingId === game.bgg_id}
                onClick={() => removeGame(game)}
              >
                {removingId === game.bgg_id
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}


export default WishlistView
