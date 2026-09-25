import assert from "node:assert/strict"
import test from "node:test"

import {
  collectionEmptyKind,
  insightHistoryState,
  pickerEmptyKind,
} from "./ui-empty-state.ts"


test("Collection distinguishes an empty shelf from no filter matches", () => {
  assert.equal(collectionEmptyKind(0), "empty")
  assert.equal(collectionEmptyKind(4), "no_matches")
})


test("Picker distinguishes an empty shelf from restrictive criteria", () => {
  assert.equal(
    pickerEmptyKind({
      owned_game_count: 0,
      player_count_exclusions: 0,
      can_relax_time: false,
      can_relax_complexity: false,
      can_relax_both: false,
    }),
    "empty",
  )
  assert.equal(
    pickerEmptyKind({
      owned_game_count: 3,
      player_count_exclusions: 0,
      can_relax_time: false,
      can_relax_complexity: false,
      can_relax_both: false,
    }),
    "no_matches",
  )
  assert.equal(pickerEmptyKind(null), "no_matches")
})


test("Insights treats every recorded play as valid history", () => {
  assert.equal(insightHistoryState(0), "none")
  assert.equal(insightHistoryState(1), "ready")
  assert.equal(insightHistoryState(2), "ready")
})
