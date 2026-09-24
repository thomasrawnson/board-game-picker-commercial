import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"

let server
let ProComparisonView
let SettingsView
let DiscoverView

const user = {
  id: 1, email: "morgan@example.com", display_name: "Morgan", bgg_username: null,
  email_verified: true, onboarding_completed: true, preferred_player_count: null,
  preferred_play_time: null, profile_player_id: 1, player_name: "Morgan",
  avatar_key: "forest", tier: "FREE", entitlements: ["game_night_basic"],
}

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" })
  ProComparisonView = (await server.ssrLoadModule("/src/components/ProComparisonView.tsx")).default
  SettingsView = (await server.ssrLoadModule("/src/components/SettingsView.tsx")).default
  DiscoverView = (await server.ssrLoadModule("/src/components/DiscoverView.tsx")).default
})

after(async () => { await server?.close() })

function render(view, props) {
  return renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(view, props)))
}

test("both Settings Pro entries open the comparison route", () => {
  globalThis.window = { shelfPickTheme: { getPreference: () => "system" } }
  const markup = render(SettingsView, { user, onLogout: () => {} })
  assert.match(markup, /href="\/settings\/pro"[^>]*>.*?Unlock Pro/s)
  assert.match(markup, /href="\/settings\/pro"[^>]*>.*?Compare Free vs Pro/s)
  delete globalThis.window
})

test("Free plan shows current essentials and an unavailable purchase action", () => {
  const markup = render(ProComparisonView, { user })
  assert.match(markup, /Free <span class="pro-plan-state">Current plan/)
  assert.match(markup, /Basic Game Night/)
  assert.match(markup, /Discover Top 100/)
  assert.match(markup, /For You/)
  assert.match(markup, /Pro — one-time unlock/)
  assert.match(markup, /One-time purchase — price coming soon/)
  assert.match(markup, /disabled=""[^>]*>Unlock ShelfPick Pro/)
  assert.match(markup, /Purchases are not available yet/)
  assert.doesNotMatch(markup, /monthly|subscription/i)
})

test("Pro plan is current without a purchase action", () => {
  const markup = render(ProComparisonView, {
    user: { ...user, tier: "PRO", entitlements: ["game_night_basic", "personalized_discover"] },
  })
  assert.match(markup, /Pro <span class="pro-plan-state">Current plan/)
  assert.doesNotMatch(markup, /Unlock ShelfPick Pro/)
})

test("matrix separates included, planned and excluded with accessible labels", () => {
  const markup = render(ProComparisonView, { user })
  const row = name => markup.match(new RegExp(`<tr><th scope="row">${name}<\\/th>(.*?)<\\/tr>`))?.[1]
  assert.match(row("Collection management"), /Included now.*Included now/)
  assert.match(row("Basic Game Night"), /Included now.*Included now/)
  assert.match(row("For You"), /Not included.*Included now/)
  assert.match(row("Advanced recommendations"), /Not included.*Coming later/)
  assert.match(markup, /ShelfPick Free and Pro feature comparison/)
})

test("Discover and the Free comparison use the same Top 100 label", () => {
  const discover = renderToStaticMarkup(React.createElement(DiscoverView, {
    personalized: false, onViewWishlist: () => {}, onUnlockPro: () => {},
  }))
  const comparison = render(ProComparisonView, { user })
  assert.match(discover, /role="tab"[^>]*>Top 100<\/button>/)
  assert.match(comparison, /Discover Top 100/)
})
