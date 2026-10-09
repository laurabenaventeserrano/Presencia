import { expect, test, type Page } from '@playwright/test'
import { ask, expectNoAxeViolations, open, rows, rowSummaries } from './helpers'
const rowTitles = async (page: Page) => (await rowSummaries(page)).join('\n')

test('A2 cuento qué necesito hacer y recibo mi día en bloques', async ({ page }) => {
  await open(page)
  await ask(page, 'escribir la propuesta, revisar correos y llamar a Marta')
  await expect(page.getByText(/^Te propongo \d+ bloques, .+ en total\.$/)).toBeVisible()
  await expect(rows(page)).toHaveCount(4)
  expect((await rowSummaries(page))[0]).toBe('Escribir la propuesta · 50 min · Pendiente')
  await expect(page.getByText(/^Total: /)).toBeVisible()
  await expectNoAxeViolations(page)
})

test('A3 siempre hay plan, nunca un error', async ({ page }) => {
  await open(page)
  await ask(page, 'asdf')
  await expect(rows(page)).toHaveCount(1)
  expect(await rowSummaries(page)).toEqual(['Asdf · 15 min · Pendiente'])
  await expect(page.getByText(/error|no te he entendido/i)).toHaveCount(0)
})

test('A4 con el campo vacío, enviar está desactivado y «Sugiéreme un día» propone 3 o 4 bloques', async ({ page }) => {
  await open(page)
  await expect(page.getByRole('button', { name: 'Enviar' })).toBeDisabled()
  await expect(page.getByText('Escribe qué necesitas hacer para enviarlo')).toBeVisible()
  await page.getByRole('button', { name: 'Sugiéreme un día' }).click()
  await page.clock.runFor(5_000)
  const count = (await rowSummaries(page)).filter((row) => !row.startsWith('Respirar')).length
  expect(count).toBeGreaterThanOrEqual(3)
  expect(count).toBeLessThanOrEqual(4)
})

test('A5 «Otra propuesta» cambia la lista entera cada vez', async ({ page }) => {
  await open(page)
  await ask(page, 'escribir la propuesta, revisar correos y llamar a Marta')
  const seen = [await rowTitles(page)]
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Otra propuesta' }).click()
    await page.clock.runFor(5_000)
    const current = await rowTitles(page)
    expect(current).not.toBe(seen[seen.length - 1])
    seen.push(current)
  }
})

test('A15 una propuesta larga incluye un Respirar de 3 minutos entre bloques de foco', async ({ page }) => {
  await open(page)
  await ask(page, 'escribir el informe, diseñar la portada, revisar correos y llamar a Marta')
  const texts = await rowSummaries(page)
  const index = texts.findIndex((text) => text.startsWith('Respirar'))
  expect(index).toBeGreaterThan(0)
  expect(index).toBeLessThan(texts.length - 1)
  expect(texts[index]).toBe('Respirar · 3 min · Pendiente')
})

test('X1 la propuesta no cambia el estado de la app hasta que la persona la acepta', async ({ page }) => {
  await open(page)
  await ask(page, 'escribir la propuesta')
  const saved = await page.evaluate(() => localStorage.getItem('presencia:v1'))
  expect(saved === null || JSON.parse(saved).plan === null).toBe(true)
})
