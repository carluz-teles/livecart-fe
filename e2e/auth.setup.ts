import { clerk } from '@clerk/testing/playwright'
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.clerk/user.json')

setup('authenticate and save state', async ({ page }) => {
  // Navigate to the app
  await page.goto('/')

  // Sign in using Clerk helper
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  })

  // Wait for redirect to dashboard after login
  await page.waitForURL('**/dashboard**', { timeout: 10000 })

  // Verify we're authenticated by checking for a dashboard element
  await expect(page.locator('body')).toBeVisible()

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
