import assert from "node:assert/strict"
import test from "node:test"

import { discoverEmptyCopy } from "./discover-state.ts"


test("Discover empty copy distinguishes personalised no-match results", () => {
  assert.deepEqual(discoverEmptyCopy("for_you"), {
    title: "No personalised matches yet",
    body: "No unowned games match the signals available right now. Hot may have more ideas.",
    actionLabel: "Browse Hot",
    actionMode: "hot",
  })

  assert.match(
    discoverEmptyCopy("hot").body,
    /unowned Hot games/,
  )
  assert.match(
    discoverEmptyCopy("top100").body,
    /unowned Top 100 games/,
  )
})

test("Discover distinguishes dismissed cards from source emptiness", () => {
  assert.deepEqual(discoverEmptyCopy("hot", true), {
    title: "You've cleared this list",
    body: "Reload the list to bring those games back.",
    actionLabel: "Reload list",
    actionMode: "hot",
  })
})
