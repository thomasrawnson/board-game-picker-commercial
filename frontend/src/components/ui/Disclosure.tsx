import type {
  ReactNode,
} from "react"

type Props = {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}

function Disclosure({
  label,
  hint,
  children,
  className = "",
}: Props) {
  return (
    <details
      className={
        [
          "ui-disclosure",
          className,
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <summary>
        <span>
          <strong>
            {label}
          </strong>

          {hint && (
            <small>
              {hint}
            </small>
          )}
        </span>

        <span
          className="ui-disclosure-chevron"
          aria-hidden="true"
        >
          ⌄
        </span>
      </summary>

      <div className="ui-disclosure-body">
        {children}
      </div>
    </details>
  )
}

export default Disclosure
