import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/EquipmentMaintenance/", // Adjust ito base sa repository name mo
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000", // Adjust to match your backend server port
        ws: true, // Enable WebSocket support
        changeOrigin: true,
      },
    },
  },
})
