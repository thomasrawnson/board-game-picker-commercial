import { Link } from "react-router-dom"

import type { AuthUser } from "../auth"
import { APP_PATHS } from "../routes"

const freeFeatures = [
  "Collection management",
  "Want to Play / Wishlist",
  "Core Pick",
  "Basic play tracking",
  "Discover: Hot",
  "Discover: Top 100",
  "Basic Game Night",
]

const proFeatures = [
  { name: "Advanced recommendation intelligence", status: "Coming later" },
  { name: "Enhanced Game Night", status: "Coming later" },
  { name: "Richer statistics", status: "Coming later" },
  { name: "Future premium features", status: "Coming later" },
]

function FeatureRow({ name, status }: { name: string; status: string }) {
  return <li className="pro-feature-row">
    <span>{name}</span>
    <span className="pro-feature-status">{status}</span>
  </li>
}

function ProComparisonView({ user }: { user: AuthUser }) {
  const isPro = user.tier === "PRO"
  const forYouStatus = isPro
    ? user.entitlements.includes("personalized_discover") ? "Available now" : "Not enabled"
    : "Available with Pro"

  return <section className="screen pro-comparison-screen" aria-labelledby="pro-comparison-heading">
    <Link className="settings-back-link" to={APP_PATHS.settings}>Back to Settings</Link>
    <header className="pro-comparison-heading">
      <h1 id="pro-comparison-heading">Free and Pro</h1>
      <p>See what you can use today and what is planned for ShelfPick Pro.</p>
      <strong className="pro-current-plan" role="status">Current plan: {isPro ? "Pro" : "Free"}</strong>
    </header>

    <div className="pro-comparison-plans">
      <section className="pro-plan" aria-labelledby="free-plan-heading">
        <h2 id="free-plan-heading">Free</h2>
        <p>The essentials for choosing and tracking games.</p>
        <ul>
          {freeFeatures.map(name => <FeatureRow key={name} name={name} status="Available now" />)}
        </ul>
      </section>

      <section className="pro-plan" aria-labelledby="pro-plan-heading">
        <h2 id="pro-plan-heading">ShelfPick Pro</h2>
        <p>More personal recommendations as Pro grows.</p>
        <ul>
          <FeatureRow name="Personalised Discover / For You" status={forYouStatus} />
          {proFeatures.map(({ name, status }) => <FeatureRow key={name} name={name} status={status} />)}
        </ul>
      </section>
    </div>

    {!isPro && <div className="pro-unlock-pending">
      <button type="button" className="primary-button" disabled>Unlock ShelfPick Pro</button>
      <p>Coming soon. Purchases are not available yet.</p>
    </div>}
  </section>
}

export default ProComparisonView
