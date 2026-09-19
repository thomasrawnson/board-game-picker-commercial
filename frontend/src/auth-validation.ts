export const PASSWORD_HINT = "Use 8–128 characters. No special character or number is required."
export function passwordError(value: string): string {
  const length = Array.from(value).length
  return length < 8 || length > 128 ? "Use between 8 and 128 characters." : ""
}
export function registrationErrors(email: string, name: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email address."
  if (!name.trim() || Array.from(name).length > 100) errors.display_name = "Enter a name between 1 and 100 characters."
  const message = passwordError(password)
  if (message) errors.password = message
  return errors
}
