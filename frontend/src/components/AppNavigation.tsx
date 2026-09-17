export type AppView =
  | "picker"
  | "collection"
  | "gameNight"
  | "rankings"
  | "discover"
  | "insights"
  | "setup"


type Props = {
  view: AppView
  onChangeView: (
    view: AppView,
  ) => void
}


function AppNavigation({
  view,
  onChangeView,
}: Props) {
  return (
    <nav className="app-nav" aria-label="Primary">
      <button
        type="button"
        className={
          view === "picker"
            ? "nav-button active"
            : "nav-button"
        }
        onClick={() =>
          onChangeView(
            "picker",
          )
        }
      >
        Picker
      </button>

      <button
        type="button"
        className={
          view === "collection"
            ? "nav-button active"
            : "nav-button"
        }
        onClick={() =>
          onChangeView(
            "collection",
          )
        }
      >
        Collection
      </button>

      <button
        type="button"
        className={
          view === "gameNight"
            ? "nav-button active"
            : "nav-button"
        }
        onClick={() =>
          onChangeView(
            "gameNight",
          )
        }
      >
        Game night
      </button>

      <button
        type="button"
        className={
          view === "discover"
            ? "nav-button active"
            : "nav-button"
        }
        onClick={() =>
          onChangeView(
            "discover",
          )
        }
      >
        Discover
      </button>

      <button
        type="button"
        className={
          view === "rankings"
            ? "nav-button active"
            : "nav-button"
        }
        onClick={() =>
          onChangeView(
            "rankings",
          )
        }
      >
        Rank
      </button>

      <button
        type="button"
        className={
          view === "insights"
            ? "nav-button active"
            : "nav-button"
        }
        onClick={() =>
          onChangeView(
            "insights",
          )
        }
      >
        Stats
      </button>
    </nav>
  )
}


export default AppNavigation
