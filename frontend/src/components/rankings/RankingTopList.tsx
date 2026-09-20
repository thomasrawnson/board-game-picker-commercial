import {
  useEffect,
  useState,
} from "react"

import {
  getRankings,
  type RankingsResponse,
} from "../../api/client"


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

type Props = {
  playedOnly: boolean
  onOpenGame?: (bggId: number) => void
}


function RankingTopList({
  playedOnly,
  onOpenGame,
}: Props) {
  const [
    rankedGames,
    setRankedGames,
  ] = useState<RankingsResponse["rankings"]>([])

  const [
    rankSummaryLimit,
    setRankSummaryLimit,
  ] = useState<RankSummaryLimit>(20)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState("")

  const [
    shareStatus,
    setShareStatus,
  ] = useState("")


  useEffect(() => {
    let active = true

    setLoading(true)
    setError("")
    setShareStatus("")

    getRankings(
      playedOnly,
      rankSummaryLimit,
    )
      .then((result) => {
        if (active) {
          setRankedGames(
            result.rankings,
          )
        }
      })
      .catch((err) => {
        console.error(err)

        if (active) {
          setError(
            "Couldn't load your ranked games.",
          )
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [
    playedOnly,
    rankSummaryLimit,
  ])


  async function shareRankStats() {
    const games =
      rankedGames.slice(
        0,
        rankSummaryLimit,
      )

    if (games.length === 0) {
      return
    }

    const title =
      `My Top ${games.length} Board Games`

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
        await navigator.share({
          title,
          text,
        })
        setShareStatus(
          "Ranking shared",
        )
      } else {
        await navigator.clipboard.writeText(
          text,
        )
        setShareStatus(
          "Ranking copied",
        )
      }
    } catch (err) {
      if (
        err instanceof DOMException
        && err.name === "AbortError"
      ) {
        return
      }

      console.error(err)
      setShareStatus(
        "Couldn't share ranking",
      )
    }
  }


  return (
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
          disabled={
            loading
            || rankedGames.length === 0
          }
          onClick={() =>
            void shareRankStats()
          }
        >
          Share
        </button>
      </div>

      <div
        className="rank-insight-size-tabs"
        aria-label="Ranking list size"
      >
        {rankSummaryLimits.map(
          (limit) => (
            <button
              type="button"
              className={
                rankSummaryLimit
                  === limit
                  ? "active"
                  : ""
              }
              aria-pressed={
                rankSummaryLimit
                === limit
              }
              disabled={loading}
              key={limit}
              onClick={() =>
                setRankSummaryLimit(
                  limit,
                )
              }
            >
              Top {limit}
            </button>
          ),
        )}
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {!error
        && !loading
        && rankedGames.length === 0 && (
        <p className="insight-empty">
          Make a few ranking choices and your list will appear here.
        </p>
      )}

      {rankedGames.length > 0 && (
        <ol className="rank-insight-game-list">
          {rankedGames
            .slice(
              0,
              rankSummaryLimit,
            )
            .map((game, index) => (
              <li key={game.bgg_id}>
                <span className="rank-insight-position">
                  {index + 1}
                </span>

                <button
                  type="button"
                  className="rank-insight-game"
                  disabled={!onOpenGame}
                  onClick={() =>
                    onOpenGame?.(
                      game.bgg_id,
                    )
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
                        <span aria-hidden="true">
                          ?
                        </span>
                      )}
                  </span>

                  <span className="rank-insight-game-copy">
                    <strong>
                      {game.name}
                    </strong>
                    <small>
                      {game.comparisons_count} comparisons · {game.wins} wins
                    </small>
                  </span>
                </button>
              </li>
            ))}
        </ol>
      )}

      {shareStatus && (
        <p
          className="rank-insight-share-status"
          role="status"
        >
          {shareStatus}
        </p>
      )}
    </section>
  )
}


export default RankingTopList
