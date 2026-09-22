import { Component, type ReactNode } from "react"

import { captureClientError } from "../telemetry"

type Props = { children: ReactNode }
type State = { failed: boolean }

class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error): void {
    captureClientError(error, "react_render")
  }

  render() {
    if (this.state.failed) {
      return <main className="app-shell">
        <section className="phone auth-loading" role="alert">
          <h1>Something went wrong</h1>
          <p>ShelfPick couldn’t show this screen. Reload to try again.</p>
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>
            Reload ShelfPick
          </button>
        </section>
      </main>
    }

    return this.props.children
  }
}

export default AppErrorBoundary
