import {
  useState,
  type FormEvent,
} from "react"

import {
  requestPasswordReset,
} from "../api/client"


function ForgotPasswordView() {
  const [email, setEmail] =
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
        await requestPasswordReset(
          email,
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


  return (
    <section className="auth-screen">
      <div className="auth-card">
        <header className="auth-header">
          <p className="eyebrow">
            Board Game Picker
          </p>

          <h1>
            Reset your password
          </h1>

          <p className="subtitle">
            Enter your email and we'll
            send you a reset link.
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              required
            />
          </label>

          {message && (
            <p className="auth-hint">
              {message}
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
            disabled={submitting}
          >
            {submitting
              ? "Please wait..."
              : "Send reset link"}
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={() => {
              window.location.href = "/"
            }}
          >
            Back to login
          </button>
        </form>
      </div>
    </section>
  )
}


export default ForgotPasswordView