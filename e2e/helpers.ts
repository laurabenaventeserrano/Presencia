import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

// Un momento fijo para que fechas y horas de las pruebas sean siempre las mismas.
export const NOW = new Date('2026-10-09T10:00:00+02:00')

// Abre la app con el reloj simulado de Playwright, parado, y sin nada guardado.
// El tiempo solo avanza cuando la prueba lo pide (page.clock.runFor), nunca en tiempo real.
export const open = async (page: Page, path = '/') => {
  await page.clock.install({ time: NOW })
  await page.goto(path)
  await page.clock.pauseAt(new Date(NOW.getTime() + 1000))
}

// axe sin violaciones de WCAG 2.2 A y AA.
// axe usa sus propios temporizadores: el reloj corre mientras analiza y vuelve a pararse después.
export const expectNoAxeViolations = async (page: Page) => {
  await page.clock.resume()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  const now = await page.evaluate(() => Date.now())
  await page.clock.pauseAt(new Date(now + 1000))
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
}

// Abre el temporizador desde Hoy y arranca un bloque.
export const startTimer = async (page: Page, minutes: number, title = '') => {
  await page.getByRole('button', { name: 'Temporizador' }).click()
  await page.getByLabel('Minutos', { exact: true }).fill(String(minutes))
  if (title) await page.getByLabel('Título (opcional)').fill(title)
  await page.getByRole('button', { name: 'Play' }).click()
}

export const timeText = (page: Page) => page.locator('.curso__tiempo')
