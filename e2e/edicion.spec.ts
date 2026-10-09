import { expect, test } from '@playwright/test'
import { ask, expectNoAxeViolations, open, rows, rowSummaries, timeText } from './helpers'

const INTENT = 'escribir la propuesta, revisar correos y llamar a Marta'

test('A6 edito el título de un bloque y Empezar usa el título nuevo', async ({ page }) => {
  await open(page)
  await ask(page, INTENT)
  await expectNoAxeViolations(page)
  const title = page.getByLabel('Bloque 1', { exact: true })
  await title.fill('Escribir solo el resumen')
  await expect(title).toHaveValue('Escribir solo el resumen')
  await page.getByRole('button', { name: 'Empezar Escribir solo el resumen' }).click()
  await expect(page.getByRole('heading', { name: 'Escribir solo el resumen' })).toBeVisible()
})

test('A7 edito los minutos con − y + o escribiendo, entre 5 y 120', async ({ page }) => {
  await open(page)
  await ask(page, INTENT)
  const minutes = page.getByLabel('Minutos de Revisar correos')
  await expect(minutes).toHaveValue('25')
  await page.getByRole('button', { name: 'Añadir 5 minutos a Revisar correos' }).click()
  await expect(minutes).toHaveValue('30')
  await page.getByRole('button', { name: 'Quitar 5 minutos a Revisar correos' }).click()
  await page.getByRole('button', { name: 'Quitar 5 minutos a Revisar correos' }).click()
  await expect(minutes).toHaveValue('20')
  await minutes.fill('500')
  await minutes.press('Enter')
  await expect(minutes).toHaveValue('120')
  await expect(page.getByText('Como máximo 120 minutos: lo he dejado en 120.')).toBeVisible()
  await minutes.fill('2')
  await minutes.press('Tab')
  await expect(minutes).toHaveValue('5')
  await expect(page.getByText('Como mínimo 5 minutos')).toBeVisible()
  // Empezar usa los minutos editados.
  await page.getByRole('button', { name: 'Empezar Revisar correos' }).click()
  await expect(timeText(page)).toHaveText('05:00')
})

test('A8 quito un bloque y durante 8 segundos puedo deshacerlo', async ({ page }) => {
  await open(page)
  await ask(page, INTENT)
  const before = await rows(page).count()
  await page.getByRole('button', { name: 'Quitar bloque Llamar a Marta' }).click()
  await expect(rows(page)).toHaveCount(before - 1)
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(rows(page)).toHaveCount(before)
  expect((await rowSummaries(page)).at(-1)).toMatch(/^Llamar a Marta/)
  await page.getByRole('button', { name: 'Quitar bloque Llamar a Marta' }).click()
  await page.clock.runFor(7_000)
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeVisible()
  await page.clock.runFor(1_500)
  await expect(page.getByRole('button', { name: 'Deshacer' })).toHaveCount(0)
  await expect(rows(page)).toHaveCount(before - 1)
})

test('A9 añado un bloque vacío listo para editar', async ({ page }) => {
  await open(page)
  await ask(page, INTENT)
  const before = await rows(page).count()
  await page.getByRole('button', { name: 'Añadir bloque' }).click()
  await expect(rows(page)).toHaveCount(before + 1)
  const fresh = page.getByLabel(`Bloque ${before + 1}`, { exact: true })
  await expect(fresh).toBeFocused()
  await expect(fresh).toHaveValue('')
  await page.keyboard.type('Preparar la reunión')
  await expect(page.getByRole('button', { name: 'Empezar Preparar la reunión' })).toBeVisible()
})
