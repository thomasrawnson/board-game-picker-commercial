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


type NavIconName =
  | "picker"
  | "collection"
  | "gameNight"
  | "discover"
  | "rankings"
  | "insights"


function NavIcon({
  name,
}: {
  name: NavIconName
}) {
  if (name === "picker") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="9" cy="9" r="1" />
        <circle cx="15" cy="9" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="9" cy="15" r="1" />
        <circle cx="15" cy="15" r="1" />
      </svg>
    )
  }

  if (name === "collection") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6.5h14v12H5z" />
        <path d="M8 6.5v12M16 6.5v12" />
      </svg>
    )
  }

  if (name === "gameNight") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="9" r="3" />
        <circle cx="16" cy="10" r="2.5" />
        <path d="M4.5 19c.6-3 2.3-4.5 4.8-4.5S13.5 16 14 19" />
        <path d="M14 15.5c2.8-.4 4.6.8 5.3 3.5" />
      </svg>
    )
  }

  if (name === "discover") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
        <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
      </svg>
    )
  }

  if (name === "rankings") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5h8v3.5c0 3-1.6 5-4 5s-4-2-4-5V5Z" />
        <path d="M8 7H5.5v1.5c0 2 1 3 3 3M16 7h2.5v1.5c0 2-1 3-3 3M12 13.5V17M9 19h6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19V11M10 19V7M15 19v-5M20 19V4" />
    </svg>
  )
}


const items: {
  view: Exclude<AppView, "setup">
  label: string
  icon: NavIconName
}[] = [
  { view: "picker", label: "Picker", icon: "picker" },
  { view: "collection", label: "Collection", icon: "collection" },
  { view: "gameNight", label: "Game night", icon: "gameNight" },
  { view: "discover", label: "Discover", icon: "discover" },
  { view: "rankings", label: "Rank", icon: "rankings" },
  { view: "insights", label: "Insight", icon: "insights" },
]


function AppNavigation({
  view,
  onChangeView,
}: Props) {
  return (
    <nav className="app-nav" aria-label="Primary">
      {items.map((item) => (
        <button
          type="button"
          key={item.view}
          className={
            view === item.view
              ? "nav-button active"
              : "nav-button"
          }
          aria-current={
            view === item.view
              ? "page"
              : undefined
          }
          onClick={() =>
            onChangeView(item.view)
          }
        >
          <span className="nav-icon">
            <NavIcon name={item.icon} />
          </span>
          <span className="nav-label">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}


export default AppNavigation
