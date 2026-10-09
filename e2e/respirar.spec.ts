import { expect, test } from '@playwright/test'
import { expectNoAxeViolations, open } from './helpers'

const startBreathing = async (page: import('@playwright/test').Page, minutes: number) => {
  await page.getByRole('button', { name: 'Respirar' }).click()
  await page.getByRole('button', { name: `${minutes} min` }).click()
  await page.getByRole('button', { name: 'Empezar' }).click()
}

test('R1 activo la respiración eligiendo 1, 3 o 5 minutos', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Respirar' }).click()
  await expect(page.getByRole('heading', { name: 'Respirar' })).toBeVisible()
  for (const minutes of [1, 3, 5]) await expect(page.getByRole('button', { name: `${minutes} min` })).toBeVisible()
  await expectNoAxeViolations(page)
  await page.getByRole('button', { name: '3 min' }).click()
  await page.getByRole('button', { name: 'Empezar' }).click()
  await expect(page.getByText('03:00')).toBeVisible()
})

test('R2 me guía con «Coge aire» y «Suéltalo» cada 5 segundos y el tiempo restante', async ({ page }) => {
  await open(page)
  await startBreathing(page, 1)
  await expect(page.getByText('Coge aire')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Orbe respirando' })).toBeVisible()
  await expectNoAxeViolations(page)
  await page.clock.runFor(5_000)
  await expect(page.getByText('Suéltalo')).toBeVisible()
  await page.clock.runFor(5_000)
  await expect(page.getByText('Coge aire')).toBeVisible()
  await expect(page.getByText(/00:4\d/)).toBeVisible()
})

test('R3 la pauso o la termino y responde al instante', async ({ page }) => {
  await open(page)
  await startBreathing(page, 3)
  await page.getByRole('button', { name: 'Pausar' }).click()
  await expect(page.getByText('En pausa')).toBeVisible()
  await page.getByRole('button', { name: 'Reanudar' }).click()
  await expect(page.getByText('Coge aire')).toBeVisible()
  await page.getByRole('button', { name: 'Terminar' }).click()
  await expect(page.getByLabel('¿Qué necesitas hacer hoy?')).toBeVisible()
})

test('R4 termina y me lo dice sin alarma', async ({ page }) => {
  await open(page)
  await startBreathing(page, 1)
  await page.clock.runFor(61_000)
  await expect(page.getByText('Hecho', { exact: true })).toBeVisible()
  await expectNoAxeViolations(page)
  await page.getByRole('button', { name: 'Volver a Hoy' }).click()
  await expect(page.getByLabel('¿Qué necesitas hacer hoy?')).toBeVisible()
})

test('R5 cuenta como bloque: con una respiración en marcha no se puede empezar otro', async ({ page }) => {
  await open(page)
  await startBreathing(page, 5)
  await page.getByRole('button', { name: 'Hoy' }).click()
  await expect(page.getByRole('button', { name: 'Temporizador' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Respirar', exact: true })).toBeDisabled()
  await expect(page.getByText('Ya hay un bloque en marcha')).toBeVisible()
})

test('R6 se guarda como respiración, no como foco', async ({ page }) => {
  await open(page)
  await startBreathing(page, 1)
  await page.clock.runFor(61_000)
  await page.getByRole('button', { name: 'Volver a Hoy' }).click()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('presencia:v1') ?? '{}'))
  expect(saved.records).toHaveLength(1)
  expect(saved.records[0].kind).toBe('breathe')
})

test('R7 ningún texto promete beneficios de salud', async ({ page }) => {
  await open(page)
  const claims = /salud|médic|terap|ansiedad|estrés|curar|tratamiento|beneficio/i
  await page.getByRole('button', { name: 'Respirar' }).click()
  expect(await page.locator('body').innerText()).not.toMatch(claims)
  await page.getByRole('button', { name: 'Empezar' }).click()
  expect(await page.locator('body').innerText()).not.toMatch(claims)
})
