import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../src/", import.meta.url))
// Untouched template artwork, not UI styles. Keep this list explicit.
const exceptions = new Set(["styles/tokens.css", "assets/react.svg", "assets/vite.svg"])
let count = 0
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) { await scan(filename); continue }
    const relative = path.relative(root, filename).replaceAll("\\", "/")
    if (exceptions.has(relative) || !/\.(css|tsx?|jsx?|svg)$/.test(entry.name)) continue
    const source = await readFile(filename, "utf8")
    for (const match of source.matchAll(/#[\da-f]{8}\b|#[\da-f]{6}\b|#[\da-f]{4}\b|#[\da-f]{3}\b|\brgba?\(\s*\d|\bhsla?\(\s*\d/gi)) {
      const line = source.slice(0, match.index).split("\n").length
      console.log(`${relative}:${line}: raw colour ${match[0]}`)
      count++
    }
  }
}
await scan(root)
console.log(count ? `${count} raw colour(s) to review. Use semantic tokens; see docs/design-system.md.` : "Colour guard: no raw UI colours found.")
// Advisory only; intentionally not added to CI.
