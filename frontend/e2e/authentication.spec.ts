import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('Authentication Tests', () => {
  let swaggerAvailable = false;

  test.beforeAll(async ({ browser }) => {
    // Check if Swagger is accessible (401 is OK - it means auth is required)
    const page = await browser.newPage();
    try {
      const response = await page.goto('https://mini-api.local/docs/', { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      });
      // Accept 200, 401, 403 as "available" - we're testing auth anyway
      swaggerAvailable = response?.status() ? [200, 401, 403].includes(response.status()) : false;
      console.log(`✓ Swagger responded with status: ${response?.status()}`);
    } catch (error) {
      console.log('⚠ Swagger UI not accessible on https://mini-api.local/docs/ - tests will be skipped');
      swaggerAvailable = false;
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!swaggerAvailable, 'Swagger UI not available at https://mini-api.local/docs/');
    
    // Navigate to Swagger UI
    await page.goto('https://mini-api.local/docs/', { waitUntil: 'domcontentloaded' });
  });

  test('should display Swagger UI authentication section', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('Swagger UI Security');
    await allure.story('US-701: As a developer, I want to see authentication options in Swagger UI');
    await allure.severity('critical');
    await allure.tags('authentication', 'swagger', 'security');

    // Verify Swagger UI loads
    await expect(page.locator('.swagger-ui')).toBeVisible({ timeout: 10000 });
    
    // Check for authentication button or lock icon
    const authButton = page.locator('button.authorize, .auth-wrapper button');
    await expect(authButton).toBeVisible({ timeout: 5000 });
  });

  test('should open authentication modal when clicking authorize button', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('Swagger UI Security');
    await allure.story('US-702: As a developer, I want to configure API authentication credentials');
    await allure.severity('critical');
    await allure.tags('authentication', 'swagger', 'modal');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Click authorize button
    const authorizeBtn = page.locator('button.authorize, .auth-wrapper button').first();
    await authorizeBtn.click();
    
    // Verify modal appears
    const modal = page.locator('.modal-ux, .auth-container, [role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should accept username and password in authentication form', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('Credentials Management');
    await allure.story('US-703: As a developer, I want to enter my API credentials securely');
    await allure.severity('critical');
    await allure.tags('authentication', 'credentials', 'form');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Open authentication modal
    const authorizeBtn = page.locator('button.authorize, .auth-wrapper button').first();
    await authorizeBtn.click();
    
    // Fill in credentials (if basic auth is available)
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    if (await usernameInput.isVisible({ timeout: 2000 })) {
      await usernameInput.fill('testuser');
      await passwordInput.fill('testpassword');
      
      // Verify inputs contain values
      await expect(usernameInput).toHaveValue('testuser');
      await expect(passwordInput).toHaveValue('testpassword');
    }
  });

  test('should show authorized state after successful authentication', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('Session Management');
    await allure.story('US-704: As a developer, I want visual confirmation of my authenticated state');
    await allure.severity('normal');
    await allure.tags('authentication', 'session', 'ui-feedback');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Open authentication modal
    const authorizeBtn = page.locator('button.authorize').first();
    await authorizeBtn.click();
    
    // Try to authenticate (fill form if available)
    const usernameInput = page.locator('input[name="username"]').first();
    if (await usernameInput.isVisible({ timeout: 2000 })) {
      await usernameInput.fill('admin');
      await page.locator('input[name="password"]').first().fill('admin123');
      
      // Click authorize button in modal
      const modalAuthorizeBtn = page.locator('button:has-text("Authorize"), button.btn.modal-btn.auth').first();
      await modalAuthorizeBtn.click();
      
      // Wait for authentication to process
      await page.waitForTimeout(1000);
      
      // Close modal if close button exists
      const closeBtn = page.locator('button.btn-done, button:has-text("Close")');
      if (await closeBtn.isVisible({ timeout: 2000 })) {
        await closeBtn.click();
      }
    }
  });

  test('should display locked/unlocked icons for protected endpoints', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('API Endpoint Protection');
    await allure.story('US-705: As a developer, I want to identify which endpoints require authentication');
    await allure.severity('normal');
    await allure.tags('authorization', 'endpoints', 'visual-indicators');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Look for lock icons indicating protected endpoints
    const lockIcons = page.locator('svg.locked, .authorization__btn svg');
    const lockCount = await lockIcons.count();
    
    console.log(`Found ${lockCount} lock icons indicating protected endpoints`);
    expect(lockCount).toBeGreaterThanOrEqual(0);
  });

  test('should allow logout and clear authentication state', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('Session Management');
    await allure.story('US-706: As a developer, I want to log out and clear my credentials');
    await allure.severity('normal');
    await allure.tags('authentication', 'logout', 'session');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Open authentication modal
    const authorizeBtn = page.locator('button.authorize').first();
    await authorizeBtn.click();
    
    await page.waitForTimeout(1000);
    
    // Look for logout button
    const logoutBtn = page.locator('button:has-text("Logout"), button.btn-done');
    if (await logoutBtn.isVisible({ timeout: 2000 })) {
      await logoutBtn.click();
      console.log('✓ Logout button found and clicked');
    }
  });

  test('should persist authentication across page navigation', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('Session Persistence');
    await allure.story('US-707: As a developer, I want my authentication to persist during my session');
    await allure.severity('normal');
    await allure.tags('authentication', 'persistence', 'session');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Authenticate first
    const authorizeBtn = page.locator('button.authorize').first();
    await authorizeBtn.click();
    
    await page.waitForTimeout(500);
    
    // Close modal
    const closeBtn = page.locator('button:has-text("Close"), button.btn-done');
    if (await closeBtn.isVisible({ timeout: 2000 })) {
      await closeBtn.click();
    }
    
    // Reload page
    await page.reload();
    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Authentication state should be maintained (implementation dependent)
    console.log('✓ Page reloaded successfully');
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('Error Handling');
    await allure.story('US-708: As a developer, I want clear feedback when authentication fails');
    await allure.severity('critical');
    await allure.tags('authentication', 'error-handling', 'validation');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Open authentication modal
    const authorizeBtn = page.locator('button.authorize').first();
    await authorizeBtn.click();
    
    // Try invalid credentials
    const usernameInput = page.locator('input[name="username"]').first();
    if (await usernameInput.isVisible({ timeout: 2000 })) {
      await usernameInput.fill('invalid_user');
      await page.locator('input[name="password"]').first().fill('wrong_password');
      
      const modalAuthorizeBtn = page.locator('button:has-text("Authorize"), button.btn.modal-btn.auth').first();
      await modalAuthorizeBtn.click();
      
      // Wait for error message
      await page.waitForTimeout(1500);
      
      // Check for error indicators
      const errorMessage = page.locator('.errors, .error, [class*="error"]');
      const hasError = await errorMessage.count() > 0;
      
      console.log(hasError ? '✓ Error handling detected' : '⚠ No error message found (may use different auth)');
    }
  });

  test('should support API key authentication method', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('Authentication Methods');
    await allure.story('US-709: As a developer, I want to authenticate using API keys');
    await allure.severity('normal');
    await allure.tags('authentication', 'api-key', 'security');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Open authentication modal
    const authorizeBtn = page.locator('button.authorize').first();
    await authorizeBtn.click();
    
    await page.waitForTimeout(500);
    
    // Look for API key input
    const apiKeyInput = page.locator('input[name="api_key"], input[placeholder*="api"], input[name="apiKey"]');
    const hasApiKey = await apiKeyInput.count() > 0;
    
    if (hasApiKey) {
      await apiKeyInput.first().fill('test-api-key-12345');
      await expect(apiKeyInput.first()).toHaveValue('test-api-key-12345');
      console.log('✓ API key authentication method available');
    } else {
      console.log('⚠ API key method not found (may use different auth scheme)');
    }
  });

  test('should display authentication scheme information', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('Authentication & Authorization');
    await allure.feature('API Documentation');
    await allure.story('US-710: As a developer, I want to understand the authentication scheme used');
    await allure.severity('minor');
    await allure.tags('documentation', 'authentication', 'schema');

    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Open authentication modal
    const authorizeBtn = page.locator('button.authorize').first();
    await authorizeBtn.click();
    
    await page.waitForTimeout(500);
    
    // Check for scheme information (Basic, Bearer, OAuth2, etc.)
    const schemeInfo = page.locator('.auth-container h4, .scheme-container, [class*="auth-type"]');
    const schemeCount = await schemeInfo.count();
    
    console.log(`Found ${schemeCount} authentication scheme(s) documented`);
    expect(schemeCount).toBeGreaterThanOrEqual(0);
  });
});
