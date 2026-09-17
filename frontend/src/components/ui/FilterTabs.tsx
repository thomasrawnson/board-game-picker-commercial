type Option = {
  value: string
  label: string
}

type Props = {
  value: string
  options: Option[]
  onChange: (value: string) => void
  ariaLabel: string
}

function FilterTabs({
  value,
  options,
  onChange,
  ariaLabel,
}: Props) {
  return (
    <div
      className="filter-tabs"
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

export default FilterTabs
