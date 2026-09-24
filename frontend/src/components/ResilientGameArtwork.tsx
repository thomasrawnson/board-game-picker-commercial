import { useState } from "react"

type Props = {
  src: string | null | undefined
  alt: string
  gameName: string
}

function ResilientGameArtwork({
  src,
  alt,
  gameName,
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const artworkFailed = Boolean(src && failedSrc === src)

  if (!src || artworkFailed) {
    return (
      <div
        className="game-artwork-placeholder"
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : "true"}
      >
        <span className="game-artwork-placeholder-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="game-artwork-placeholder-copy" aria-hidden="true">
          <strong>ShelfPick</strong>
          <small>Artwork unavailable</small>
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => {
        console.warn("Game artwork failed to load", {
          gameName,
          src,
        })
        setFailedSrc(src)
      }}
    />
  )
}

export default ResilientGameArtwork
