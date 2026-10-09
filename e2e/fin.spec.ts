import { expect, test } from '@playwright/test'
import { expectNoAxeViolations, open, startTimer, timeText } from './helpers'

test('B6 al llegar a cero, un aviso suave con +5 min, Descanso, Respirar y Terminar; nada empieza solo', async ({ page }) => {
  await open(page)
  await startTimer(page, 1, 'Escribir')
  await page.clock.runFor(61_000)
  await expect(page.getByText('Tiempo cumplido.')).toBeVisible()
  for (const name of ['+5 min', 'Descanso', 'Respirar', 'Terminar']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
  await expectNoAxeViolations(page)
  // Nada empieza solo: pasan cinco minutos y sigue igual.
  await page.clock.runFor(5 * 60_000)
  await expect(page.getByText('Tiempo cumplido.')).toBeVisible()
  await expect(timeText(page)).toHaveText('00:00')
  await page.getByRole('button', { name: '+5 min' }).click()
  await expect(timeText(page)).toHaveText('05:00')
  await page.clock.runFor(5 * 60_000 + 1_000)
  await page.getByRole('button', { name: 'Terminar', exact: true }).click()
  await expect(page.getByLabel('¿Qué necesitas hacer hoy?')).toBeVisible()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('presencia:v1') ?? '{}'))
  // El minuto planeado y los «+5 min» cuentan; el rato parado en cero, no.
  expect(Math.round(saved.records[0].focusMs / 60_000)).toBe(6)
})

test('B6 desde el aviso, Respirar lleva a elegir la respiración', async ({ page }) => {
  await open(page)
  await startTimer(page, 1)
  await page.clock.runFor(61_000)
  await page.getByRole('button', { name: 'Respirar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Respirar' })).toBeVisible()
})

test('C1 «Descanso» arranca un descanso de 5 minutos con la misma pantalla', async ({ page }) => {
  await open(page)
  await startTimer(page, 1, 'Escribir')
  await page.clock.runFor(61_000)
  await page.getByRole('button', { name: 'Descanso' }).click()
  await expect(page.getByRole('heading', { name: 'Descanso' })).toBeVisible()
  await expect(timeText(page)).toHaveText('05:00')
  await expect(page.getByRole('button', { name: 'Pausar' })).toBeVisible()
})

test('C2 el descanso se guarda como descanso, no como foco', async ({ page }) => {
  await open(page)
  await startTimer(page, 1, 'Escribir')
  await page.clock.runFor(61_000)
  await page.getByRole('button', { name: 'Descanso' }).click()
  await page.clock.runFor(5 * 60_000 + 1_000)
  await expect(page.getByText('Fin del descanso.')).toBeVisible()
  await page.getByRole('button', { name: 'Terminar', exact: true }).click()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('presencia:v1') ?? '{}'))
  expect(saved.records.map((record: { kind: string }) => record.kind)).toEqual(['focus', 'break'])
})
