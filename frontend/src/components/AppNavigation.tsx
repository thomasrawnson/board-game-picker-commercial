export type AppView =
  | "picker"
  | "collection"
  | "insights"
  | "setup"

type Props = {
  view: AppView
  onChangeView: (view: AppView) => void
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
          onChangeView("setup")
        }
        aria-label="Setup"
        title="Setup"
      >
        ⚙
      </button>

      <nav className="app-nav">
        <button
          className={
            view === "picker"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            onChangeView("picker")
          }
        >
          Picker
        </button>

        <button
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
          Games
        </button>

        <button
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
          Insights
        </button>
      </nav>
    </>
  )
}

export default AppNavigation