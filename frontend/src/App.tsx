import {
  useState,
} from "react"

import CollectionView
  from "./components/CollectionView"

import InsightsView
  from "./components/InsightsView"

import SetupView
  from "./components/SetupView"

import AppNavigation, {
  type AppView,
} from "./components/AppNavigation"

import PickerView
  from "./components/picker/PickerView"

import "./App.css"


function App() {
  const [view, setView] =
    useState<AppView>("picker")

  return (
    <main className="app-shell">
      <section className="phone">
        <AppNavigation
          view={view}
          onChangeView={
            setView
          }
        />

        {view === "picker" && (
          <PickerView
            onViewCollection={() =>
              setView(
                "collection",
              )
            }
          />
        )}

        {view ===
          "collection" && (
          <CollectionView />
        )}

        {view ===
          "insights" && (
          <InsightsView />
        )}

        {view === "setup" && (
          <SetupView />
        )}
      </section>
    </main>
  )
}

export default App