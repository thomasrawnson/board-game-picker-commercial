import {
  useEffect,
  useState,
} from "react"

import {
  confirmEmailVerification,
} from "../api/client"


function VerifyEmailView() {
  const token =
    new URLSearchParams(
      window.location.search,
    ).get("token")

  const [message, setMessage] =
    useState(
      token
        ? "Verifying your email..."
        : "",
    )

  const [error, setError] =
    useState(
      token
        ? ""
        : "Invalid verification link",
    )


  useEffect(() => {
    if (!token) {
      return
    }

    confirmEmailVerification(
      token,
    )
      .then((result) => {
        setMessage(result)
      })
      .catch((err) => {
        setMessage("")
        setError(
          err instanceof Error
            ? err.message
            : "Verification failed",
        )
      })
  }, [token])


  return (
    <section className="auth-screen">
      <div className="auth-card">
        <header className="auth-header">
          <p className="eyebrow">
            ShelfPick
          </p>

          <h1>
            Email verification
          </h1>
        </header>

        {message && (
          <p className="subtitle">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <button
          type="button"
          className="primary-button auth-submit"
          onClick={() => {
            window.location.href = "/"
          }}
        >
          Continue
        </button>
      </div>
    </section>
  )
}


export default VerifyEmailView
