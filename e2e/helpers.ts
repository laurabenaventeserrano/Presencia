import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

// Un momento fijo para que fechas y horas de las pruebas sean siempre las mismas.
export const NOW = new Date('2026-10-09T10:00:00+02:00')

// Abre la app con el reloj simulado de Playwright, parado, y sin nada guardado.
// El tiempo solo avanza cuando la prueba lo pide (page.clock.runFor), nunca en tiempo real.
export const open = async (page: Page, path = '/') => {
  await page.clock.install({ time: NOW })
  await page.goto(path)
  await pauseClock(page)
}

// Para el reloj un segundo después de la hora que marque la página ahora mismo
// (con muchas pruebas en paralelo, la carga puede tardar más de un segundo).
export const pauseClock = async (page: Page) => {
  const now = await page.evaluate(() => Date.now())
  await page.clock.pauseAt(new Date(now + 1000))
}

// axe sin violaciones de WCAG 2.2 A y AA.
// axe usa sus propios temporizadores: el reloj corre mientras analiza y vuelve a pararse después.
export const expectNoAxeViolations = async (page: Page) => {
  await page.clock.resume()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  await pauseClock(page)
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

// Cuenta qué necesitas hacer y espera a que aparezca «Tu día».
export const ask = async (page: Page, text: string) => {
  await page.getByLabel('¿Qué necesitas hacer hoy?').fill(text)
  await page.getByRole('button', { name: 'Enviar' }).click()
  await page.clock.runFor(5_000)
  await expect(page.getByRole('heading', { name: 'Tu día' })).toBeVisible()
}

export const rows = (page: Page) => page.getByRole('region', { name: 'Tu día' }).getByRole('listitem')

// Lo que se ve en cada fila de Tu día: título (del campo o del texto), minutos y estado.
export const rowSummaries = (page: Page) =>
  rows(page).evaluateAll((items) => items.map((item) => {
    const title = item.querySelector<HTMLInputElement>('.fila__titulo')?.value ?? item.querySelector('.fila__nombre')?.textContent ?? ''
    const minutes = item.querySelector<HTMLInputElement>('.fila__numero')?.value ?? item.querySelector('.fila__valor')?.textContent?.replace(/\D/g, '') ?? ''
    const status = item.querySelector('.fila__estado')?.textContent ?? ''
    return `${title} · ${minutes} min · ${status}`
  }))
