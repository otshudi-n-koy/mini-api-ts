import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the application title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Mini API TS - Frontend');
  });

  test('should display user list', async ({ page }) => {
    // Attend que la table soit chargée
    await page.waitForSelector('.user-table', { timeout: 5000 });
    
    // Vérifie que la table contient des lignes
    const rows = page.locator('.user-table tbody tr');
    await expect(rows).not.toHaveCount(0);
  });

  test('should create a new user', async ({ page }) => {
    // Utiliser un timestamp pour éviter les doublons
    const timestamp = Date.now();
    
    // Remplir le formulaire
    await page.fill('input[name="name"]', `Test Playwright ${timestamp}`);
    await page.fill('input[name="email"]', `playwright-${timestamp}@test.com`);
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier le message de succès avec timeout plus long
    await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.alert.success')).toContainText('créé avec succès');
    
    // Attendre que la liste se mette à jour
    await page.waitForTimeout(1000);
  });

  test('should edit an existing user', async ({ page }) => {
    // Attendre que la table soit chargée
    await page.waitForSelector('.user-table');
    
    // Cliquer sur le premier bouton "Modifier"
    await page.locator('.btn-edit').first().click();
    
    // Vérifier que le formulaire passe en mode édition
    await expect(page.locator('h3')).toContainText('Modifier un Utilisateur');
    
    // Modifier le nom
    await page.fill('input[name="name"]', 'User Updated by Playwright');
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier le message de succès avec timeout plus long
    await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.alert.success')).toContainText('modifié avec succès');
  });

  test('should delete a user', async ({ page }) => {
    // Attendre que la table soit chargée
    await page.waitForSelector('.user-table');
    
    // Récupérer le nombre initial d'utilisateurs
    const initialCount = await page.locator('.user-table tbody tr').count();
    
    // Cliquer sur le dernier bouton "Supprimer"
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.btn-delete').last().click();
    
    // Attendre que la liste se mette à jour (pas de message de succès pour delete)
    await page.waitForTimeout(2000);
    
    // Vérifier que le nombre d'utilisateurs a diminué
    const newCount = await page.locator('.user-table tbody tr').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('should cancel edit mode', async ({ page }) => {
    await page.waitForSelector('.user-table');
    
    // Cliquer sur Modifier
    await page.locator('.btn-edit').first().click();
    await expect(page.locator('h3')).toContainText('Modifier un Utilisateur');
    
    // Cliquer sur Annuler
    await page.click('.btn-cancel');
    
    // Vérifier retour au mode ajout
    await expect(page.locator('h3')).toContainText('Ajouter un Utilisateur');
  });

  test('should display error for empty form', async ({ page }) => {
    // Vérifier que le bouton est désactivé quand le formulaire est vide
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should create 10 users automatically', async ({ page }) => {
    const timestamp = Date.now();
    const usersToCreate = 10;
    
    // Compter les utilisateurs au début
    await page.waitForSelector('.user-table');
    const initialCount = await page.locator('.user-table tbody tr').count();
    
    // Créer 10 utilisateurs
    for (let i = 1; i <= usersToCreate; i++) {
      // Remplir le formulaire
      await page.fill('input[name="name"]', `Auto User ${i} - ${timestamp}`);
      await page.fill('input[name="email"]', `auto-user-${i}-${timestamp}@test.com`);
      
      // Soumettre
      await page.click('button[type="submit"]');
      
      // Attendre le message de succès
      await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.alert.success')).toContainText('créé avec succès');
      
      // Attendre que la liste se mette à jour
      await page.waitForTimeout(1000);
      
      console.log(`✅ Utilisateur ${i}/${usersToCreate} créé`);
    }
    
    // Vérifier que 10 utilisateurs ont été ajoutés
    const finalCount = await page.locator('.user-table tbody tr').count();
    expect(finalCount).toBe(initialCount + usersToCreate);
    
    console.log(`✅ ${usersToCreate} utilisateurs créés avec succès!`);
  });
});
