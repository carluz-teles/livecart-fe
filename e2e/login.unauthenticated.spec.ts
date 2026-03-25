import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should show sign-in page for unauthenticated users', async ({ page }) => {
    // Bypass bot detection
    await setupClerkTestingToken({ page })

    await page.goto('/sign-in')

    // Verify sign-in page is displayed
    await expect(page).toHaveURL(/.*sign-in.*/)
  })

  test('should redirect to sign-in when accessing protected route', async ({ page }) => {
    // Bypass bot detection
    await setupClerkTestingToken({ page })

    await page.goto('/dashboard')

    // Should redirect to sign-in
    await expect(page).toHaveURL(/.*sign-in.*/)
  })

  test('should show sign-up page', async ({ page }) => {
    // Bypass bot detection
    await setupClerkTestingToken({ page })

    await page.goto('/sign-up')

    // Verify sign-up page is displayed
    await expect(page).toHaveURL(/.*sign-up.*/)
  })
})
