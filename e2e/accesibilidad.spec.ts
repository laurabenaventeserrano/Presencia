import { expect, test, type Page } from '@playwright/test'
import { ask, expectNoAxeViolations, open, startTimer } from './helpers'

const INTENT = 'escribir la propuesta, revisar correos y llamar a Marta'

// Cada pantalla de la app, a la que se llega desde cero.
const screens: { name: string; reach: (page: Page) => Promise<void> }[] = [
  { name: 'Hoy vacía', reach: async (page) => { await open(page) } },
  { name: 'Hoy con Tu día', reach: async (page) => { await open(page); await ask(page, INTENT) } },
  { name: 'Temporizador', reach: async (page) => { await open(page); await page.getByRole('button', { name: 'Temporizador' }).click() } },
  { name: 'En curso', reach: async (page) => { await open(page); await startTimer(page, 25, 'Escribir') } },
  { name: 'Hoy con un bloque en marcha', reach: async (page) => { await open(page); await ask(page, INTENT); await page.getByRole('button', { name: 'Empezar Revisar correos' }).click(); await page.getByRole('button', { name: 'Hoy' }).click() } },
  { name: 'Aviso de fin', reach: async (page) => { await open(page); await startTimer(page, 1); await page.clock.runFor(61_000) } },
  { name: 'Respirar', reach: async (page) => { await open(page); await page.getByRole('button', { name: 'Respirar' }).click() } },
  { name: 'Respirar guiado', reach: async (page) => { await open(page); await page.getByRole('button', { name: 'Respirar' }).click(); await page.getByRole('button', { name: 'Empezar' }).click() } },
  { name: 'Días', reach: async (page) => { await open(page, '/dias') } },
  { name: 'Ajustes', reach: async (page) => { await open(page, '/ajustes') } },
]

for (const theme of ['light', 'dark'] as const) {
  for (const screen of screens) {
    test(`G1 sin violaciones de axe: ${screen.name} (${theme === 'light' ? 'claro' : 'oscuro'}, 390 px)`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.emulateMedia({ colorScheme: theme })
      await screen.reach(page)
      await expectNoAxeViolations(page)
    })
  }
}

// Lo que tiene el foco debe verse: anillo de 2 px.
const focusRing = (page: Page) => page.evaluate(() => {
  const el = document.activeElement as HTMLElement | null
  if (!el || el === document.body) return null
  const style = getComputedStyle(el)
  return { name: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName, outline: `${style.outlineStyle} ${style.outlineWidth}` }
})

test('G2 todo se alcanza con Tab, en orden y con el foco siempre visible', async ({ page }) => {
  await open(page)
  await ask(page, INTENT)
  const seen: string[] = []
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    const ring = await focusRing(page)
    if (!ring) continue
    expect(ring.outline, `foco visible en «${ring.name}»`).toBe('solid 2px')
    seen.push(ring.name)
  }
  expect(seen).toContain('Empezar Escribir la propuesta')
  expect(seen).toContain('Temporizador')
})

test('G2 el temporizador y En curso se manejan solo con teclado', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Temporizador' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Temporizador' })).toBeFocused()
  await page.getByLabel('Título (opcional)').focus()
  await page.keyboard.type('Leer')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Leer' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'Reanudar' })).toBeVisible()
  await page.getByRole('button', { name: 'Terminar' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})

const contrast = (page: Page, selector: string) => page.evaluate((sel) => {
  const rgb = (value: string) => (value.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number)
  const lum = ([r, g, b]: number[]) => [r, g, b].map((c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }).reduce((t, c, i) => t + c * [0.2126, 0.7152, 0.0722][i], 0)
  const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
  const el = document.querySelector(sel) as HTMLElement
  const border = rgb(getComputedStyle(el).borderTopColor)
  const around = rgb(getComputedStyle(document.body).backgroundColor)
  return ratio(border, around)
}, selector)

for (const theme of ['light', 'dark'] as const) {
  test(`G3 el campo de texto se distingue de su fondo y tiene etiqueta visible (${theme === 'light' ? 'claro' : 'oscuro'})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await open(page)
    await expect(page.locator('label[for="intencion"]')).toBeVisible()
    expect(await contrast(page, '.campo')).toBeGreaterThanOrEqual(3)
    await page.getByRole('button', { name: 'Temporizador' }).click()
    expect(await contrast(page, '.campo-simple')).toBeGreaterThanOrEqual(3)
  })
}

test('G4 a 390 px, cada control mide al menos 44 × 44', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page)
  await ask(page, INTENT)
  const small = await page.locator('button:visible, a:visible, input:visible').evaluateAll((els) => els
    .map((el) => ({ name: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName, box: el.getBoundingClientRect() }))
    .filter(({ box }) => box.width < 44 || box.height < 44)
    .map(({ name, box }) => `${name} ${Math.round(box.width)}×${Math.round(box.height)}`))
  expect(small).toEqual([])
})

test('G5 los botones se anuncian con su nombre completo y los cambios con aria-live', async ({ page }) => {
  await open(page)
  await ask(page, INTENT)
  await expect(page.getByRole('button', { name: 'Quitar bloque Revisar correos' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Más tarde Revisar correos' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Añadir 5 minutos a Revisar correos' })).toBeVisible()
  await expect(page.locator('.hoy__respuesta[aria-live="polite"]')).toHaveText(/Te propongo/)
  await page.getByRole('button', { name: 'Quitar bloque Revisar correos' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Has quitado' })).toBeVisible()
})

test('G6 con movimiento reducido el orbe no se anima', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page)
  await startTimer(page, 25)
  const animations = await page.locator('.orbe, .orbe__mancha').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName))
  expect(animations.every((name) => name === 'none')).toBe(true)
})

const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

for (const screen of screens) {
  test(`G7 con zoom del 200 % no se pierde contenido ni hay scroll horizontal: ${screen.name}`, async ({ page }) => {
    // 200 % de una pantalla de 1280 px equivale a 640 px de ancho.
    await page.setViewportSize({ width: 640, height: 400 })
    await screen.reach(page)
    expect(await overflow(page)).toBeLessThanOrEqual(0)
  })
}

test('G8 nada se comunica solo con color: el orbe y los bloques llevan texto', async ({ page }) => {
  await open(page)
  await expect(page.getByRole('img', { name: 'Orbe en reposo' })).toBeVisible()
  await ask(page, INTENT)
  await expect(page.getByText('Pendiente').first()).toBeVisible()
  await page.getByRole('button', { name: 'Empezar Revisar correos' }).click()
  await expect(page.getByRole('img', { name: 'Orbe en foco' })).toBeVisible()
  await page.getByRole('button', { name: 'Pausar' }).click()
  await expect(page.getByRole('img', { name: 'Orbe en pausa' })).toBeVisible()
})

for (const width of [320, 390, 768, 1440]) {
  for (const screen of screens) {
    test(`H1 a ${width} px nada se corta ni hay scroll horizontal: ${screen.name}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await screen.reach(page)
      expect(await overflow(page)).toBeLessThanOrEqual(0)
    })
  }
}

test('H2 a 390 px lo principal está a mano', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page)
  for (const name of ['Enviar', 'Temporizador', 'Respirar']) await expect(page.getByRole('button', { name, exact: true })).toBeInViewport()
  await startTimer(page, 25)
  for (const name of ['Terminar', 'Pausar', 'Más tarde']) await expect(page.getByRole('button', { name })).toBeInViewport()
})
