import {
  StrictMode,
} from "react"

import {
  createRoot,
} from "react-dom/client"

import {
  BrowserRouter,
} from "react-router-dom"

import {
  registerSW,
} from "virtual:pwa-register"

import App
  from "./App.tsx"

import "./index.css"


registerSW({
  immediate: true,

  onRegisteredSW(
    _swUrl,
    registration,
  ) {
    if (!registration) {
      return
    }

    window.setInterval(
      () => {
        registration
          .update()
          .catch(
            (error) => {
              console.warn(
                "Service worker update check failed",
                error,
              )
            },
          )
      },
      60 * 60 * 1000,
    )
  },

  onRegisterError(error) {
    console.error(
      "Service worker registration failed",
      error,
    )
  },
})


createRoot(
  document.getElementById(
    "root",
  )!,
).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
