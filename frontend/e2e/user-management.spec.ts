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
    // Remplir le formulaire
    await page.fill('input[name="name"]', 'Test Playwright');
    await page.fill('input[name="email"]', 'playwright@test.com');
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier le message de succès
    await expect(page.locator('.alert.success')).toBeVisible();
    await expect(page.locator('.alert.success')).toContainText('créé avec succès');
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
    
    // Vérifier le message de succès
    await expect(page.locator('.alert.success')).toBeVisible();
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
    
    // Attendre un peu pour le rechargement
    await page.waitForTimeout(1000);
    
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
    // Essayer de soumettre le formulaire vide
    await page.click('button[type="submit"]');
    
    // Le bouton devrait être désactivé ou afficher une erreur
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });
});
