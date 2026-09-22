import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

let server
let telemetry
let AppErrorBoundary

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" })
  telemetry = await server.ssrLoadModule("/src/telemetry.ts")
  AppErrorBoundary = (await server.ssrLoadModule("/src/components/AppErrorBoundary.tsx")).default
})

after(async () => {
  telemetry?.setAnalyticsSink(null)
  telemetry?.setErrorSink(null)
  await server?.close()
})

test("the analytics seam emits only the supplied low-risk event and tolerates unavailable providers", () => {
  const events = []
  telemetry.setAnalyticsSink(null)
  assert.doesNotThrow(() => telemetry.trackEvent("wishlist_added", { source: "discover" }))
  telemetry.setAnalyticsSink(event => events.push(event))
  telemetry.trackEvent("picker_completed", {
    source: "pick", player_count: 3, time_band: "up_to_90", result_count: 0,
  })
  assert.deepEqual(events, [{
    name: "picker_completed",
    properties: { source: "pick", player_count: 3, time_band: "up_to_90", result_count: 0 },
  }])
  assert.doesNotMatch(JSON.stringify(events[0].properties), /email|name|notes|game_id/i)
  telemetry.setAnalyticsSink(() => { throw new Error("offline") })
  assert.doesNotThrow(() => telemetry.trackEvent("discover_opened", { source: "discover", tab: "top500" }))
  telemetry.setAnalyticsSink(null)
})

test("time bands avoid exact duration payloads", () => {
  assert.equal(telemetry.timeBand(null), "any")
  assert.equal(telemetry.timeBand(0), "any")
  assert.equal(telemetry.timeBand(60), "up_to_60")
  assert.equal(telemetry.timeBand(121), "over_120")
})

test("render failures show a safe fallback and capture only a failure area", () => {
  const failures = []
  telemetry.setErrorSink(event => failures.push(event))
  const boundary = new AppErrorBoundary({ children: React.createElement("p", null, "Normal screen") })
  assert.match(renderToStaticMarkup(boundary.render()), /Normal screen/)
  boundary.state = AppErrorBoundary.getDerivedStateFromError()
  const fallback = renderToStaticMarkup(boundary.render())
  assert.match(fallback, /Something went wrong/)
  assert.match(fallback, /Reload ShelfPick/)
  assert.doesNotMatch(fallback, /stack|private@example.com/i)
  boundary.componentDidCatch(new Error("private@example.com"), { componentStack: "private@example.com" })
  assert.deepEqual(failures, [{ area: "react_render" }])
  telemetry.setErrorSink(null)
})
