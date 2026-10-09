import { expect, test, type Page } from '@playwright/test'
import { expectNoAxeViolations, open, pauseClock, startTimer } from './helpers'

const cells = (page: Page) => page.getByRole('gridcell').and(page.locator('[data-date]'))
const cell = (page: Page, date: string) => page.locator(`[data-date="${date}"]`)
const level = (page: Page, date: string) => cell(page, date).getAttribute('data-level')

const finishFocus = async (page: Page, minutes: number, run = minutes) => {
  await page.goto('/')
  await startTimer(page, minutes)
  await page.clock.fastForward(run * 60_000)
  await page.getByRole('button', { name: 'Terminar' }).first().click()
  const confirm = page.getByRole('dialog').getByRole('button', { name: 'Terminar' })
  if (await confirm.isVisible()) await confirm.click()
}

test('D1 D11 veo mis días como cuadrados; sin datos, todo en blanco y una invitación', async ({ page }) => {
  await open(page, '/dias')
  const count = await cells(page).count()
  expect(count).toBeGreaterThanOrEqual(365)
  expect(count).toBeLessThanOrEqual(371)
  expect(new Set(await cells(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-level'))))).toEqual(new Set(['0']))
  await expect(page.getByText('Aún no hay días con foco.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Planifica tu día' })).toBeVisible()
  await expectNoAxeViolations(page)
})

test('D2 D3 D4 el color dice cuánto foco real hubo; descansos y respiraciones no cuentan', async ({ page }) => {
  await open(page)
  await finishFocus(page, 30, 12) // terminado antes de tiempo: cuentan 12
  await page.getByRole('link', { name: 'Días' }).click()
  expect(await level(page, '2026-10-09')).toBe('1')
  await expect(cell(page, '2026-10-09')).toHaveAttribute('aria-label', '9 oct, 12 minutos de foco')
  // Un descanso y una respiración no cambian el cuadrado de hoy.
  await page.goto('/')
  await page.getByRole('button', { name: 'Respirar' }).click()
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.clock.runFor(61_000)
  await page.getByRole('button', { name: 'Volver a Hoy' }).click()
  await page.getByRole('link', { name: 'Días' }).click()
  await expect(cell(page, '2026-10-09')).toHaveAttribute('aria-label', '9 oct, 12 minutos de foco')
  // Con más foco, un tono más oscuro.
  await finishFocus(page, 50)
  await page.getByRole('link', { name: 'Días' }).click()
  expect(await level(page, '2026-10-09')).toBe('3')
})

test('D5 D7 pulso un cuadrado y veo su detalle; cada cuadrado tiene nombre', async ({ page }) => {
  await open(page)
  await finishFocus(page, 25)
  await page.getByRole('link', { name: 'Días' }).click()
  await cell(page, '2026-10-01').click()
  await expect(page.getByText('1 oct: sin foco')).toBeVisible()
  await cell(page, '2026-10-09').click()
  await expect(page.locator('#dias-detalle')).toHaveText('9 oct: 25 min de foco en 1 bloque')
  await expect(cell(page, '2026-10-09')).toHaveAttribute('aria-label', '9 oct, 25 minutos de foco')
})

test('D6 hay leyenda con «Menos», «Más» y cinco tonos', async ({ page }) => {
  await open(page, '/dias')
  const legend = page.getByLabel('Leyenda: de menos a más foco')
  await expect(legend).toContainText('Menos')
  await expect(legend).toContainText('Más')
  await expect(legend.locator('.dia')).toHaveCount(5)
})

test('D8 se maneja con teclado: una parada de Tab, flechas y Enter', async ({ page }) => {
  await open(page, '/dias')
  const focusable = await cells(page).evaluateAll((els) => els.filter((el) => el.getAttribute('tabindex') === '0').length)
  expect(focusable).toBe(1)
  await cell(page, '2026-10-09').focus()
  await page.keyboard.press('ArrowUp')
  await expect(cell(page, '2026-10-08')).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(cell(page, '2026-10-01')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#dias-detalle')).toHaveText('1 oct: sin foco')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('gridcell').and(page.locator(':focus'))).toHaveCount(0)
})

test('D9 en móvil la cuadrícula cabe sin scroll de la página, con cuadrados de 24 px y la semana actual visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, '/dias')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  const box = await cell(page, '2026-10-09').boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(24)
  await expect(cell(page, '2026-10-09')).toBeInViewport()
})

test('D10 un bloque iniciado a las 23:50 cuenta para ese día', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-08T23:50:00+02:00') })
  await page.goto('/')
  await pauseClock(page)
  await startTimer(page, 25)
  await page.clock.runFor(20 * 60_000)
  await page.getByRole('button', { name: 'Terminar' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Terminar' }).click()
  await page.getByRole('link', { name: 'Días' }).click()
  await expect(cell(page, '2026-10-08')).toHaveAttribute('aria-label', '8 oct, 20 minutos de foco')
  await expect(cell(page, '2026-10-09')).toHaveAttribute('aria-label', '9 oct, 0 minutos de foco')
})

test('D12 D13 D14 veo un ejemplo, lo mío se suma y quito el ejemplo', async ({ page }) => {
  await open(page, '/dias')
  await page.getByRole('button', { name: 'Ver un ejemplo' }).click()
  await expect(page.getByText(/^Ejemplo:/)).toBeVisible()
  const levels = await cells(page).evaluateAll((els) => els.map((el) => Number(el.getAttribute('data-level'))))
  expect(levels.filter((value) => value > 0).length).toBeGreaterThan(150)
  await expectNoAxeViolations(page)
  expect(await level(page, '2026-10-09')).toBe('0')
  await finishFocus(page, 30)
  await page.getByRole('link', { name: 'Días' }).click()
  expect(await level(page, '2026-10-09')).toBe('2')
  await page.getByRole('button', { name: 'Quitar ejemplo' }).click()
  await expect(page.getByText(/^Ejemplo:/)).toHaveCount(0)
  const after = await cells(page).evaluateAll((els) => els.filter((el) => el.getAttribute('data-level') !== '0').map((el) => el.getAttribute('data-date')))
  expect(after).toEqual(['2026-10-09'])
})

test('D15 mis datos son locales y «Borrar mis datos» pide confirmación', async ({ page }) => {
  await open(page)
  await finishFocus(page, 25)
  await page.getByRole('link', { name: 'Días' }).click()
  await expect(page.getByText('Tus días se guardan solo en este navegador.')).toBeVisible()
  await page.getByRole('button', { name: 'Ver un ejemplo' }).click()
  await page.getByRole('button', { name: 'Borrar mis datos' }).click()
  const dialog = page.getByRole('dialog', { name: '¿Borrar todos tus datos?' })
  await expect(dialog).toBeVisible()
  await expectNoAxeViolations(page)
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
  expect(await level(page, '2026-10-09')).toBe('2')
  await page.getByRole('button', { name: 'Borrar mis datos' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Borrar' }).click()
  expect(new Set(await cells(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-level'))))).toEqual(new Set(['0']))
})

test('D16 los días persisten al cerrar y abrir', async ({ page }) => {
  await open(page)
  await finishFocus(page, 25)
  await page.goto('/dias')
  await page.reload()
  await expect(cell(page, '2026-10-09')).toHaveAttribute('aria-label', '9 oct, 25 minutos de foco')
})
