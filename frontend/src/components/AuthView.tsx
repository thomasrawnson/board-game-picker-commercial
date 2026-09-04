import {
  useState,
  type FormEvent,
} from "react"

import {
  login,
  register,
} from "../api/client"

import {
  saveToken,
  type AuthUser,
} from "../auth"


type Props = {
  onAuthenticated: (
    user: AuthUser,
  ) => void
}


function AuthView({
  onAuthenticated,
}: Props) {
  const [mode, setMode] =
    useState<"login" | "register">(
      "login",
    )

  const [email, setEmail] =
    useState("")

  const [
    displayName,
    setDisplayName,
  ] = useState("")

  const [password, setPassword] =
    useState("")

  const [error, setError] =
    useState("")

  const [
    submitting,
    setSubmitting,
  ] = useState(false)


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError("")
    setSubmitting(true)

    try {
      const result =
        mode === "login"
          ? await login(
              email,
              password,
            )
          : await register(
              email,
              displayName,
              password,
            )

      saveToken(
        result.access_token,
      )

      onAuthenticated(
        result.user,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong",
      )
    } finally {
      setSubmitting(false)
    }
  }


  function switchMode(
    nextMode:
      | "login"
      | "register",
  ) {
    setMode(nextMode)
    setError("")
  }


  return (
    <section className="auth-screen">
      <div className="auth-card">
        <header className="auth-header">
          <p className="eyebrow">
            Board Game Picker
          </p>

          <h1>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h1>

          <p className="subtitle">
            Your collection, plays and
            recommendations in one place.
          </p>
        </header>

        <div className="auth-tabs">
          <button
            type="button"
            className={
              mode === "login"
                ? "active"
                : ""
            }
            onClick={() =>
              switchMode("login")
            }
          >
            Log in
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "active"
                : ""
            }
            onClick={() =>
              switchMode(
                "register",
              )
            }
          >
            Register
          </button>
        </div>

        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
        >
          {mode === "register" && (
            <label>
              Name

              <input
                type="text"
                value={
                  displayName
                }
                onChange={(
                  event,
                ) =>
                  setDisplayName(
                    event.target
                      .value,
                  )
                }
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              autoComplete="email"
              autoCapitalize="none"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              autoComplete={
                mode ===
                "login"
                  ? "current-password"
                  : "new-password"
              }
              minLength={
                mode ===
                "register"
                  ? 8
                  : undefined
              }
              required
            />
          </label>

          {mode ===
            "register" && (
            <p className="auth-hint">
              Use at least 8
              characters.
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={
              submitting
            }
          >
            {submitting
              ? "Please wait..."
              : mode ===
                  "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>
      </div>
    </section>
  )
}


export default AuthView