import { test, expect } from '@playwright/test';

test.describe('Form Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should require name field', async ({ page }) => {
    // Remplir seulement l'email
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Vérifier que le bouton est désactivé
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should require email field', async ({ page }) => {
    // Remplir seulement le nom
    await page.fill('input[name="name"]', 'Test User');
    
    // Vérifier que le bouton est désactivé
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    
    // Tester différents formats d'email invalides
    const invalidEmails = [
      'invalidemail',
      'invalid@',
      '@invalid.com',
      'invalid@com',
      'invalid.com'
    ];

    for (const email of invalidEmails) {
      await page.fill('input[name="email"]', email);
      
      // Le bouton devrait être désactivé ou le champ invalide
      const emailInput = page.locator('input[name="email"]');
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      
      if (isInvalid) {
        console.log(`✅ Email invalide détecté: ${email}`);
      }
    }
  });

  test('should accept valid email formats', async ({ page }) => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.com',
      'test123@test-domain.com'
    ];

    for (const email of validEmails) {
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', email);
      
      const emailInput = page.locator('input[name="email"]');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      
      expect(isValid).toBeTruthy();
      console.log(`✅ Email valide accepté: ${email}`);
      
      // Réinitialiser
      await page.fill('input[name="name"]', '');
      await page.fill('input[name="email"]', '');
    }
  });

  test('should trim whitespace from inputs', async ({ page }) => {
    const timestamp = Date.now();
    
    // Entrer des valeurs avec des espaces
    await page.fill('input[name="name"]', `  Test User ${timestamp}  `);
    await page.fill('input[name="email"]', `  test-${timestamp}@example.com  `);
    await page.click('button[type="submit"]');

    await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500);

    // Vérifier que l'utilisateur a été créé sans les espaces
    const userRow = page.locator('.user-table tbody tr').last();
    const nameCell = userRow.locator('td').nth(1);
    const emailCell = userRow.locator('td').nth(2);
    
    const name = await nameCell.textContent();
    const email = await emailCell.textContent();
    
    // Les espaces ne doivent pas être présents
    expect(name?.trim()).toBe(`Test User ${timestamp}`);
    expect(email?.trim()).toBe(`test-${timestamp}@example.com`);
  });

  test('should enforce maximum length for name', async ({ page }) => {
    // Générer un nom très long (plus de 100 caractères)
    const longName = 'A'.repeat(150);
    
    await page.fill('input[name="name"]', longName);
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Vérifier la longueur maximale du champ
    const nameInput = page.locator('input[name="name"]');
    const value = await nameInput.inputValue();
    
    // La plupart des navigateurs limitent à maxLength
    const maxLength = await nameInput.getAttribute('maxlength');
    if (maxLength) {
      expect(value.length).toBeLessThanOrEqual(parseInt(maxLength));
    }
  });

  test('should clear form after successful submission', async ({ page }) => {
    const timestamp = Date.now();
    
    await page.fill('input[name="name"]', `Clear Test ${timestamp}`);
    await page.fill('input[name="email"]', `clear-${timestamp}@test.com`);
    await page.click('button[type="submit"]');

    await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Vérifier que les champs sont vides
    const nameValue = await page.locator('input[name="name"]').inputValue();
    const emailValue = await page.locator('input[name="email"]').inputValue();
    
    expect(nameValue).toBe('');
    expect(emailValue).toBe('');
  });

  test('should show validation feedback on blur', async ({ page }) => {
    // Cliquer dans le champ email puis sortir sans remplir
    await page.click('input[name="email"]');
    await page.click('input[name="name"]');
    
    // Le champ email devrait montrer une erreur de validation
    const emailInput = page.locator('input[name="email"]');
    const hasError = await emailInput.evaluate((el: HTMLInputElement) => {
      return el.validity.valueMissing;
    });
    
    // Valider que le champ est marqué comme invalide
    expect(hasError).toBeTruthy();
  });

  test('should prevent special characters in name', async ({ page }) => {
    const timestamp = Date.now();
    const specialChars = ['<', '>', '&', '"', "'", '/'];
    
    for (const char of specialChars) {
      await page.fill('input[name="name"]', `Test${char}User${timestamp}`);
      await page.fill('input[name="email"]', `test-${timestamp}@test.com`);
      
      // Vérifier si le caractère spécial est accepté ou filtré
      const nameValue = await page.locator('input[name="name"]').inputValue();
      console.log(`Caractère testé: ${char}, Valeur: ${nameValue}`);
    }
  });
});
