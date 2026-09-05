import {
  useState,
} from "react"

import {
  importBGStatsPlays,
  syncBGGCollection,
  type BGStatsImportResult,
  type CollectionSyncResult,
} from "../api/client"


type Props = {
  initialUsername?: string | null
  onUsernameChange?: (
    username: string,
  ) => void
}


function SetupView({
  initialUsername,
  onUsernameChange,
}: Props) {
  const [username, setUsername] =
    useState(
      initialUsername ?? "",
    )

  const [syncing, setSyncing] =
    useState(false)

  const [syncResult, setSyncResult] =
    useState<CollectionSyncResult | null>(
      null,
    )

  const [syncError, setSyncError] =
    useState("")

  const [file, setFile] =
    useState<File | null>(null)

  const [importing, setImporting] =
    useState(false)

  const [importResult, setImportResult] =
    useState<BGStatsImportResult | null>(
      null,
    )

  const [importError, setImportError] =
    useState("")


  async function handleSync() {
    const cleanedUsername =
      username.trim()

    if (!cleanedUsername) {
      return
    }

    setSyncing(true)
    setSyncError("")
    setSyncResult(null)

    try {
      const result =
        await syncBGGCollection(
          cleanedUsername,
        )

      setSyncResult(result)
      
      onUsernameChange?.(
        result.username,
      )
    } catch (err) {
      console.error(err)

      setSyncError(
        "Couldn't sync that BGG collection.",
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
    setImportResult(null)

    try {
      const result =
        await importBGStatsPlays(file)

      setImportResult(result)
    } catch (err) {
      console.error(err)

      setImportError(
        "Couldn't import that BG Stats export.",
      )
    } finally {
      setImporting(false)
    }
  }


  return (
    <section className="screen setup-screen">
      <header>
        <p className="eyebrow">
          Your games
        </p>

        <h1>Set up your collection</h1>

        <p className="subtitle">
          Bring in your collection first,
          then add your play history.
        </p>
      </header>


      <div className="setup-card">
        <div className="setup-step">
          <span>1</span>

          <div>
            <strong>
              Sync BoardGameGeek
            </strong>

            <p>
              Import the games you own
              from your BGG account.
            </p>
          </div>
        </div>


        <label
          className="setup-label"
          htmlFor="bgg-username"
        >
          BGG username
        </label>

        <input
          id="bgg-username"
          className="setup-input"
          type="text"
          value={username}
          placeholder="e.g. articsquirrel"
          autoCapitalize="none"
          autoCorrect="off"
          onChange={(event) =>
            setUsername(
              event.target.value,
            )
          }
        />


        <button
          className="primary-button setup-button"
          disabled={
            syncing ||
            username.trim().length === 0
          }
          onClick={handleSync}
        >
          {syncing
            ? "Syncing collection..."
            : "Sync collection"}
        </button>


        {syncResult && (
          <div className="setup-success">
            <strong>
              Collection synced
            </strong>

            <span>
              {syncResult.games_synced}{" "}
              games imported from BGG.
            </span>
          </div>
        )}


        {syncError && (
          <p className="error-message">
            {syncError}
          </p>
        )}
      </div>


      <div className="setup-divider">
        <span>then</span>
      </div>


      <div className="setup-card">
        <div className="setup-step">
          <span>2</span>

          <div>
            <strong>
              Import BG Stats history
            </strong>

            <p>
              Upload your BG Stats JSON
              export to restore previous
              plays.
            </p>
          </div>
        </div>


        <label
          className="file-picker"
          htmlFor="bgstats-file"
        >
          <strong>
            {file
              ? file.name
              : "Choose BG Stats JSON"}
          </strong>

          <span>
            {file
              ? "Ready to import"
              : "Select your exported .json file"}
          </span>
        </label>

        <input
          id="bgstats-file"
          className="file-input"
          type="file"
          accept=".json,application/json"
          onChange={(event) =>
            setFile(
              event.target.files?.[0] ??
                null,
            )
          }
        />


        <button
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


        {importResult && (
          <div className="setup-success">
            <strong>
              Play history imported
            </strong>

            <span>
              {importResult.imported}{" "}
              plays added
            </span>

            {importResult
              .skipped_existing > 0 && (
              <span>
                {
                  importResult
                    .skipped_existing
                }{" "}
                already existed
              </span>
            )}

            {importResult
              .skipped_missing_game >
              0 && (
              <span>
                {
                  importResult
                    .skipped_missing_game
                }{" "}
                skipped because the game
                isn't in your collection
              </span>
            )}
          </div>
        )}


        {importError && (
          <p className="error-message">
            {importError}
          </p>
        )}
      </div>
    </section>
  )
}


export default SetupView