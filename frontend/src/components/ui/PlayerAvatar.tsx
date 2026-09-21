type Props = {
  name: string
  variant?: "forest" | "gold" | "clay"
  className?: string
}

function PlayerAvatar({ name, variant = "forest", className = "" }: Props) {
  const initials = name.trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? "").join("") || "?"

  return <span className={`player-avatar player-avatar-${variant} ${className}`}
    aria-hidden="true">{initials}</span>
}

export default PlayerAvatar
