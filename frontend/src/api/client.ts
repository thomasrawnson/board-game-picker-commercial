export interface Game {
  bgg_id: number
  name: string
  year_published: number | null
  min_players: number | null
  max_players: number | null
  min_play_time: number | null
  max_play_time: number | null
  complexity: number | null
  rating: number | null
  owned: boolean
  image_url: string | null
  thumbnail_url: string | null
  categories: string[]
  mechanics: string[]
}

export interface PickerMatch {
  game: Game
  score: number
  reasons: string[]
}

export interface PickerCriteria {
  players: number
  maxPlayTime?: number
  preferredCategories?: string[]
  preferredMechanics?: string[]
}

export interface Play {
  id: number
  bgg_id: number
  player_count: number
  played_at: string
}

export interface PlayParticipant {
  name: string
  score: number | null
  is_winner: boolean
}

export interface GamePlayParticipant
  extends PlayParticipant {
  id: number
}

export interface GamePlay {
  id: number
  played_at: string
  player_count: number
  duration_minutes: number | null
  source: string
  participants: GamePlayParticipant[]
}

export interface GameHistory {
  bgg_id: number
  play_count: number
  last_played_at: string | null
  average_players: number | null
  average_duration_minutes: number | null
  recent_plays: GamePlay[]
}

export interface GamePlaySummary {
  bgg_id: number
  name: string
  play_count: number
}

export interface LastPlayedGame {
  bgg_id: number
  name: string
  played_at: string
}

export interface CollectionInsights {
  total_games: number
  total_plays: number
  most_played: GamePlaySummary | null
  last_played: LastPlayedGame | null
  never_played_count: number
}

export interface CollectionSyncResult {
  username: string
  games_synced: number
}

export interface BGStatsImportResult {
  imported: number
  skipped_existing: number
  skipped_missing_game: number
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000"


export async function getPickerMatches(
  criteria: PickerCriteria,
): Promise<PickerMatch[]> {
  const params = new URLSearchParams({
    players: criteria.players.toString(),
    limit: "20",
  })

  if (criteria.maxPlayTime !== undefined) {
    params.set(
      "max_play_time",
      criteria.maxPlayTime.toString(),
    )
  }

  criteria.preferredCategories?.forEach(
    (category) => {
      params.append(
        "preferred_categories",
        category,
      )
    },
  )

  criteria.preferredMechanics?.forEach(
    (mechanic) => {
      params.append(
        "preferred_mechanics",
        mechanic,
      )
    },
  )

  const response = await fetch(
    `${API_BASE_URL}/picker?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error(
      `Picker request failed: ${response.status}`,
    )
  }

  return response.json()
}


export async function getGames(): Promise<Game[]> {
  const response = await fetch(
    `${API_BASE_URL}/games`,
  )

  if (!response.ok) {
    throw new Error(
      `Games request failed: ${response.status}`,
    )
  }

  return response.json()
}


export async function getGameHistory(
  bggId: number,
): Promise<GameHistory> {
  const response = await fetch(
    `${API_BASE_URL}/games/${bggId}/plays`,
  )

  if (!response.ok) {
    throw new Error(
      `Game history request failed: ${response.status}`,
    )
  }

  return response.json()
}


export async function recordPlay(
  bggId: number,
  playedAt: string,
  durationMinutes: number | null,
  participants: PlayParticipant[],
): Promise<Play> {
  const response = await fetch(
    `${API_BASE_URL}/plays`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bgg_id: bggId,
        played_at: playedAt,
        duration_minutes: durationMinutes,
        participants,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Play request failed: ${response.status}`,
    )
  }

  return response.json()
}


export async function getCollectionInsights():
Promise<CollectionInsights> {
  const response = await fetch(
    `${API_BASE_URL}/insights`,
  )

  if (!response.ok) {
    throw new Error(
      `Insights request failed: ${response.status}`,
    )
  }

  return response.json()
}


export async function syncBGGCollection(
  username: string,
): Promise<CollectionSyncResult> {
  const response = await fetch(
    `${API_BASE_URL}/collections/${encodeURIComponent(
      username,
    )}/sync`,
    {
      method: "POST",
    },
  )

  if (!response.ok) {
    throw new Error(
      `Collection sync failed: ${response.status}`,
    )
  }

  return response.json()
}


export async function importBGStatsPlays(
  file: File,
): Promise<BGStatsImportResult> {
  const formData = new FormData()

  formData.append(
    "file",
    file,
  )

  const response = await fetch(
    `${API_BASE_URL}/imports/bgstats/plays`,
    {
      method: "POST",
      body: formData,
    },
  )

  if (!response.ok) {
    throw new Error(
      `BG Stats import failed: ${response.status}`,
    )
  }

  return response.json()
}

export interface CollectionGameStats {
  bgg_id: number
  play_count: number
  last_played_at: string | null
}

export async function getCollectionStats():
Promise<CollectionGameStats[]> {
  const response = await fetch(
    `${API_BASE_URL}/collection/stats`,
  )

  if (!response.ok) {
    throw new Error(
      `Collection stats failed: ${response.status}`,
    )
  }

  return response.json()
}

export async function removeFromCollection(
  bggId: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/collection/${bggId}`,
    {
      method: "DELETE",
    },
  )

  if (!response.ok) {
    throw new Error(
      `Collection removal failed: ${response.status}`,
    )
  }
}