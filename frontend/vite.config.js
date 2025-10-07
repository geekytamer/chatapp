import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3011,
    proxy: {
      "/api": {
        target: "https://nf3bb4rh-5001.asse.devtunnels.ms/",
        changeOrigin: true,
        secure: false,
        // Optional: log everything
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`[VITE-PROXY] ${req.method} ${req.url}`);
          });
        }
      }
    }
  }
});