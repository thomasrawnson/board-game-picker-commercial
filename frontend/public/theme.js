// Run before React and styles paint; the OS preference owns the default theme.
// Explicit data-theme on <html> remains an override for hosts and previews.
(() => {
  const root = document.documentElement
  if (root.hasAttribute("data-theme")) return
  const preference = window.matchMedia("(prefers-color-scheme: dark)")
  const applyTheme = () => {
    root.dataset.theme = preference.matches ? "dark" : "light"
  }
  applyTheme()
  preference.addEventListener("change", applyTheme)
})()
