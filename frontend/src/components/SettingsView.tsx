import { useState } from "react"
import { Link } from "react-router-dom"

import type { AuthUser } from "../auth"
import { APP_PATHS } from "../routes"
import { getThemePreference, setThemePreference, type ThemePreference } from "../theme"
import PlayerAvatar from "./ui/PlayerAvatar"

type Setting = {
  label: string
  to?: string
  detail?: string
}

const sections: { title: string; items: Setting[] }[] = [
  { title: "ShelfPick Pro", items: [
    { label: "Unlock Pro" },
    { label: "Compare Free vs Pro" },
  ] },
  { title: "Collection & Data", items: [
    { label: "Sync with BGG", to: APP_PATHS.setup },
    { label: "Cloud Sync" },
    { label: "Import Data", to: APP_PATHS.setup, detail: "BG Stats plays" },
    { label: "Export Data" },
  ] },
  { title: "Appearance", items: [] },
  { title: "Plays", items: [
    { label: "Play Challenges" },
  ] },
  { title: "Help", items: [
    { label: "What's New" },
    { label: "Feedback" },
    { label: "Report a Bug" },
    { label: "Roadmap" },
    { label: "Privacy Policy" },
  ] },
  { title: "About", items: [
    { label: "App version" },
    { label: "Pluto Night Labs", detail: "Made by Pluto Night Labs" },
    { label: "Pluto Night Labs website" },
  ] },
  { title: "Support ShelfPick", items: [
    { label: "Tip Jar" },
  ] },
]

function SettingRow({ label, to, detail }: Setting) {
  const content = <>
    <span className="settings-row-label">{label}</span>
    <span className="settings-row-detail">{detail ?? (to ? "Open" : "Coming soon")}</span>
  </>

  return to
    ? <Link className="settings-row settings-row-link" to={to}>{content}</Link>
    : <div className="settings-row settings-row-pending">{content}</div>
}

function SettingsView({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference)

  function chooseTheme(value: ThemePreference) {
    setThemePreference(value)
    setTheme(value)
  }

  return <section className="screen settings-screen" aria-labelledby="settings-heading">
    <header className="settings-heading">
      <h1 id="settings-heading">Settings</h1>
      <p>Your profile, collection and ShelfPick options.</p>
    </header>

    <section className="settings-section" aria-labelledby="settings-profile">
      <h2 id="settings-profile">Profile</h2>
      <div className="settings-list">
        <Link className="settings-row settings-row-link settings-profile-row" to={APP_PATHS.settingsProfile}>
          <PlayerAvatar name={user.player_name} variant={user.avatar_key} />
          <span className="settings-profile-copy">
            <span className="settings-row-label">Player details</span>
            <span className="settings-row-detail">{user.player_name}</span>
          </span>
        </Link>
        <SettingRow label="Avatar" to={APP_PATHS.settingsProfile} />
      </div>
    </section>

    {sections.map(({ title, items }) => {
      const id = `settings-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`
      return <section key={title} className="settings-section" aria-labelledby={id}>
        <h2 id={id}>{title}</h2>
        {title === "Appearance" ? (
          <fieldset className="settings-theme-list">
            <legend>Theme / Appearance</legend>
            {(["system", "light", "dark"] as const).map((value) => <label key={value} className="settings-theme-option">
              <span>{value === "system" ? "System" : value === "light" ? "Light" : "Dark"}</span>
              <input type="radio" name="appearance" value={value} checked={theme === value}
                onChange={() => chooseTheme(value)} />
            </label>)}
          </fieldset>
        ) : <div className="settings-list">
          {items.map((item) => <SettingRow key={item.label} {...item} />)}
        </div>}
      </section>
    })}

    <button type="button" className="settings-logout" onClick={onLogout}>Log out</button>
  </section>
}

export default SettingsView
