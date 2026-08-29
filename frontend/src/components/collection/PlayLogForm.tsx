import {
  useState,
} from "react"

import {
  recordPlay,
  type Game,
  type PlayParticipant,
} from "../../api/client"

type PlayerForm = {
  name: string
  score: string
  isWinner: boolean
}

type Props = {
  game: Game
  onSaved: () => Promise<void>
}

function todayValue() {
  const now = new Date()

  const year = now.getFullYear()

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0")

  const day = String(
    now.getDate(),
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function PlayLogForm({
  game,
  onSaved,
}: Props) {
  const [open, setOpen] =
    useState(false)

  const [playDate, setPlayDate] =
    useState(todayValue())

  const [duration, setDuration] =
    useState("")

  const [players, setPlayers] =
    useState<PlayerForm[]>([
      {
        name: "",
        score: "",
        isWinner: false,
      },
    ])

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState("")

  const [saved, setSaved] =
    useState(false)

  function resetForm() {
    setPlayDate(todayValue())
    setDuration("")

    setPlayers([
      {
        name: "",
        score: "",
        isWinner: false,
      },
    ])

    setError("")
  }

  function updatePlayer(
    index: number,
    changes: Partial<PlayerForm>,
  ) {
    setPlayers(
      players.map(
        (player, playerIndex) =>
          playerIndex === index
            ? {
                ...player,
                ...changes,
              }
            : player,
      ),
    )
  }

  function addPlayer() {
    setPlayers([
      ...players,
      {
        name: "",
        score: "",
        isWinner: false,
      },
    ])
  }

  function removePlayer(
    index: number,
  ) {
    if (players.length === 1) {
      return
    }

    setPlayers(
      players.filter(
        (_, playerIndex) =>
          playerIndex !== index,
      ),
    )
  }

  async function savePlay() {
    const participants =
      players.map(
        (
          player,
        ): PlayParticipant => ({
          name:
            player.name.trim(),

          score:
            player.score.trim() === ""
              ? null
              : Number(
                  player.score,
                ),

          is_winner:
            player.isWinner,
        }),
      )

    if (
      participants.some(
        (player) =>
          player.name.length === 0,
      )
    ) {
      setError(
        "Please enter a name for every player.",
      )
      return
    }

    if (
      participants.some(
        (player) =>
          player.score !== null &&
          Number.isNaN(
            player.score,
          ),
      )
    ) {
      setError(
        "Scores must be numbers.",
      )
      return
    }

    const durationMinutes =
      duration.trim() === ""
        ? null
        : Number(duration)

    if (
      durationMinutes !== null &&
      (
        Number.isNaN(
          durationMinutes,
        ) ||
        durationMinutes < 0
      )
    ) {
      setError(
        "Duration must be a valid number.",
      )
      return
    }

    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const playedAt =
        new Date(
          `${playDate}T12:00:00`,
        ).toISOString()

      await recordPlay(
        game.bgg_id,
        playedAt,
        durationMinutes,
        participants,
      )

      resetForm()
      setOpen(false)
      setSaved(true)

      await onSaved()
    } catch (err) {
      console.error(err)

      setError(
        "Couldn't save this play.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        className="primary-button log-play-button"
        onClick={() => {
          setOpen(!open)
          setError("")
          setSaved(false)
        }}
      >
        {open
          ? "Cancel"
          : "Log a play"}
      </button>

      {open && (
        <div className="play-form">
          <div className="play-form-heading">
            <div>
              <p className="preference-label">
                New play
              </p>

              <strong>
                {game.name}
              </strong>
            </div>
          </div>

          <div className="play-form-grid">
            <label>
              <span>Date</span>

              <input
                type="date"
                value={playDate}
                onChange={(event) =>
                  setPlayDate(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>
                Duration
              </span>

              <div className="duration-input">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="60"
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      event.target.value,
                    )
                  }
                />

                <small>min</small>
              </div>
            </label>
          </div>

          <div className="player-form-heading">
            <p className="preference-label">
              Players
            </p>

            <span>
              {players.length}
            </span>
          </div>

          <div className="player-forms">
            {players.map(
              (player, index) => (
                <div
                  className="player-form-card"
                  key={index}
                >
                  <div className="player-form-number">
                    <strong>
                      Player {index + 1}
                    </strong>

                    {players.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removePlayer(
                            index,
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="player-input-row">
                    <label>
                      <span>Name</span>

                      <input
                        type="text"
                        value={
                          player.name
                        }
                        placeholder="Player name"
                        onChange={(event) =>
                          updatePlayer(
                            index,
                            {
                              name:
                                event.target
                                  .value,
                            },
                          )
                        }
                      />
                    </label>

                    <label className="score-field">
                      <span>
                        Score
                      </span>

                      <input
                        type="number"
                        inputMode="decimal"
                        value={
                          player.score
                        }
                        placeholder="—"
                        onChange={(event) =>
                          updatePlayer(
                            index,
                            {
                              score:
                                event.target
                                  .value,
                            },
                          )
                        }
                      />
                    </label>
                  </div>

                  <label className="winner-toggle">
                    <input
                      type="checkbox"
                      checked={
                        player.isWinner
                      }
                      onChange={(event) =>
                        updatePlayer(
                          index,
                          {
                            isWinner:
                              event.target
                                .checked,
                          },
                        )
                      }
                    />

                    <span>
                      Winner
                    </span>
                  </label>
                </div>
              ),
            )}
          </div>

          <button
            type="button"
            className="add-player-button"
            onClick={addPlayer}
          >
            + Add player
          </button>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            className="primary-button save-play-button"
            disabled={saving}
            onClick={savePlay}
          >
            {saving
              ? "Saving..."
              : "Save play"}
          </button>
        </div>
      )}

      {saved && (
        <p className="play-confirmation">
          Play saved.
        </p>
      )}
    </>
  )
}

export default PlayLogForm