export type TimeBand = "any" | "up_to_30" | "up_to_60" | "up_to_90" | "up_to_120" | "over_120"

type BetaEventProperties = {
  onboarding_completed: { source: "onboarding"; player_count?: number; time_band: TimeBand }
  collection_import_completed: { source: "onboarding_bgg" | "settings_bgg" | "settings_bgstats"; result_count: number }
  picker_completed: { source: "pick"; player_count: number; time_band: TimeBand; result_count: number }
  game_night_completed: { source: "game_night"; player_count: number; time_band: TimeBand; result_count: number }
  discover_opened: { source: "discover"; tab: "hot" | "top500" | "for_you" }
  wishlist_added: { source: "discover" }
  feedback_opened: { source: "settings" }
}

export type BetaEvent = {
  [Name in keyof BetaEventProperties]: { name: Name; properties: BetaEventProperties[Name] }
}[keyof BetaEventProperties]

type AnalyticsSink = (event: BetaEvent) => void
type ErrorSink = (event: { area: "react_render" }) => void

let analyticsSink: AnalyticsSink | null = null
let errorSink: ErrorSink | null = null

// A provider can be connected for beta without coupling feature code to its SDK.
export function setAnalyticsSink(sink: AnalyticsSink | null): void {
  analyticsSink = sink
}

export function setErrorSink(sink: ErrorSink | null): void {
  errorSink = sink
}

export function trackEvent<Name extends keyof BetaEventProperties>(
  name: Name,
  properties: BetaEventProperties[Name],
): void {
  try {
    analyticsSink?.({ name, properties } as BetaEvent)
  } catch {
    // Telemetry must never interrupt a product journey.
  }
}

export function captureClientError(_error: unknown, area: "react_render"): void {
  try {
    errorSink?.({ area })
  } catch {
    // Monitoring must never break the fallback UI.
  }
}

export function timeBand(minutes: number | null | undefined): TimeBand {
  if (minutes == null || minutes === 0) return "any"
  if (minutes <= 30) return "up_to_30"
  if (minutes <= 60) return "up_to_60"
  if (minutes <= 90) return "up_to_90"
  if (minutes <= 120) return "up_to_120"
  return "over_120"
}
