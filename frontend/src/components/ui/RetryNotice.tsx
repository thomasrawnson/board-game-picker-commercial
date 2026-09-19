type Props = { message: string; busy?: boolean; onRetry: () => void }
export default function RetryNotice({ message, busy, onRetry }: Props) {
  return <div className="retry-notice" aria-busy={busy}>
    <p role="alert">{message}</p>
    <button type="button" className="secondary-button" disabled={busy} onClick={onRetry}>
      {busy ? "Retrying…" : "Try again"}
    </button>
  </div>
}
