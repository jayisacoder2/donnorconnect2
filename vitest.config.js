// Vitest workspace configuration
// Combines all test environments into a single config using separate project files

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'vitest.config.node.js',
      'vitest.config.client.js',
      'vitest.config.integration.js',
    ],
  },
})
