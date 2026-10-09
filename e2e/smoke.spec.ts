import { expect, test } from '@playwright/test'
import { expectNoAxeViolations, open } from './helpers'

test('humo: la app carga en la raíz y /app redirige', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await open(page, '/app')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '¿Qué necesitas hacer hoy?' })).toBeVisible()
  await expectNoAxeViolations(page)
  expect(errors).toEqual([])
})
