type Option = {
  value: string
  label: string
}

type Props = {
  value: string
  options: Option[]
  onChange: (value: string) => void
  ariaLabel: string
  className?: string
}

function SegmentedControl({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
}: Props) {
  return (
    <div
      className={
        [
          "segmented-control",
          className,
        ]
          .filter(Boolean)
          .join(" ")
      }
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={
            value === option.value
              ? "active"
              : ""
          }
          aria-pressed={
            value === option.value
          }
          onClick={() =>
            onChange(option.value)
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
