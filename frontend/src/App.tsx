import {
  useEffect,
  useState,
} from "react"

import {
  getMe,
} from "./api/client"

import {
  clearToken,
  getToken,
  type AuthUser,
} from "./auth"

import AuthView
  from "./components/AuthView"

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

import OnboardingView from "./components/OnboardingView"

function App() {
  const [view, setView] =
    useState<AppView>(
      "picker",
    )

  const [user, setUser] =
    useState<AuthUser | null>(
      null,
    )

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true)


  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) {
        setCheckingAuth(false)
        return
      }

      try {
        const currentUser =
          await getMe()

        setUser(
          currentUser,
        )
      } catch {
        clearToken()
      } finally {
        setCheckingAuth(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null)
      setView("picker")
    }

    window.addEventListener(
      "boardgamepicker-auth-expired",
      handleAuthExpired,
    )

    return () => {
      window.removeEventListener(
        "boardgamepicker-auth-expired",
        handleAuthExpired,
      )
    }
  }, [])

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null)
      setView("picker")
    }

    window.addEventListener(
      "boardgamepicker-auth-expired",
      handleAuthExpired,
    )

    return () => {
      window.removeEventListener(
        "boardgamepicker-auth-expired",
        handleAuthExpired,
      )
    }
  }, [])

    function handleLogout() {
      clearToken()
      setUser(null)
      setView("picker")
    }


    if (checkingAuth) {
      return (
        <main className="app-shell">
          <section className="phone">
            <section className="auth-loading">
              <p className="eyebrow">
                Board Game Picker
              </p>

              <h1>
                Loading...
              </h1>
            </section>
          </section>
        </main>
      )
    }


  if (!user) {
    return (
      <main className="app-shell">
        <section className="phone">
          <AuthView
            onAuthenticated={
              setUser
            }
          />
        </section>
      </main>
    )
  }

  if (!user.bgg_username) {
    return (
      <main className="app-shell">
        <section className="phone">
          <OnboardingView
            displayName={
              user.display_name
            }
            onComplete={(
              username,
            ) => {
              setUser({
                ...user,
                bgg_username:
                  username,
              })

              setView("picker")
            }}
          />
        </section>
      </main>
    )
  }
  
  return (
    <main className="app-shell">
      <section className="phone">
        <AppNavigation
          view={view}
          onChangeView={
            setView
          }
        />

        {view ===
          "picker" && (
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

        {view ===
          "setup" && (
          <>
            <SetupView
              initialUsername={
                user.bgg_username
              }
              onUsernameChange={(
                username,
              ) => {
                setUser({
                  ...user,
                  bgg_username:
                    username,
                })
              }}
            />

            <div className="account-panel">
              <div>
                <p className="account-label">
                  Signed in as
                </p>

                <strong>
                  {user.display_name ??
                    user.email}
                </strong>

                <span>
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                className="logout-button"
                onClick={
                  handleLogout
                }
              >
                Log out
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}


export default App