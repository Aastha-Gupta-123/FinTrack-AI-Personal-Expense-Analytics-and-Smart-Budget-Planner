import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ── Build output ────────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,      // disable sourcemaps in production for security
    minify: 'esbuild',     // fast minification
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large vendor chunks for better caching
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor':  ['chart.js', 'react-chartjs-2'],
          'motion-vendor': ['framer-motion'],
        },
      },
    },
  },

  // ── Environment variable prefix ─────────────────────────────────────────────
  envPrefix: 'VITE_',

  // ── Dev server proxy (avoids CORS during local development) ─────────────────
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
