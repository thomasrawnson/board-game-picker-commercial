import type { DiscoverMode } from "./api/client"


export function discoverEmptyCopy(mode: DiscoverMode) {
  if (mode === "for_you") {
    return {
      title: "No personalised matches yet",
      body: "Try another Discover list while ShelfPick builds a stronger picture of how you play.",
    }
  }

  return {
    title: "No new games to show right now",
    body: mode === "hot"
      ? "Your shelf may already contain the current Hot games. Check Top 500 for more ideas."
      : "Your shelf may already contain these highly ranked games. Check Hot for something different.",
  }
}
