import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"


const expectedIcons = new Map([
  ["branding/pwa-192.png", 192],
  ["branding/pwa-512.png", 512],
])


async function readPngDimensions(filePath) {
  const contents = await readFile(filePath)
  const signature = contents.subarray(0, 8).toString("hex")

  assert.equal(
    signature,
    "89504e470d0a1a0a",
    `${filePath} is not a valid PNG`,
  )

  return {
    width: contents.readUInt32BE(16),
    height: contents.readUInt32BE(20),
  }
}


const manifestPath = path.resolve(
  "dist/manifest.webmanifest",
)
const manifest = JSON.parse(
  await readFile(manifestPath, "utf8"),
)

assert.equal(manifest.theme_color, "#315C48")
assert.equal(manifest.background_color, "#F6F3EB")
const html = await readFile(path.resolve("dist/index.html"), "utf8")
assert.match(html, /name="theme-color" content="#315C48" media="\(prefers-color-scheme: light\)"/)
assert.match(html, /name="theme-color" content="#151816" media="\(prefers-color-scheme: dark\)"/)
assert.match(html, /href="\/branding\/favicon.svg"/)
assert.match(await readFile(path.resolve("dist/branding/favicon.svg"), "utf8"), /<svg\b/)
const serviceWorker = await readFile(path.resolve("dist/sw.js"), "utf8")
for (const asset of ["theme.js", "branding/favicon.svg", ...expectedIcons.keys()]) {
  assert.ok(serviceWorker.includes(asset), `${asset} is missing from the precache`)
}

for (const [filename, expectedSize] of expectedIcons) {
  const icon = manifest.icons?.find(
    (item) => item.src === `/${filename}`,
  )

  assert.ok(
    icon,
    `${filename} is missing from the generated manifest`,
  )
  assert.equal(icon.sizes, `${expectedSize}x${expectedSize}`)
  assert.equal(icon.type, "image/png")

  const dimensions = await readPngDimensions(
    path.resolve("dist", filename),
  )

  assert.deepEqual(
    dimensions,
    {
      width: expectedSize,
      height: expectedSize,
    },
  )
}

console.log("PWA branding, theme metadata, icon dimensions and precache are valid.")
