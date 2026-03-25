import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('should display dashboard after login', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for page to load
    await expect(page).toHaveURL(/.*dashboard.*/)

    // Verify dashboard content is visible
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to lives page', async ({ page }) => {
    await page.goto('/dashboard/lives')

    await expect(page).toHaveURL(/.*lives.*/)
  })

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/dashboard/products')

    await expect(page).toHaveURL(/.*products.*/)
  })

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/dashboard/settings')

    await expect(page).toHaveURL(/.*settings.*/)
  })
})
