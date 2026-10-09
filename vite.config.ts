import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // Las pruebas de extremo a extremo son de Playwright y tienen su propio tsconfig.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
})
