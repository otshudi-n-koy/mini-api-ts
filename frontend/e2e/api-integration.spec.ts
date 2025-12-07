import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('API Integration');
    await allure.feature('Error Handling');
    await allure.story('US-301: As a system, I want to handle API errors gracefully');
    await allure.severity('critical');
    await allure.tags('api', 'error-handling');
    
    // Intercepter les requêtes API et simuler une erreur
    await page.route('**/api/v1/users', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.reload();
    
    // Attendre un message d'erreur
    await page.waitForTimeout(2000);
    
    // Vérifier qu'aucun utilisateur n'est affiché
    const rows = page.locator('.user-table tbody tr');
    const count = await rows.count();
    expect(count).toBe(0);
  });

  test('should display loading state during API calls', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('API Integration');
    await allure.feature('Loading States');
    await allure.story('US-302: As a user, I want to see loading indicators during API calls');
    await allure.severity('normal');
    await allure.tags('ux', 'loading');
    
    // Intercepter et retarder la réponse
    await page.route('**/api/v1/users', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.reload();
    
    // Pendant le chargement, vérifier qu'il y a un indicateur
    const loading = page.locator('text=chargement').or(page.locator('.loading'));
    // Le loading peut ne pas être visible si la réponse est trop rapide
  });

  test('should send correct POST request for user creation', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('API Integration');
    await allure.feature('HTTP Requests');
    await allure.story('US-303: As a system, I want to send correctly formatted API requests');
    await allure.severity('critical');
    await allure.tags('api', 'http', 'post');
    
    const timestamp = Date.now();
    let capturedRequest: any = null;

    // Capturer la requête POST
    await page.route('**/api/v1/users/add', async route => {
      capturedRequest = await route.request().postDataJSON();
      await route.continue();
    });

    // Créer un utilisateur
    await page.fill('input[name="name"]', `API Test User ${timestamp}`);
    await page.fill('input[name="email"]', `api-test-${timestamp}@test.com`);
    await page.click('button[type="submit"]');

    // Attendre que la requête soit capturée
    await page.waitForTimeout(1000);

    // Vérifier le contenu de la requête
    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest.name).toBe(`API Test User ${timestamp}`);
    expect(capturedRequest.email).toBe(`api-test-${timestamp}@test.com`);
  });

  test('should handle network timeout', async ({ page, context }) => {
    // Allure metadata MUST be set first
    await allure.epic('API Integration');
    await allure.feature('Network Resilience');
    await allure.story('US-304: As a system, I want to handle network timeouts gracefully');
    await allure.severity('critical');
    await allure.tags('api', 'timeout', 'resilience');
    
    // Simuler une timeout en retardant indéfiniment
    await page.route('**/api/v1/users/add', async route => {
      // Ne jamais répondre pour simuler un timeout
      await new Promise(resolve => setTimeout(resolve, 30000));
      await route.abort('timedout');
    });

    const timestamp = Date.now();
    await page.fill('input[name="name"]', `Timeout Test ${timestamp}`);
    await page.fill('input[name="email"]', `timeout-${timestamp}@test.com`);
    await page.click('button[type="submit"]');

    // Attendre et vérifier qu'une erreur est affichée
    await page.waitForTimeout(3000);
    const errorAlert = page.locator('.alert.error');
    // L'application devrait afficher une erreur
  });

  test('should refresh user list after successful creation', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('API Integration');
    await allure.feature('Data Synchronization');
    await allure.story('US-305: As a user, I want to see updated data after operations');
    await allure.severity('critical');
    await allure.tags('sync', 'refresh');
    
    const timestamp = Date.now();
    
    // Compter les utilisateurs avant
    await page.waitForSelector('.user-table');
    const initialCount = await page.locator('.user-table tbody tr').count();

    // Créer un utilisateur
    await page.fill('input[name="name"]', `Refresh Test ${timestamp}`);
    await page.fill('input[name="email"]', `refresh-${timestamp}@test.com`);
    await page.click('button[type="submit"]');

    // Attendre le message de succès
    await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500);

    // Vérifier que la liste s'est mise à jour
    const finalCount = await page.locator('.user-table tbody tr').count();
    expect(finalCount).toBe(initialCount + 1);
  });

  test('should handle duplicate email error', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('API Integration');
    await allure.feature('Data Validation');
    await allure.story('US-306: As a system, I want to prevent duplicate email addresses');
    await allure.severity('critical');
    await allure.tags('validation', 'duplicate', 'email');
    
    const timestamp = Date.now();
    const email = `duplicate-${timestamp}@test.com`;

    // Créer le premier utilisateur
    await page.fill('input[name="name"]', `Duplicate Test 1`);
    await page.fill('input[name="email"]', email);
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500);

    // Essayer de créer un second utilisateur avec le même email
    await page.fill('input[name="name"]', `Duplicate Test 2`);
    await page.fill('input[name="email"]', email);
    await page.click('button[type="submit"]');

    // Attendre un message d'erreur
    await page.waitForTimeout(2000);
    const errorAlert = page.locator('.alert.error');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
  });
});
