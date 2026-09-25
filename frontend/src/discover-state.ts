import type { DiscoverMode } from "./api/client"


export function discoverEmptyCopy(
  mode: DiscoverMode,
  dismissed = false,
) {
  if (dismissed) {
    return {
      title: "You've cleared this list",
      body: "Reload the list to bring those games back.",
      actionLabel: "Reload list",
      actionMode: mode,
    }
  }

  if (mode === "for_you") {
    return {
      title: "No personalised matches yet",
      body: "No unowned games match the signals available right now. Hot may have more ideas.",
      actionLabel: "Browse Hot",
      actionMode: "hot" as const,
    }
  }

  return {
    title: "No new games to show right now",
    body: mode === "hot"
      ? "No unowned Hot games are available right now. Top 100 may have more ideas."
      : "No unowned Top 100 games are available right now. Hot may have something different.",
    actionLabel: mode === "hot" ? "Browse Top 100" : "Browse Hot",
    actionMode: mode === "hot" ? "top100" as const : "hot" as const,
  }
}
