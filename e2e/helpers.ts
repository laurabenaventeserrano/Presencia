import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

// Un momento fijo para que fechas y horas de las pruebas sean siempre las mismas.
export const NOW = new Date('2026-10-09T10:00:00+02:00')

// Abre la app con el reloj simulado de Playwright y sin nada guardado.
export const open = async (page: Page, path = '/') => {
  await page.clock.install({ time: NOW })
  await page.goto(path)
}

// axe sin violaciones de WCAG 2.2 A y AA.
export const expectNoAxeViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
}
