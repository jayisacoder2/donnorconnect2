// Vitest workspace configuration
// Combines all test environments into a single config

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js', './tests/setup.client.js'],
    include: [
      'tests/**/*.test.{js,jsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/integration/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Mock server-only imports for test environment
      'server-only': path.resolve(__dirname, './tests/helpers/server-only-mock.js'),
    },
  },
})
