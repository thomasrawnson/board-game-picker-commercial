import {
  useEffect,
  useState,
} from "react"

import {
  confirmEmailVerification,
} from "../api/client"


function VerifyEmailView() {
  const [message, setMessage] =
    useState("Verifying your email...")

  const [error, setError] =
    useState("")


  useEffect(() => {
    const token =
      new URLSearchParams(
        window.location.search,
      ).get("token")

    if (!token) {
      setMessage("")
      setError(
        "Invalid verification link",
      )
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
  }, [])


  return (
    <section className="auth-screen">
      <div className="auth-card">
        <header className="auth-header">
          <p className="eyebrow">
            Board Game Picker
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