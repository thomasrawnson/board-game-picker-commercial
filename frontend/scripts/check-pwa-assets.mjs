import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"


const expectedIcons = new Map([
  ["pwa-192x192.png", 192],
  ["pwa-512x512.png", 512],
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

console.log("PWA manifest icons are valid.")
