import type {
  PickerNoMatchGuidance,
} from "./api/client"


export type HistoryState =
  | "none"
  | "ready"


export function collectionEmptyKind(
  totalGames: number,
): "empty" | "no_matches" {
  return totalGames === 0
    ? "empty"
    : "no_matches"
}


export function pickerEmptyKind(
  guidance: PickerNoMatchGuidance | null,
): "empty" | "no_matches" {
  return guidance?.owned_game_count === 0
    ? "empty"
    : "no_matches"
}


export function insightHistoryState(
  totalPlays: number,
): HistoryState {
  if (totalPlays === 0) {
    return "none"
  }

  return "ready"
}
