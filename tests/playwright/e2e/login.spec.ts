import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('[data-testid="username"]', 'admin')
    await page.fill('[data-testid="password"]', 'admin123')
    
    // Click login button
    await page.click('[data-testid="login-button"]')

    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/dashboard/admin')
    await expect(page.locator('h1')).toContainText('Dashboard Admin')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="username"]', 'invalid')
    await page.fill('[data-testid="password"]', 'invalid')
    
    await page.click('[data-testid="login-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Username atau password salah')
  })
})
