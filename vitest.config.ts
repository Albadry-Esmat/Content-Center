import path from 'node:path'
import { defineConfig } from 'vitest/config'

const root = path.resolve(import.meta.dirname)

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(root, 'client', 'src'),
      '@shared': path.resolve(root, 'shared'),
    },
  },
  test: {
    environment: 'node',
    include: ['client/src/**/*.test.ts', 'client/src/**/*.test.tsx', 'server/**/*.test.ts'],
  },
})
