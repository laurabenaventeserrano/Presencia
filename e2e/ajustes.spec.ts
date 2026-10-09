import { expect, test, type Page } from '@playwright/test'
import { ask, expectNoAxeViolations, open, startTimer } from './helpers'

type Spy = { tones: number; notes: string[] }
declare global { interface Window { __spy: Spy; __hidden: boolean } }

// Espías para el audio y los avisos, y una forma de simular que la pestaña está oculta.
const installSpies = (page: Page) => page.addInitScript(() => {
  window.__spy = { tones: 0, notes: [] }
  window.__hidden = false
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.__hidden })
  class FakeAudio {
    currentTime = 0
    destination = {}
    createOscillator() { window.__spy.tones += 1; return { type: '', frequency: { value: 0 }, connect: (node: unknown) => node, start() {}, stop() {}, onended: null } }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {} }, connect: (node: unknown) => node } }
    close() { return Promise.resolve() }
  }
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudio })
  class FakeNotification {
    static permission = 'default'
    static requestPermission() { FakeNotification.permission = 'granted'; return Promise.resolve('granted') }
    constructor(title: string, options?: { body?: string }) { window.__spy.notes.push(`${title}: ${options?.body ?? ''}`) }
  }
  Object.defineProperty(window, 'Notification', { configurable: true, value: FakeNotification })
})

const toggle = async (page: Page, name: string) => {
  await page.getByRole('link', { name: 'Ajustes' }).click()
  const control = page.getByRole('switch', { name })
  await expect(control).toHaveAttribute('aria-checked', 'false')
  await control.click()
  await expect(control).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('link', { name: 'Hoy' }).click()
}

test('E1 con «Sonido» activado suena un tono suave al terminar; por defecto, no', async ({ page }) => {
  await installSpies(page)
  await open(page)
  await startTimer(page, 1)
  await page.clock.runFor(61_000)
  await expect(page.getByText('Tiempo cumplido.')).toBeVisible()
  expect(await page.evaluate(() => window.__spy.tones)).toBe(0)
  await page.getByRole('button', { name: 'Terminar', exact: true }).click()

  await toggle(page, 'Sonido al terminar')
  await startTimer(page, 1)
  await page.clock.runFor(61_000)
  await expect(page.getByText('Tiempo cumplido.')).toBeVisible()
  expect(await page.evaluate(() => window.__spy.tones)).toBe(1)
})

test('E2 con «Avisos» activados, llega un aviso al terminar si estoy en otra pestaña', async ({ page }) => {
  await installSpies(page)
  await open(page)
  await toggle(page, 'Avisos del navegador')
  await startTimer(page, 1, 'Escribir')
  await page.evaluate(() => { window.__hidden = true })
  await page.clock.runFor(61_000)
  await expect.poll(() => page.evaluate(() => window.__spy.notes)).toEqual(['Presencia: Has terminado: Escribir'])
})

test('E2 también avisa cuando toca un bloque aplazado', async ({ page }) => {
  await installSpies(page)
  await open(page)
  await toggle(page, 'Avisos del navegador')
  await ask(page, 'escribir la propuesta, revisar correos y llamar a Marta')
  await page.getByRole('button', { name: 'Más tarde Llamar a Marta' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '15 minutos' }).click()
  await page.evaluate(() => { window.__hidden = true })
  await page.clock.runFor(15 * 60_000 + 5_000)
  await expect.poll(() => page.evaluate(() => window.__spy.notes)).toEqual(['Presencia: Toca: Llamar a Marta'])
})

test('E3 la web sigue el tema claro u oscuro del sistema', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await open(page)
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(14, 16, 20)')
  await expectNoAxeViolations(page)
  await page.emulateMedia({ colorScheme: 'light' })
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(242, 244, 248)')
})

test('E4 «Ver lo que hace la IA» muestra la herramienta llamada y el detalle; por defecto, no', async ({ page }) => {
  await open(page)
  await ask(page, 'asdf')
  await expect(page.getByText('La IA llamó a')).toHaveCount(0)
  await page.getByRole('link', { name: 'Ajustes' }).click()
  await expectNoAxeViolations(page)
  await page.getByRole('switch', { name: 'Ver lo que hace la IA' }).click()
  await page.getByRole('link', { name: 'Hoy' }).click()
  await ask(page, 'escribir la propuesta, revisar correos y llamar a Marta')
  await expect(page.getByText(/La IA llamó a propose_plan · 4 bloques/)).toBeVisible()
  await page.getByRole('button', { name: 'Ver detalle' }).click()
  await expect(page.locator('.traza__detalle')).toContainText('"name": "propose_plan"')
  await expect(page.locator('.traza__detalle')).toContainText('"title": "Escribir la propuesta"')
  await expectNoAxeViolations(page)
})
