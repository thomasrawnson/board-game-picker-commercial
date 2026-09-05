import {
  clearToken,
  getToken,
  type AuthResult,
  type AuthUser,
} from "../auth"


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


export type PickerMode =
  | "best_match"
  | "different"
  | "surprise"


export interface PickerCriteria {
  players: number
  maxPlayTime?: number
  maxComplexity?: number
  preferredCategories?: string[]
  preferredMechanics?: string[]
  mode?: PickerMode
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
  average_duration_minutes:
    number | null
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


export interface PlayerSummary {
  name: string
  play_count: number
  win_count: number
}


export interface CollectionInsights {
  total_games: number
  total_plays: number
  played_games_count: number
  collection_played_percentage:
    number
  total_duration_minutes: number
  average_duration_minutes:
    number | null
  most_played:
    GamePlaySummary | null
  last_played:
    LastPlayedGame | null
  never_played_count: number
  frequent_players: PlayerSummary[]
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


export interface CollectionGameStats {
  bgg_id: number
  play_count: number
  last_played_at: string | null
}


const API_BASE_URL =
  import.meta.env
    .VITE_API_BASE_URL ??
  "http://127.0.0.1:8000"


async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken()

  const headers = new Headers(
    options.headers,
  )

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    )
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    },
  )

  if (
    response.status === 401
    && token
  ) {
    clearToken()

    window.dispatchEvent(
      new Event(
        "boardgamepicker-auth-expired",
      ),
    )
  }

  return response
}


async function readError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data =
      await response.json()

    if (
      typeof data.detail ===
      "string"
    ) {
      return data.detail
    }
  } catch {
    // Use fallback below.
  }

  return fallback
}


export async function register(
  email: string,
  displayName: string,
  password: string,
): Promise<AuthResult> {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        display_name:
          displayName,
        password,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Registration failed",
      ),
    )
  }

  return response.json()
}


export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Login failed",
      ),
    )
  }

  return response.json()
}


export async function getMe():
Promise<AuthUser> {
  const response =
    await apiFetch(
      "/auth/me",
    )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Not authenticated",
      ),
    )
  }

  return response.json()
}


export async function getPickerMatches(
  criteria: PickerCriteria,
): Promise<PickerMatch[]> {
  const params =
    new URLSearchParams({
      players:
        criteria.players
          .toString(),
      limit: "20",
    })

  if (
    criteria.maxPlayTime !==
    undefined
  ) {
    params.set(
      "max_play_time",
      criteria.maxPlayTime
        .toString(),
    )
  }

  if (
    criteria.maxComplexity !==
    undefined
  ) {
    params.set(
      "max_complexity",
      criteria.maxComplexity
        .toString(),
    )
  }

  if (criteria.mode) {
    params.set(
      "mode",
      criteria.mode,
    )
  }

  criteria
    .preferredCategories
    ?.forEach(
      (category) => {
        params.append(
          "preferred_categories",
          category,
        )
      },
    )

  criteria
    .preferredMechanics
    ?.forEach(
      (mechanic) => {
        params.append(
          "preferred_mechanics",
          mechanic,
        )
      },
    )

  const response =
    await apiFetch(
      `/picker?${params.toString()}`,
    )

  if (!response.ok) {
    throw new Error(
      `Picker request failed: ${response.status}`,
    )
  }

  return response.json()
}


export async function getGames():
Promise<Game[]> {
  const response =
    await apiFetch(
      "/games",
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
  const response =
    await apiFetch(
      `/games/${bggId}/plays`,
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
  durationMinutes:
    number | null,
  participants:
    PlayParticipant[],
): Promise<Play> {
  const response =
    await apiFetch(
      "/plays",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          bgg_id: bggId,
          played_at:
            playedAt,
          duration_minutes:
            durationMinutes,
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
  const response =
    await apiFetch(
      "/insights",
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
  const response =
    await apiFetch(
      "/collection/sync",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          username,
        }),
      },
    )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Collection sync failed",
      ),
    )
  }

  return response.json()
}


export async function importBGStatsPlays(
  file: File,
): Promise<BGStatsImportResult> {
  const formData =
    new FormData()

  formData.append(
    "file",
    file,
  )

  const response =
    await apiFetch(
      "/imports/bgstats/plays",
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


export async function getCollectionStats():
Promise<CollectionGameStats[]> {
  const response =
    await apiFetch(
      "/collection/stats",
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
  const response =
    await apiFetch(
      `/collection/${bggId}`,
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