import { expect, test } from '@playwright/test'
import { expectNoAxeViolations, open } from './helpers'

test('A1 Hoy empieza casi vacía', async ({ page }) => {
  await open(page)
  await expect(page.getByRole('img', { name: 'Orbe' })).toBeVisible()
  await expect(page.getByLabel('¿Qué necesitas hacer hoy?')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Temporizador' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Respirar' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Días' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ajustes' })).toBeVisible()
  // Y nada más: enviar, Temporizador y Respirar como botones; Días y Ajustes como enlaces; un solo campo.
  await expect(page.getByRole('button')).toHaveCount(3)
  await expect(page.getByRole('link')).toHaveCount(2)
  await expect(page.getByRole('textbox')).toHaveCount(1)
  await expectNoAxeViolations(page)
})
