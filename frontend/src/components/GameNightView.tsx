const features = [
  {
    title: "Bring everyone together",
    detail:
      "Invite friends with a simple link, with no account required for guests.",
  },
  {
    title: "Combine your collections",
    detail:
      "Find the right game from anything owned by the people attending.",
  },
  {
    title: "Fit the exact group",
    detail:
      "Match player count, available time and complexity—not just the printed box range.",
  },
  {
    title: "Learn what works together",
    detail:
      "Use the games this specific group has enjoyed and played before.",
  },
  {
    title: "Choose as a group",
    detail:
      "Get a ranked shortlist of 3–5 games, then discuss, vote and make the final call.",
  },
]


function GameNightView() {
  return (
    <section className="screen game-night-screen">
      <header className="game-night-hero">
        <span className="coming-soon-badge">
          Coming soon
        </span>

        <p className="eyebrow">
          Game Night
        </p>

        <h1>
          Your whole group. One great shortlist.
        </h1>

        <p className="game-night-intro">
          Turn everyone's games and shared history into a shortlist worth arguing about.
        </p>
      </header>

      <div className="game-night-preview">
        <p className="game-night-preview-label">
          Built for the decision before the game
        </p>

        <ul className="game-night-features">
          {features.map(
            (feature) => (
              <li key={feature.title}>
                <span
                  className="game-night-check"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <div>
                  <strong>
                    {feature.title}
                  </strong>

                  <p>
                    {feature.detail}
                  </p>
                </div>
              </li>
            ),
          )}
        </ul>
      </div>

      <p className="game-night-footnote">
        Game Night will build on Pick, so every suggestion must genuinely suit the people at the table.
      </p>
    </section>
  )
}


export default GameNightView
