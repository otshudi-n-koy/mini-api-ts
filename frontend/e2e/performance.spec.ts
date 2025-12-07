import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load page within acceptable time', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Performance' },
      { type: 'feature', description: 'Page Load Performance' },
      { type: 'story', description: 'US-501: As a user, I want fast page load times' },
      { type: 'severity', description: 'critical' },
      { type: 'tag', description: 'performance' },
      { type: 'tag', description: 'load-time' }
    );
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    
    // Vérifier que le chargement prend moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load user list quickly', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Performance' },
      { type: 'feature', description: 'Data Loading Performance' },
      { type: 'story', description: 'US-502: As a user, I want quick data loading' },
      { type: 'severity', description: 'critical' },
      { type: 'tag', description: 'performance' },
      { type: 'tag', description: 'data-load' }
    );
    const startTime = Date.now();
    
    await page.waitForSelector('.user-table tbody tr', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ User list load time: ${loadTime}ms`);
    
    // Vérifier que la liste se charge en moins de 2 secondes
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle large dataset efficiently', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Performance' },
      { type: 'feature', description: 'Scalability' },
      { type: 'story', description: 'US-503: As a system, I want to handle large datasets efficiently' },
      { type: 'severity', description: 'normal' },
      { type: 'tag', description: 'performance' },
      { type: 'tag', description: 'scalability' },
      { type: 'tag', description: 'batch' }
    );
    // Créer plusieurs utilisateurs rapidement
    const usersToCreate = 20;
    const timestamp = Date.now();
    
    const startTime = Date.now();
    
    for (let i = 0; i < usersToCreate; i++) {
      await page.fill('input[name="name"]', `Performance User ${timestamp}-${i}`);
      await page.fill('input[name="email"]', `perf-${timestamp}-${i}@test.com`);
      await page.click('button[type="submit"]');
      
      // Attendre confirmation mais pas trop longtemps
      await page.waitForTimeout(200);
      
      if (i % 5 === 0) {
        console.log(`Created ${i}/${usersToCreate} users...`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️ Created ${usersToCreate} users in ${totalTime}ms`);
    console.log(`⏱️ Average: ${(totalTime / usersToCreate).toFixed(2)}ms per user`);
    
    // Vérifier le nombre d'utilisateurs créés
    const rows = page.locator('.user-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(usersToCreate);
  });

  test('should respond to user input quickly', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Performance' },
      { type: 'feature', description: 'Input Responsiveness' },
      { type: 'story', description: 'US-504: As a user, I want immediate input feedback' },
      { type: 'severity', description: 'normal' },
      { type: 'tag', description: 'performance' },
      { type: 'tag', description: 'responsiveness' }
    );
    const nameInput = page.locator('input[name="name"]');
    
    const startTime = Date.now();
    await nameInput.fill('Quick Response Test');
    const responseTime = Date.now() - startTime;
    
    console.log(`⏱️ Input response time: ${responseTime}ms`);
    
    // Vérifier que l'input répond quasi-instantanément
    expect(responseTime).toBeLessThan(100);
  });

  test('should handle rapid form submissions', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Performance' },
      { type: 'feature', description: 'Concurrent Operations' },
      { type: 'story', description: 'US-505: As a system, I want to handle rapid submissions' },
      { type: 'severity', description: 'normal' },
      { type: 'tag', description: 'performance' },
      { type: 'tag', description: 'concurrent' },
      { type: 'tag', description: 'stress' }
    );
    const timestamp = Date.now();
    const submissionCount = 5;
    const startTime = Date.now();
    
    for (let i = 0; i < submissionCount; i++) {
      await page.fill('input[name="name"]', `Rapid User ${timestamp}-${i}`);
      await page.fill('input[name="email"]', `rapid-${timestamp}-${i}@test.com`);
      await page.click('button[type="submit"]');
      
      // Petit délai pour éviter les collisions
      await page.waitForTimeout(300);
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️ ${submissionCount} rapid submissions in ${totalTime}ms`);
    
    // Vérifier que tous les utilisateurs sont créés
    await page.waitForTimeout(1000);
    const rows = page.locator('.user-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(submissionCount);
  });

  test('should efficiently update user list after operations', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Performance' },
      { type: 'feature', description: 'UI Update Performance' },
      { type: 'story', description: 'US-506: As a user, I want fast UI updates after operations' },
      { type: 'severity', description: 'normal' },
      { type: 'tag', description: 'performance' },
      { type: 'tag', description: 'ui-update' }
    );
    const timestamp = Date.now();
    
    // Créer un utilisateur
    await page.fill('input[name="name"]', `Update Test ${timestamp}`);
    await page.fill('input[name="email"]', `update-${timestamp}@test.com`);
    
    const startTime = Date.now();
    await page.click('button[type="submit"]');
    
    // Attendre que l'utilisateur apparaisse dans la liste
    await page.waitForSelector(`.user-table tbody tr:has-text("Update Test ${timestamp}")`, { timeout: 5000 });
    
    const updateTime = Date.now() - startTime;
    console.log(`⏱️ List update time: ${updateTime}ms`);
    
    // Vérifier que la liste se met à jour rapidement
    expect(updateTime).toBeLessThan(2000);
  });

  test('should handle delete operations efficiently', async ({ page }) => {
    await page.waitForSelector('.user-table tbody tr', { timeout: 5000 });
    
    const initialCount = await page.locator('.user-table tbody tr').count();
    
    const startTime = Date.now();
    
    // Supprimer le premier utilisateur
    page.once('dialog', dialog => dialog.accept());
    await page.locator('.btn-delete').first().click();
    
    // Attendre que la ligne disparaisse
    await page.waitForFunction(
      (expected) => document.querySelectorAll('.user-table tbody tr').length < expected,
      initialCount,
      { timeout: 5000 }
    );
    
    const deleteTime = Date.now() - startTime;
    console.log(`⏱️ Delete operation time: ${deleteTime}ms`);
    
    expect(deleteTime).toBeLessThan(2000);
  });

  test('should handle edit operations efficiently', async ({ page }) => {
    await page.waitForSelector('.user-table tbody tr', { timeout: 5000 });
    
    const startTime = Date.now();
    
    // Cliquer sur modifier
    await page.locator('.btn-edit').first().click();
    
    // Attendre que le formulaire soit rempli
    await page.waitForFunction(
      () => (document.querySelector('input[name="name"]') as HTMLInputElement)?.value !== '',
      { timeout: 5000 }
    );
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Edit form load time: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(1000);
  });

  test('should maintain performance with concurrent operations', async ({ page }) => {
    const timestamp = Date.now();
    
    // Lancer plusieurs opérations
    const startTime = Date.now();
    
    // Créer un utilisateur
    await page.fill('input[name="name"]', `Concurrent ${timestamp}`);
    await page.fill('input[name="email"]', `concurrent-${timestamp}@test.com`);
    await page.click('button[type="submit"]');
    
    // Attendre brièvement puis modifier un utilisateur existant
    await page.waitForTimeout(500);
    await page.locator('.btn-edit').first().click();
    await page.waitForTimeout(500);
    await page.locator('button[type="button"]').click(); // Cancel
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️ Concurrent operations time: ${totalTime}ms`);
    
    expect(totalTime).toBeLessThan(5000);
  });

  test('should measure API response times', async ({ page }) => {
    const apiMetrics: { method: string; url: string; duration: number }[] = [];
    
    // Intercepter les requêtes pour mesurer leurs temps
    await page.route('**/api/v1/**', async (route) => {
      const startTime = Date.now();
      const request = route.request();
      
      await route.continue();
      
      const duration = Date.now() - startTime;
      apiMetrics.push({
        method: request.method(),
        url: request.url(),
        duration
      });
    });
    
    // Effectuer des opérations
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `API Metrics ${timestamp}`);
    await page.fill('input[name="email"]', `api-${timestamp}@test.com`);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Afficher les métriques
    console.log('\n📊 API Performance Metrics:');
    apiMetrics.forEach(metric => {
      console.log(`${metric.method} ${metric.url.split('/').pop()} - ${metric.duration}ms`);
    });
    
    // Vérifier qu'aucune requête ne prend plus de 2 secondes
    const slowRequests = apiMetrics.filter(m => m.duration > 2000);
    expect(slowRequests.length).toBe(0);
  });
});
