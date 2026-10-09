import { defineConfig, devices } from '@playwright/test'

// Las pruebas corren contra el build de producción (lo mismo que sirve Vercel).
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  workers: 4,
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
  },
})
