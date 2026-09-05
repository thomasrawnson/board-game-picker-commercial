import {
  useState,
} from "react"

import {
  importBGStatsPlays,
  syncBGGCollection,
  type BGStatsImportResult,
  type CollectionSyncResult,
} from "../api/client"


type OnboardingStep =
  | "collection"
  | "history"
  | "complete"


type Props = {
  displayName: string | null
  onComplete: (
    username: string,
  ) => void
}


function OnboardingView({
  displayName,
  onComplete,
}: Props) {
  const [step, setStep] =
    useState<OnboardingStep>(
      "collection",
    )

  const [username, setUsername] =
    useState("")

  const [syncing, setSyncing] =
    useState(false)

  const [syncError, setSyncError] =
    useState("")

  const [
    syncResult,
    setSyncResult,
  ] =
    useState<
      CollectionSyncResult | null
    >(null)

  const [file, setFile] =
    useState<File | null>(null)

  const [importing, setImporting] =
    useState(false)

  const [importError, setImportError] =
    useState("")

  const [
    importResult,
    setImportResult,
  ] =
    useState<
      BGStatsImportResult | null
    >(null)


  async function handleSync() {
    const cleanedUsername =
      username.trim()

    if (!cleanedUsername) {
      return
    }

    setSyncing(true)
    setSyncError("")

    try {
      const result =
        await syncBGGCollection(
          cleanedUsername,
        )

      setSyncResult(result)
      setStep("history")
    } catch (err) {
      console.error(err)

      setSyncError(
        err instanceof Error
          ? err.message
          : "Couldn't sync that collection.",
      )
    } finally {
      setSyncing(false)
    }
  }


  async function handleImport() {
    if (!file) {
      return
    }

    setImporting(true)
    setImportError("")

    try {
      const result =
        await importBGStatsPlays(
          file,
        )

      setImportResult(result)
      setStep("complete")
    } catch (err) {
      console.error(err)

      setImportError(
        err instanceof Error
          ? err.message
          : "Couldn't import that file.",
      )
    } finally {
      setImporting(false)
    }
  }


  function skipHistory() {
    setStep("complete")
  }


  function finishOnboarding() {
    onComplete(
      username.trim(),
    )
  }


  return (
    <section className="onboarding-screen">
      <header className="onboarding-header">
        <p className="eyebrow">
          Board Game Picker
        </p>

        <h1>
          {displayName
            ? `Welcome, ${displayName}`
            : "Welcome"}
        </h1>

        <p className="subtitle">
          Bring in your games and we'll
          help decide what hits the table.
        </p>
      </header>


      <div className="onboarding-progress">
        <span
          className={
            step === "collection"
              ? "active"
              : "complete"
          }
        >
          1
        </span>

        <div />

        <span
          className={
            step === "history"
              ? "active"
              : step === "complete"
                ? "complete"
                : ""
          }
        >
          2
        </span>

        <div />

        <span
          className={
            step === "complete"
              ? "active"
              : ""
          }
        >
          3
        </span>
      </div>


      {step === "collection" && (
        <div className="onboarding-card">
          <p className="insight-label">
            Step 1
          </p>

          <h2>
            Add your collection
          </h2>

          <p>
            Enter your BoardGameGeek
            username and we'll import
            the games you own.
          </p>

          <label
            className="setup-label"
            htmlFor="onboarding-bgg"
          >
            BoardGameGeek username
          </label>

          <input
            id="onboarding-bgg"
            className="setup-input"
            type="text"
            value={username}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="e.g. NorthPenguin"
            onChange={(event) =>
              setUsername(
                event.target.value,
              )
            }
          />

          <button
            type="button"
            className="primary-button setup-button"
            disabled={
              syncing ||
              username.trim()
                .length === 0
            }
            onClick={handleSync}
          >
            {syncing
              ? "Importing collection..."
              : "Import collection"}
          </button>

          {syncError && (
            <p className="error-message">
              {syncError}
            </p>
          )}
        </div>
      )}


      {step === "history" && (
        <div className="onboarding-card">
          <p className="insight-label">
            Step 2
          </p>

          <h2>
            Add your play history
          </h2>

          {syncResult && (
            <div className="setup-success">
              <strong>
                Collection imported
              </strong>

              <span>
                {
                  syncResult
                    .games_synced
                }{" "}
                games ready to pick
                from.
              </span>
            </div>
          )}

          <p>
            If you use BG Stats, import
            your JSON export to make
            recommendations and insights
            more personal.
          </p>

          <label
            className="file-picker"
            htmlFor="onboarding-bgstats"
          >
            <strong>
              {file
                ? file.name
                : "Choose BG Stats JSON"}
            </strong>

            <span>
              {file
                ? "Ready to import"
                : "Optional"}
            </span>
          </label>

          <input
            id="onboarding-bgstats"
            className="file-input"
            type="file"
            accept=".json,application/json"
            onChange={(event) =>
              setFile(
                event.target
                  .files?.[0] ??
                  null,
              )
            }
          />

          <button
            type="button"
            className="primary-button setup-button"
            disabled={
              importing ||
              file === null
            }
            onClick={handleImport}
          >
            {importing
              ? "Importing history..."
              : "Import play history"}
          </button>

          <button
            type="button"
            className="onboarding-skip"
            onClick={skipHistory}
          >
            Skip for now
          </button>

          {importError && (
            <p className="error-message">
              {importError}
            </p>
          )}
        </div>
      )}


      {step === "complete" && (
        <div className="onboarding-card onboarding-complete">
          <div className="onboarding-ready">
            ✓
          </div>

          <p className="insight-label">
            You're ready
          </p>

          <h2>
            Time to pick a game
          </h2>

          {syncResult && (
            <p>
              {
                syncResult
                  .games_synced
              }{" "}
              games are waiting on your
              shelf.
            </p>
          )}

          {importResult && (
            <p>
              {
                importResult
                  .imported
              }{" "}
              historical plays were
              added too.
            </p>
          )}

          <button
            type="button"
            className="primary-button setup-button"
            onClick={
              finishOnboarding
            }
          >
            Start picking
          </button>
        </div>
      )}
    </section>
  )
}


export default OnboardingView