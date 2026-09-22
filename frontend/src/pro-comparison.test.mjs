import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"

let server
let ProComparisonView
let SettingsView

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
  assert.match(markup, /Current plan: Free/)
  assert.match(markup, /Basic Game Night/)
  assert.match(markup, /Discover: Top 100/)
  assert.match(markup, /Personalised Discover \/ For You/)
  assert.match(markup, /Available with Pro/)
  assert.match(markup, /disabled=""[^>]*>Unlock ShelfPick Pro/)
  assert.match(markup, /Purchases are not available yet/)
  assert.doesNotMatch(markup, /Top 500/)
})

test("Pro plan uses account tier and entitlement without a purchase action", () => {
  const markup = render(ProComparisonView, {
    user: { ...user, tier: "PRO", entitlements: ["game_night_basic", "personalized_discover"] },
  })
  assert.match(markup, /Current plan: Pro/)
  assert.match(markup, /Personalised Discover \/ For You<\/span><span class="pro-feature-status">Available now/)
  assert.match(markup, /Advanced recommendation intelligence<\/span><span class="pro-feature-status">Coming later/)
  assert.doesNotMatch(markup, /Unlock ShelfPick Pro/)
})
