import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the application title', async ({ page }) => {
    await allure.epic('User Management');
    await allure.feature('Application Layout');
    await allure.story('US-201: As a user, I want to see the application title');
    await allure.severity('minor');
    await allure.tags('ui', 'layout');
    
    await expect(page.locator('h1')).toContainText('Mini API TS - Frontend');
  });

  test('should display user list', async ({ page }) => {
    await allure.epic('User Management');
    await allure.feature('User List Display');
    await allure.story('US-202: As a user, I want to view all registered users');
    await allure.severity('critical');
    await allure.tags('user-list', 'display');
    
    // Attend que la table soit chargée
    await page.waitForSelector('.user-table', { timeout: 5000 });
    
    // Vérifie que la table contient des lignes
    const rows = page.locator('.user-table tbody tr');
    await expect(rows).not.toHaveCount(0);
  });

  test('should create a new user', async ({ page }) => {
    await allure.epic('User Management');
    await allure.feature('User CRUD Operations');
    await allure.story('US-203: As a user, I want to create new users');
    await allure.severity('critical');
    await allure.tags('crud', 'create');
    
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
    await allure.epic('User Management');
    await allure.feature('User CRUD Operations');
    await allure.story('US-204: As a user, I want to edit existing users');
    await allure.severity('critical');
    await allure.tags('crud', 'update');
    
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
    await allure.epic('User Management');
    await allure.feature('User CRUD Operations');
    await allure.story('US-205: As a user, I want to delete users');
    await allure.severity('critical');
    await allure.tags('crud', 'delete');
    
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
    await allure.epic('User Management');
    await allure.feature('User Experience');
    await allure.story('US-206: As a user, I want to cancel editing operations');
    await allure.severity('normal');
    await allure.tags('ux', 'cancel');
    
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
    await allure.epic('User Management');
    await allure.feature('Input Validation');
    await allure.story('US-207: As a system, I want to prevent empty form submissions');
    await allure.severity('critical');
    await allure.tags('validation', 'required-fields');
    
    // Vérifier que le bouton est désactivé quand le formulaire est vide
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should create 10 users automatically', async ({ page }) => {
    await allure.epic('User Management');
    await allure.feature('Batch Operations');
    await allure.story('US-208: As a user, I want to create multiple users efficiently');
    await allure.severity('normal');
    await allure.tags('batch', 'automation');
    
    const timestamp = Date.now();
    const usersToCreate = 10;
    
    // Attendre que la table soit chargée
    await page.waitForSelector('.user-table');
    
    // Compter les "Auto User" existants avec ce timestamp (devrait être 0)
    const autoUserSelector = `.user-table tbody tr:has-text("Auto User") td:has-text("${timestamp}")`;
    
    // Créer 10 utilisateurs
    for (let i = 1; i <= usersToCreate; i++) {
      await page.fill('input[name="name"]', `Auto User ${i} - ${timestamp}`);
      await page.fill('input[name="email"]', `auto-user-${i}-${timestamp}@test.com`);
      await page.click('button[type="submit"]');
      
      // Attendre le message de succès
      await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
      
      // Attendre que le formulaire soit prêt (champs vides et bouton désactivé)
      await expect(page.locator('input[name="name"]')).toHaveValue('');
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
      
      console.log(`✅ Utilisateur ${i}/${usersToCreate} créé`);
    }
    
    // Vérifier que 10 utilisateurs avec ce timestamp existent
    const autoUsersWithTimestamp = page.locator(`.user-table tbody tr:has-text("- ${timestamp}")`);
    await expect(autoUsersWithTimestamp).toHaveCount(usersToCreate, { timeout: 5000 });
    
    console.log(`✅ ${usersToCreate} utilisateurs créés avec succès!`);
  });

  test('should delete the 10 previously created users', async ({ page }) => {
    await page.waitForSelector('.user-table');
    
    // Rechercher tous les utilisateurs "Auto User"
    const autoUserRows = page.locator('.user-table tbody tr:has-text("Auto User")');
    const autoUserCount = await autoUserRows.count();
    
    console.log(`🔍 Trouvé ${autoUserCount} utilisateurs "Auto User" à supprimer`);
    
    if (autoUserCount === 0) {
      console.log('⚠️ Aucun utilisateur "Auto User" trouvé.');
      return;
    }
    
    // Limiter à 10 suppressions
    const usersToDelete = Math.min(autoUserCount, 10);
    
    // Supprimer les utilisateurs un par un
    for (let i = 0; i < usersToDelete; i++) {
      const remainingAutoUsers = await page.locator('.user-table tbody tr:has-text("Auto User")').count();
      if (remainingAutoUsers === 0) break;
      
      // Obtenir l'email de l'utilisateur qu'on va supprimer pour vérifier sa disparition
      const userToDelete = await page.locator('.user-table tbody tr:has-text("Auto User")').first();
      const emailToDelete = await userToDelete.locator('td').nth(2).textContent();
      
      page.once('dialog', dialog => dialog.accept());
      await page.locator('.user-table tbody tr:has-text("Auto User") .btn-delete').first().click();
      
      // Attendre déterministement que cette ligne spécifique disparaisse
      await expect(page.locator(`.user-table tbody tr:has-text("${emailToDelete}")`)).toHaveCount(0, { timeout: 5000 });
      
      console.log(`🗑️  Utilisateur ${i + 1}/${usersToDelete} supprimé`);
    }
    
    // Vérifier que les utilisateurs ont été supprimés
    const finalAutoUserCount = await page.locator('.user-table tbody tr:has-text("Auto User")').count();
    console.log(`✅ ${usersToDelete} utilisateurs supprimés. Restants: ${finalAutoUserCount}`);
    expect(finalAutoUserCount).toBe(autoUserCount - usersToDelete);
  });
});
