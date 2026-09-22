import { Link } from "react-router-dom"

import type { AuthUser } from "../auth"
import { APP_PATHS } from "../routes"

type Availability = "included" | "planned" | "excluded"

const features: { name: string; free: Availability; pro: Availability }[] = [
  { name: "Collection management", free: "included", pro: "included" },
  { name: "Want to Play", free: "included", pro: "included" },
  { name: "Core Pick", free: "included", pro: "included" },
  { name: "Basic play tracking", free: "included", pro: "included" },
  { name: "Discover Hot", free: "included", pro: "included" },
  { name: "Discover Top 500", free: "included", pro: "included" },
  { name: "Basic Game Night", free: "included", pro: "included" },
  { name: "For You", free: "excluded", pro: "included" },
  { name: "Advanced recommendations", free: "excluded", pro: "planned" },
  { name: "Enhanced Game Night", free: "excluded", pro: "planned" },
  { name: "Richer statistics", free: "excluded", pro: "planned" },
]

const availability = {
  included: { symbol: "✓", label: "Included now" },
  planned: { symbol: "•", label: "Coming later" },
  excluded: { symbol: "—", label: "Not included" },
} as const

function AvailabilityCell({ value, current }: { value: Availability; current: boolean }) {
  const { symbol, label } = availability[value]
  return <td className={`pro-matrix-cell pro-matrix-${value}${current ? " current" : ""}`}>
    <span aria-hidden="true">{symbol}</span>
    <span className="sr-only">{label}</span>
  </td>
}

function ProComparisonView({ user }: { user: AuthUser }) {
  const isPro = user.tier === "PRO"

  return <section className="screen pro-comparison-screen" aria-labelledby="pro-comparison-heading">
    <Link className="settings-back-link" to={APP_PATHS.settings}>Back to Settings</Link>
    <header className="pro-comparison-heading">
      <h1 id="pro-comparison-heading">Free and Pro</h1>
      <p>Pro — one-time unlock</p>
    </header>

    <div className="pro-matrix-wrap">
      <table className="pro-matrix">
        <caption className="sr-only">ShelfPick Free and Pro feature comparison</caption>
        <colgroup><col className="pro-matrix-feature-column" /><col /><col /></colgroup>
        <thead>
          <tr>
            <th scope="col">Feature</th>
            <th scope="col" className={!isPro ? "current" : ""}>
              Free {!isPro && <span className="pro-plan-state">Current plan</span>}
            </th>
            <th scope="col" className={isPro ? "current" : ""}>
              Pro <span className="pro-plan-state">{isPro ? "Current plan" : "Upgrade coming soon"}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map(feature => <tr key={feature.name}>
            <th scope="row">{feature.name}</th>
            <AvailabilityCell value={feature.free} current={!isPro} />
            <AvailabilityCell value={feature.pro} current={isPro} />
          </tr>)}
        </tbody>
      </table>
    </div>

    <p className="pro-matrix-key" aria-label="Comparison key">
      <span><span aria-hidden="true">✓</span> Included now</span>
      <span><span aria-hidden="true">•</span> Coming later</span>
      <span><span aria-hidden="true">—</span> Not included</span>
    </p>

    {!isPro && <div className="pro-unlock-pending">
      <p>One-time purchase — price coming soon</p>
      <button type="button" className="primary-button" disabled>Unlock ShelfPick Pro</button>
      <p>Purchases are not available yet.</p>
    </div>}
  </section>
}

export default ProComparisonView
