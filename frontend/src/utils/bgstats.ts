import type {
  Game,
  GamePlay,
  Play,
  PlayParticipant,
} from "../api/client"


type BGStatsPlayer = {
  name: string
  sourcePlayerId: string
  startPlayer: boolean
  winner: boolean
  score?: number
}


type BGStatsPlayData = {
  sourceName: string
  sourcePlayId: string
  playDate: string
  durationMin?: number
  game: {
    name: string
    sourceGameId: string
    bggId: number
    highestWins: boolean
    noPoints: boolean
  }
  players: BGStatsPlayer[]
}


function formatBGStatsDate(
  value: string,
): string {
  return new Date(value)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")
}


function playerSourceId(
  name: string,
): string {
  return (
    "player:"
    + name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
  )
}


function buildPlayers(
  participants: PlayParticipant[],
): BGStatsPlayer[] {
  return participants.map(
    (participant) => {
      const player: BGStatsPlayer = {
        name: participant.name,
        sourcePlayerId:
          playerSourceId(
            participant.name,
          ),
        startPlayer: false,
        winner:
          participant.is_winner,
      }

      if (
        participant.score !== null
      ) {
        player.score =
          participant.score
      }

      return player
    },
  )
}


export function createBGStatsPlayUrl(
  game: Game,
  play: Play,
  participants: PlayParticipant[],
  durationMinutes:
    number | null,
): string {
  const payload:
    BGStatsPlayData = {
    sourceName:
      "Board Game Picker",

    sourcePlayId:
      `play:${play.id}`,

    playDate:
      formatBGStatsDate(
        play.played_at,
      ),

    game: {
      name: game.name,
      sourceGameId:
        `bgg:${game.bgg_id}`,
      bggId: game.bgg_id,
      highestWins: true,
      noPoints:
        participants.every(
          (participant) =>
            participant.score ===
            null,
        ),
    },

    players:
      buildPlayers(
        participants,
      ),
  }

  if (
    durationMinutes !== null
  ) {
    payload.durationMin =
      durationMinutes
  }

  return (
    "https://app.bgstatsapp.com/"
    + "createPlay.html?data="
    + encodeURIComponent(
      JSON.stringify(payload),
    )
  )
}


export function createBGStatsHistoryUrl(
  game: Game,
  play: GamePlay,
): string {
  return createBGStatsPlayUrl(
    game,
    {
      id: play.id,
      bgg_id: game.bgg_id,
      player_count:
        play.player_count,
      played_at:
        play.played_at,
    },
    play.participants,
    play.duration_minutes,
  )
}