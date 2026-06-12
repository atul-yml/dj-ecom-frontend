import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  resolve: {
    alias: {
      // Lets you import from "@/lib/api" instead of "../../lib/api"
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
