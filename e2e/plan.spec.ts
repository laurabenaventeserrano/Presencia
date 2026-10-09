import { expect, test, type Page } from '@playwright/test'
import { expectNoAxeViolations, open } from './helpers'

export const ask = async (page: Page, text: string) => {
  await page.getByLabel('¿Qué necesitas hacer hoy?').fill(text)
  await page.getByRole('button', { name: 'Enviar' }).click()
  await page.clock.runFor(5_000)
  await expect(page.getByRole('heading', { name: 'Tu día' })).toBeVisible()
}

const rows = (page: Page) => page.getByRole('region', { name: 'Tu día' }).getByRole('listitem')
const rowTitles = async (page: Page) => (await rows(page).allInnerTexts()).join('\n')

test('A2 cuento qué necesito hacer y recibo mi día en bloques', async ({ page }) => {
  await open(page)
  await ask(page, 'escribir la propuesta, revisar correos y llamar a Marta')
  await expect(page.getByText(/^Te propongo \d+ bloques, .+ en total\.$/)).toBeVisible()
  await expect(rows(page)).toHaveCount(4)
  await expect(rows(page).first()).toContainText('Escribir la propuesta')
  await expect(rows(page).first()).toContainText('50 min')
  await expect(page.getByText(/^Total: /)).toBeVisible()
  await expectNoAxeViolations(page)
})

test('A3 siempre hay plan, nunca un error', async ({ page }) => {
  await open(page)
  await ask(page, 'asdf')
  await expect(rows(page)).toHaveCount(1)
  await expect(rows(page).first()).toContainText('Asdf')
  await expect(page.getByText(/error|no te he entendido/i)).toHaveCount(0)
})

test('A4 con el campo vacío, enviar está desactivado y «Sugiéreme un día» propone 3 o 4 bloques', async ({ page }) => {
  await open(page)
  await expect(page.getByRole('button', { name: 'Enviar' })).toBeDisabled()
  await expect(page.getByText('Escribe qué necesitas hacer para enviarlo')).toBeVisible()
  await page.getByRole('button', { name: 'Sugiéreme un día' }).click()
  await page.clock.runFor(5_000)
  const focusRows = rows(page).filter({ hasNotText: 'Respirar' })
  const count = await focusRows.count()
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
  const texts = await rows(page).allInnerTexts()
  const index = texts.findIndex((text) => text.includes('Respirar'))
  expect(index).toBeGreaterThan(0)
  expect(index).toBeLessThan(texts.length - 1)
  expect(texts[index]).toContain('3 min')
})

test('X1 la propuesta no cambia el estado de la app hasta que la persona la acepta', async ({ page }) => {
  await open(page)
  await ask(page, 'escribir la propuesta')
  const saved = await page.evaluate(() => localStorage.getItem('presencia:v1'))
  expect(saved === null || JSON.parse(saved).plan === null).toBe(true)
})
