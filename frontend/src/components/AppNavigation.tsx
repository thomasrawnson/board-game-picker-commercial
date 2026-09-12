export type AppView =
  | "picker"
  | "collection"
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
    <>
      <button
        className="settings-button"
        onClick={() =>
          onChangeView(
            "setup",
          )
        }
        aria-label="Setup"
        title="Setup"
      >
        ⚙
      </button>


      <nav className="app-nav">
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
    </>
  )
}


export default AppNavigation