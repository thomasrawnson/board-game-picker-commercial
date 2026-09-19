import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import vm from "node:vm"

const source = await readFile(new URL("../public/theme.js", import.meta.url), "utf8")
function initialize(dark, explicitTheme) {
  const root = { dataset: explicitTheme ? { theme: explicitTheme } : {}, hasAttribute: () => Boolean(explicitTheme) }
  let listener
  const preference = { matches: dark, addEventListener(event, callback) { assert.equal(event, "change"); listener = callback } }
  vm.runInNewContext(source, {
    document: { documentElement: root },
    window: { matchMedia: query => { assert.equal(query, "(prefers-color-scheme: dark)"); return preference } },
  })
  return { root, preference, listener }
}
test("theme follows initial OS preference and subsequent changes", () => {
  for (const dark of [false, true]) {
    const { root, preference, listener } = initialize(dark)
    assert.equal(root.dataset.theme, dark ? "dark" : "light")
    preference.matches = !dark
    listener()
    assert.equal(root.dataset.theme, dark ? "light" : "dark")
  }
})
test("explicit initial theme is preserved without subscribing to OS changes", () => {
  for (const theme of ["light", "dark"]) {
    const { root, listener } = initialize(theme === "light", theme)
    assert.equal(root.dataset.theme, theme)
    assert.equal(listener, undefined)
  }
})
