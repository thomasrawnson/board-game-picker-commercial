import {
  deletePlay,
  type Game,
  type GameHistory as GameHistoryData,
} from "../../api/client"

import {
  createBGStatsHistoryUrl,
} from "../../utils/bgstats"


type Props = {
  game: Game
  history: GameHistoryData | null
  loading: boolean
  onPlayDeleted: () => Promise<void>
}


function GameHistory({
  game,
  history,
  loading,
  onPlayDeleted,
}: Props) {
  
  async function handleDeletePlay(
    playId: number,
  ) {
    const confirmed =
      window.confirm(
        "Delete this play?"
      )

    if (!confirmed) {
      return
    }

    try {
      await deletePlay(
        playId
      )

      await onPlayDeleted()
    } catch (err) {
      console.error(err)

      window.alert(
        "Couldn't delete this play."
      )
    }
  }
  return (
    <div className="detail-section game-history">
      <p className="preference-label">
        Your history
      </p>

      {loading ? (
        <p className="history-empty">
          Loading your play history...
        </p>
      ) : history ? (
        <>
          <div className="history-stats">
            <div>
              <strong>
                {history.play_count}
              </strong>

              <span>Plays</span>
            </div>

            <div>
              <strong>
                {history.average_players
                  ?.toFixed(1) ?? "—"}
              </strong>

              <span>
                Avg players
              </span>
            </div>

            <div>
              <strong>
                {history
                  .average_duration_minutes ??
                  "—"}
              </strong>

              <span>
                Avg mins
              </span>
            </div>
          </div>

          {history.last_played_at && (
            <p className="history-last-played">
              Last played{" "}
              {new Date(
                history.last_played_at,
              ).toLocaleDateString(
                undefined,
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              )}
            </p>
          )}

          {history.recent_plays.length > 0 ? (
            <div className="recent-plays">
              <p className="preference-label">
                Recent plays
              </p>

              {history.recent_plays.map(
                (play) => (
                  <div
                    className="recent-play-detail"
                    key={play.id}
                  >
                    <div className="recent-play-header">
                      <div>
                        <strong>
                          {new Date(
                            play.played_at,
                          ).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </strong>

                        <span>
                          {play.player_count}{" "}
                          {play.player_count === 1
                            ? "player"
                            : "players"}
                        </span>
                      </div>

                      <span>
                        {play.duration_minutes
                          ? `${play.duration_minutes} min`
                          : "—"}
                      </span>
                    </div>

                    {play.participants.length >
                      0 && (
                      <div className="play-participants">
                        {play.participants.map(
                          (participant) => (
                            <div
                              className={
                                participant
                                  .is_winner
                                  ? "history-player winner"
                                  : "history-player"
                              }
                              key={
                                participant.id
                              }
                            >
                              <span>
                                {
                                  participant.name
                                }

                                {participant
                                  .is_winner &&
                                  " · Winner"}
                              </span>

                              <strong>
                                {participant
                                  .score ?? "—"}
                              </strong>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {play.source !==
                      "bgstats" && (
                      <a
                        className="bgstats-history-link"
                        href={
                          createBGStatsHistoryUrl(
                            game,
                            play,
                          )
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Send to BG Stats
                      </a>
                    )}
                    <button
                      type="button"
                      className="delete-play-button"
                      onClick={() =>
                        handleDeletePlay(
                          play.id
                        )
                      }
                    >
                      Delete play
                  </button>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="history-empty">
              You haven't logged a play of
              this game yet.
            </p>
          )}
        </>
      ) : (
        <p className="history-empty">
          Play history unavailable.
        </p>
      )}
    </div>
  )
}


export default GameHistory