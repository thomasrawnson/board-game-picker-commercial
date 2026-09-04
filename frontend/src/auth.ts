export interface AuthUser {
  id: number
  email: string
  display_name: string | null
}

export interface AuthResult {
  access_token: string
  token_type: string
  user: AuthUser
}


const TOKEN_KEY =
  "boardgamepicker_access_token"


export function getToken():
string | null {
  return localStorage.getItem(
    TOKEN_KEY,
  )
}


export function saveToken(
  token: string,
): void {
  localStorage.setItem(
    TOKEN_KEY,
    token,
  )
}


export function clearToken(): void {
  localStorage.removeItem(
    TOKEN_KEY,
  )
}