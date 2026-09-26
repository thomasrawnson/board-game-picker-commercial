import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"


const expectedIcons = new Map([
  ["branding/apple-touch-icon.png", { size: 180, purpose: null }],
  ["branding/pwa-192.png", { size: 192, purpose: "any" }],
  ["branding/pwa-512.png", { size: 512, purpose: "any" }],
  ["branding/pwa-maskable-192.png", { size: 192, purpose: "maskable" }],
  ["branding/pwa-maskable-512.png", { size: 512, purpose: "maskable" }],
  ["branding/social-profile-1024.png", { size: 1024, purpose: null }],
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
assert.match(html, /href="\/branding\/apple-touch-icon.png"/)
assert.match(await readFile(path.resolve("dist/branding/favicon.svg"), "utf8"), /<svg\b/)
for (const logo of ["shelfpick-mark.svg", "shelfpick-logo-light.svg", "shelfpick-logo-dark.svg"]) {
  assert.match(await readFile(path.resolve("dist/branding", logo), "utf8"), /<svg\b/)
}
const serviceWorker = await readFile(path.resolve("dist/sw.js"), "utf8")
const precachedBrandAssets = [
  "theme.js",
  "branding/favicon.svg",
  "branding/shelfpick-mark.svg",
  "branding/shelfpick-logo-light.svg",
  "branding/shelfpick-logo-dark.svg",
  "branding/apple-touch-icon.png",
  "branding/pwa-192.png",
  "branding/pwa-512.png",
  "branding/pwa-maskable-192.png",
  "branding/pwa-maskable-512.png",
]
for (const asset of precachedBrandAssets) {
  assert.ok(serviceWorker.includes(asset), `${asset} is missing from the precache`)
}

for (const [filename, expected] of expectedIcons) {
  const icon = manifest.icons?.find((item) => item.src === `/${filename}`)

  if (expected.purpose) {
    assert.ok(icon, `${filename} is missing from the generated manifest`)
    assert.equal(icon.sizes, `${expected.size}x${expected.size}`)
    assert.equal(icon.type, "image/png")
    assert.equal(icon.purpose, expected.purpose)
  }

  const dimensions = await readPngDimensions(
    path.resolve("dist", filename),
  )

  assert.deepEqual(
    dimensions,
    {
      width: expected.size,
      height: expected.size,
    },
  )
}

console.log("PWA branding, theme metadata, icon dimensions and precache are valid.")
