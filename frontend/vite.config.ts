import {
  defineConfig,
} from "vite"

import react
  from "@vitejs/plugin-react"

import {
  VitePWA,
} from "vite-plugin-pwa"


export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType:
        "autoUpdate",

      manifest: {
        name:
          "Board Game Picker",

        short_name:
          "Game Picker",

        description:
          "Pick the right board game for game night.",

        theme_color:
          "#173023",

        background_color:
          "#173023",

        display:
          "standalone",

        orientation:
          "portrait",

        start_url:
          "/",

        scope:
          "/",

        icons: [
          {
            src:
              "/pwa-192x192.png",

            sizes:
              "192x192",

            type:
              "image/png",
          },
          {
            src:
              "/pwa-512x512.png",

            sizes:
              "512x512",

            type:
              "image/png",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches:
          true,

        navigateFallback:
          "/index.html",

        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff,woff2}",
        ],
      },
    }),
  ],
})