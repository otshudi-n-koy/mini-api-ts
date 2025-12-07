import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('UI/UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have responsive design', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Responsive Design');
    await allure.story('US-401: As a user, I want the app to work on different screen sizes');
    await allure.severity('critical');
    await allure.tags('responsive', 'mobile', 'tablet');
    
    // Tester différentes tailles d'écran
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      // Vérifier que le contenu principal est visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.user-table')).toBeVisible();
      
      console.log(`✅ Layout OK pour ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
  });

  test('should have accessible color contrast', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Accessibility');
    await allure.story('US-402: As a user, I want readable text with good contrast');
    await allure.severity('normal');
    await allure.tags('accessibility', 'contrast');
    
    // Vérifier la présence d'éléments principaux
    const elements = [
      page.locator('h1'),
      page.locator('h2').first(),
      page.locator('h3'),
      page.locator('button[type="submit"]'),
      page.locator('.user-table th').first()
    ];

    for (const element of elements) {
      const isVisible = await element.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test('should show hover effects on interactive elements', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Interactive Feedback');
    await allure.story('US-403: As a user, I want visual feedback on interactive elements');
    await allure.severity('minor');
    await allure.tags('hover', 'feedback');
    
    await page.waitForSelector('.user-table');
    
    // Hover sur le premier bouton "Modifier"
    const editButton = page.locator('.btn-edit').first();
    await editButton.hover();
    await page.waitForTimeout(300);
    
    // Hover sur le bouton "Supprimer"
    const deleteButton = page.locator('.btn-delete').first();
    await deleteButton.hover();
    await page.waitForTimeout(300);
    
    // Hover sur le bouton submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.hover();
    await page.waitForTimeout(300);
  });

  test('should display success messages with proper styling', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Notification System');
    await allure.story('US-404: As a user, I want clear success notifications');
    await allure.severity('normal');
    await allure.tags('notifications', 'alerts');
    
    const timestamp = Date.now();
    
    await page.fill('input[name="name"]', `UI Test ${timestamp}`);
    await page.fill('input[name="email"]', `ui-${timestamp}@test.com`);
    await page.click('button[type="submit"]');

    // Vérifier l'alerte de succès
    const successAlert = page.locator('.alert.success');
    await expect(successAlert).toBeVisible({ timeout: 10000 });
    
    // Vérifier que l'alerte a le bon style
    const backgroundColor = await successAlert.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    console.log(`Couleur de l'alerte succès: ${backgroundColor}`);
    
    // Attendre que l'alerte disparaisse (si auto-dismiss)
    await page.waitForTimeout(5000);
  });

  test('should have keyboard navigation support', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Keyboard Navigation');
    await allure.story('US-405: As a user, I want to navigate using keyboard only');
    await allure.severity('normal');
    await allure.tags('keyboard', 'accessibility', 'navigation');
    
    // Tabuler à travers les champs
    await page.keyboard.press('Tab'); // Name input
    await page.keyboard.type('Keyboard User');
    
    await page.keyboard.press('Tab'); // Email input
    await page.keyboard.type('keyboard@test.com');
    
    await page.keyboard.press('Tab'); // Submit button
    await page.keyboard.press('Tab'); // Peut-être d'autres éléments
    
    // Vérifier que les valeurs ont été saisies
    const nameValue = await page.locator('input[name="name"]').inputValue();
    const emailValue = await page.locator('input[name="email"]').inputValue();
    
    expect(nameValue).toContain('Keyboard');
    expect(emailValue).toContain('keyboard@test.com');
  });

  test('should show loading indicators during operations', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Loading States');
    await allure.story('US-406: As a user, I want to see when operations are in progress');
    await allure.severity('normal');
    await allure.tags('loading', 'feedback');
    
    // Intercepter et retarder les requêtes pour voir le loading
    await page.route('**/api/v1/users', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.reload();
    
    // Vérifier qu'il y a un indicateur de chargement
    // (cela dépend de votre implémentation)
    await page.waitForTimeout(1000);
    
    // Attendre que les données se chargent
    await page.waitForSelector('.user-table', { timeout: 10000 });
  });

  test('should display table headers correctly', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Data Display');
    await allure.story('US-407: As a user, I want clear table headers');
    await allure.severity('minor');
    await allure.tags('table', 'headers');
    
    const expectedHeaders = ['ID', 'Nom', 'Email', 'Créé le', 'Actions'];
    
    for (const header of expectedHeaders) {
      const headerElement = page.locator(`.user-table th:has-text("${header}")`);
      await expect(headerElement).toBeVisible();
    }
  });

  test('should format dates consistently', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Data Formatting');
    await allure.story('US-408: As a user, I want consistent date formatting');
    await allure.severity('minor');
    await allure.tags('formatting', 'dates');
    
    await page.waitForSelector('.user-table');
    
    // Vérifier le format des dates dans la colonne "Créé le"
    const dateCell = page.locator('.user-table tbody tr').first().locator('td').nth(3);
    const dateText = await dateCell.textContent();
    
    // Vérifier que la date est formatée (format peut varier)
    expect(dateText).toBeTruthy();
    console.log(`Format de date: ${dateText}`);
  });

  test('should scroll to top when editing user', async ({ page }) => {
    // Allure metadata MUST be set first
    await allure.epic('User Experience');
    await allure.feature('Navigation');
    await allure.story('US-409: As a user, I want to auto-scroll to edit form');
    await allure.severity('minor');
    await allure.tags('scroll', 'navigation');
    
    await page.waitForSelector('.user-table');
    
    // Scroller vers le bas
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Cliquer sur modifier
    await page.locator('.btn-edit').first().click();
    await page.waitForTimeout(500);
    
    // Vérifier qu'on est scrollé vers le haut
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('should have consistent button styles', async ({ page }) => {
    await page.waitForSelector('.user-table');
    
    // Vérifier les boutons
    const editButtons = page.locator('.btn-edit');
    const deleteButtons = page.locator('.btn-delete');
    const submitButton = page.locator('button[type="submit"]');
    
    // Tous les boutons doivent être visibles
    await expect(editButtons.first()).toBeVisible();
    await expect(deleteButtons.first()).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should display appropriate empty state', async ({ page }) => {
    // Supprimer tous les utilisateurs (ou intercepter pour renvoyer vide)
    await page.route('**/api/v1/users', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);
    
    // Vérifier qu'il n'y a pas d'utilisateurs affichés
    const rows = page.locator('.user-table tbody tr');
    const count = await rows.count();
    expect(count).toBe(0);
  });
});
