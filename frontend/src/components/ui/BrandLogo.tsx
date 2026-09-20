type Props = {
  className?: string
}

export default function BrandLogo({ className = "" }: Props) {
  const classes = ["brand-logo", className].filter(Boolean).join(" ")

  return (
    <span className={classes}>
      <img
        className="brand-logo-light"
        src="/branding/shelfpick-logo-light.svg"
        alt="ShelfPick"
      />
      <img
        className="brand-logo-dark"
        src="/branding/shelfpick-logo-dark.svg"
        alt="ShelfPick"
      />
    </span>
  )
}
