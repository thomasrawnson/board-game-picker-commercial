import {
  useState,
  type FormEvent,
} from "react"

import {
  confirmPasswordReset,
} from "../api/client"


function ResetPasswordView() {
  const token =
    new URLSearchParams(
      window.location.search,
    ).get("token") ?? ""

  const [password, setPassword] =
    useState("")

  const [message, setMessage] =
    useState("")

  const [error, setError] =
    useState("")

  const [submitting, setSubmitting] =
    useState(false)


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError("")
    setMessage("")
    setSubmitting(true)

    try {
      const result =
        await confirmPasswordReset(
          token,
          password,
        )

      setMessage(result)
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


  if (!token) {
    return (
      <section className="auth-screen">
        <div className="auth-card">
          <h1>
            Invalid reset link
          </h1>

          <button
            className="primary-button"
            onClick={() => {
              window.location.href = "/"
            }}
          >
            Back to login
          </button>
        </div>
      </section>
    )
  }


  return (
    <section className="auth-screen">
      <div className="auth-card">
        <header className="auth-header">
          <p className="eyebrow">
            Board Game Picker
          </p>

          <h1>
            Choose a new password
          </h1>
        </header>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            New password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              minLength={8}
              required
            />
          </label>

          <p className="auth-hint">
            Use at least 8 characters.
          </p>

          {message && (
            <>
              <p className="auth-hint">
                {message}
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  window.location.href = "/"
                }}
              >
                Log in
              </button>
            </>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {!message && (
            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={submitting}
            >
              {submitting
                ? "Updating..."
                : "Update password"}
            </button>
          )}
        </form>
      </div>
    </section>
  )
}


export default ResetPasswordView