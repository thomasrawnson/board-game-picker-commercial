import assert from "node:assert/strict"
import test from "node:test"

import { discoverEmptyCopy } from "./discover-state.ts"


test("Discover empty copy distinguishes personalised no-match results", () => {
  assert.deepEqual(discoverEmptyCopy("for_you"), {
    title: "No personalised matches yet",
    body: "Try another Discover list while ShelfPick builds a stronger picture of how you play.",
  })

  assert.match(
    discoverEmptyCopy("hot").body,
    /current Hot games/,
  )
  assert.match(
    discoverEmptyCopy("top100").body,
    /current Top 100 games/,
  )
})
