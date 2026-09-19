import { useState } from "react"
import { PASSWORD_HINT } from "../../auth-validation"

type Props = {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  newPassword?: boolean
}
export default function PasswordField({ value, onChange, error, disabled, newPassword }: Props) {
  const [visible, setVisible] = useState(false)
  return <div className="password-field">
    <label htmlFor="password">{newPassword ? "New password" : "Password"}</label>
    <div className="password-input-row">
      <input id="password" name="password" type={visible ? "text" : "password"}
        value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        autoComplete={newPassword ? "new-password" : "current-password"}
        required aria-invalid={!!error} aria-describedby={[newPassword && "password-hint", error && "password-error"].filter(Boolean).join(" ") || undefined} />
      <button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible} aria-controls="password" onClick={() => setVisible(v => !v)}>{visible ? "Hide" : "Show"}</button>
    </div>
    {newPassword && <p id="password-hint" className="field-hint">{PASSWORD_HINT}</p>}
    {error && <p id="password-error" className="field-error">{error}</p>}
  </div>
}
