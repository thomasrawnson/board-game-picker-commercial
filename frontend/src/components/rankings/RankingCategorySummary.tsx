import {
  useEffect,
  useState,
} from "react"

import {
  getRankings,
  type RankingSummary,
} from "../../api/client"


function RankingCategorySummary() {
  const [
    summary,
    setSummary,
  ] = useState<RankingSummary | null>(
    null,
  )

  const [
    error,
    setError,
  ] = useState("")


  useEffect(() => {
    let active = true

    getRankings(
      true,
      20,
    )
      .then((result) => {
        if (active) {
          setSummary(result.summary)
        }
      })
      .catch((err) => {
        console.error(err)

        if (active) {
          setError(
            "Couldn't load shelf rankings.",
          )
        }
      })

    return () => {
      active = false
    }
  }, [])


  if (error) {
    return (
      <p className="error-message">
        {error}
      </p>
    )
  }

  if (!summary) {
    return null
  }


  return (
    <section>
      <div className="stats-section-heading">
        <h2>
          Shelf leaders
        </h2>
      </div>

      <div className="rank-summary-grid">
        {([
          [
            "Publishers",
            summary.publishers,
          ],
          [
            "Designers",
            summary.designers,
          ],
          [
            "Mechanics",
            summary.mechanics,
          ],
          [
            "Categories",
            summary.categories,
          ],
        ] as const).map(
          ([label, items]) => (
            <article
              className="rank-summary-card"
              key={label}
            >
              <p className="insight-label">
                Top {label}
              </p>

              {items.length > 0 ? (
                <ol>
                  {items.map(
                    (item) => (
                      <li key={item.name}>
                        <span>
                          {item.name}
                        </span>
                        <strong>
                          {item.count}
                        </strong>
                      </li>
                    ),
                  )}
                </ol>
              ) : (
                <p className="insight-empty">
                  Sync your collection to add this metadata.
                </p>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  )
}


export default RankingCategorySummary
