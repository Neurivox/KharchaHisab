import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

const base = process.env.VITE_BASE_PATH ?? "/"
const basePath = base.endsWith("/") ? base : `${base}/`

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "KharchaHisab",
        short_name: "Kharcha",
        description: "Personal expense tracker for Indian users — ₹, NEED/WANT/SAVING",
        theme_color: "#16a34a",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: `${basePath}icons/icon-192.png`.replace("//", "/"),
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: `${basePath}icons/icon-512.png`.replace("//", "/"),
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
