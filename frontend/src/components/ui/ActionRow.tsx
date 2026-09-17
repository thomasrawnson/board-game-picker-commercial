type Props = {
  label: string
  value?: string
  onClick: () => void
  ariaLabel?: string
}

function ActionRow({
  label,
  value,
  onClick,
  ariaLabel,
}: Props) {
  return (
    <button
      type="button"
      className="action-row"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className="action-row-copy">
        <strong>
          {label}
        </strong>

        {value && (
          <small>
            {value}
          </small>
        )}
      </span>

      <span
        className="action-row-chevron"
        aria-hidden="true"
      >
        ›
      </span>
    </button>
  )
}

export default ActionRow
