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

import CollectionView, {
  type CollectionSection,
} from "./components/CollectionView"

import DiscoverView
  from "./components/DiscoverView"

import InsightsView
  from "./components/InsightsView"

import OnboardingView
  from "./components/OnboardingView"

import SetupView
  from "./components/SetupView"

import AppNavigation, {
  type AppView,
} from "./components/AppNavigation"

import PickerView
  from "./components/picker/PickerView"

import "./App.css"

import ForgotPasswordView
  from "./components/ForgotPasswordView"

import ResetPasswordView
  from "./components/ResetPasswordView"

import VerifyEmailView
  from "./components/VerifyEmailView"

function App() {
  const [
    view,
    setView,
  ] = useState<AppView>(
    "picker",
  )

  const [
    selectedCollectionGameId,
    setSelectedCollectionGameId,
  ] = useState<
    number | null
  >(
    null,
  )

  const [
    collectionSection,
    setCollectionSection,
  ] = useState<CollectionSection>(
    "owned",
  )

  const path =
    window.location.pathname


  if (path === "/forgot-password") {
    return (
      <main className="app-shell">
        <section className="phone">
          <ForgotPasswordView />
        </section>
      </main>
    )
  }


  if (path === "/reset-password") {
    return (
      <main className="app-shell">
        <section className="phone">
          <ResetPasswordView />
        </section>
      </main>
    )
  }


  if (path === "/verify-email") {
    return (
      <main className="app-shell">
        <section className="phone">
          <VerifyEmailView />
        </section>
      </main>
    )
  }

  const [
    user,
    setUser,
  ] = useState<
    AuthUser | null
  >(
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
      setView(
        "picker",
      )
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

    setUser(
      null,
    )

    setView(
      "picker",
    )
  }


  function openOwnedCollectionGame(
    bggId: number,
  ) {
    setSelectedCollectionGameId(
      bggId,
    )
    setCollectionSection(
      "owned",
    )
    setView(
      "collection",
    )
  }


  function handleViewChange(
    nextView: AppView,
  ) {
    if (nextView === "collection") {
      setCollectionSection(
        "owned",
      )
    }

    setView(nextView)
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


  if (
    user.bgg_username === null
  ) {
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

              setView(
                username
                  ? "picker"
                  : "collection",
              )
            }}
          />
        </section>
      </main>
    )
  }


  return (
    <main className="app-shell">
      <section className="phone app-phone">
        <AppNavigation
          view={
            view
          }
          onChangeView={
            handleViewChange
          }
        />


        {view === "picker" && (
          <PickerView
            onViewGame={(
              bggId,
            ) => {
              openOwnedCollectionGame(
                bggId,
              )
            }}
          />
        )}


        {view === "collection" && (
          <CollectionView
            initialSection={
              collectionSection
            }
            initialGameBggId={
              selectedCollectionGameId
            }
            onInitialGameHandled={() =>
              setSelectedCollectionGameId(
                null,
              )
            }
          />
        )}


        {view === "discover" && (
          <DiscoverView
            onViewWishlist={() => {
              setSelectedCollectionGameId(
                null,
              )
              setCollectionSection(
                "wishlist",
              )
              setView(
                "collection",
              )
            }}
          />
        )}


        {view === "insights" && (
          <InsightsView
            onOpenGame={(
              bggId: number,
            ) => {
              openOwnedCollectionGame(
                bggId,
              )
            }}
          />
        )}


        {view === "setup" && (
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
                  {user.display_name
                    ?? user.email}
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
