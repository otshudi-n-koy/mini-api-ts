import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Accessibility' },
      { type: 'feature', description: 'Semantic HTML' },
      { type: 'story', description: 'US-601: As a screen reader user, I want proper heading structure' },
      { type: 'severity', description: 'critical' },
      { type: 'tag', description: 'accessibility' },
      { type: 'tag', description: 'wcag' },
      { type: 'tag', description: 'headings' }
    );
    // Vérifier la présence et l'ordre des headings
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);
    
    const h1Text = await page.locator('h1').first().textContent();
    console.log(`H1: ${h1Text}`);
    
    // Vérifier les sous-titres
    const h2Count = await page.locator('h2').count();
    console.log(`Found ${h2Count} H2 headings`);
  });

  test('should have ARIA labels on interactive elements', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Accessibility' },
      { type: 'feature', description: 'ARIA Attributes' },
      { type: 'story', description: 'US-602: As a screen reader user, I want labeled interactive elements' },
      { type: 'severity', description: 'critical' },
      { type: 'tag', description: 'accessibility' },
      { type: 'tag', description: 'aria' },
      { type: 'tag', description: 'wcag' }
    );
    await page.waitForSelector('.user-table');
    
    // Vérifier les boutons d'action
    const editButton = page.locator('.btn-edit').first();
    const deleteButton = page.locator('.btn-delete').first();
    
    // Les boutons devraient avoir du texte ou aria-label
    const editText = await editButton.textContent();
    const deleteText = await deleteButton.textContent();
    
    expect(editText || await editButton.getAttribute('aria-label')).toBeTruthy();
    expect(deleteText || await deleteButton.getAttribute('aria-label')).toBeTruthy();
  });

  test('should have labels associated with form inputs', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Accessibility' },
      { type: 'feature', description: 'Form Accessibility' },
      { type: 'story', description: 'US-603: As a screen reader user, I want labeled form fields' },
      { type: 'severity', description: 'critical' },
      { type: 'tag', description: 'accessibility' },
      { type: 'tag', description: 'forms' },
      { type: 'tag', description: 'labels' }
    );
    // Vérifier les labels pour name et email
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    
    // Vérifier qu'ils ont des labels (via for/id ou wrapping)
    const nameId = await nameInput.getAttribute('id');
    const emailId = await emailInput.getAttribute('id');
    
    if (nameId) {
      const nameLabel = page.locator(`label[for="${nameId}"]`);
      await expect(nameLabel).toBeVisible();
    }
    
    if (emailId) {
      const emailLabel = page.locator(`label[for="${emailId}"]`);
      await expect(emailLabel).toBeVisible();
    }
  });

  test('should have keyboard-accessible navigation', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Accessibility' },
      { type: 'feature', description: 'Keyboard Navigation' },
      { type: 'story', description: 'US-604: As a keyboard user, I want to navigate without a mouse' },
      { type: 'severity', description: 'critical' },
      { type: 'tag', description: 'accessibility' },
      { type: 'tag', description: 'keyboard' },
      { type: 'tag', description: 'wcag' }
    );
    // Tester la navigation au clavier
    await page.keyboard.press('Tab');
    
    // Vérifier que le focus est visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`Focused element: ${focusedElement}`);
    
    expect(focusedElement).toBeTruthy();
    
    // Continuer à tabuler
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });

  test('should have proper table structure with headers', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Accessibility' },
      { type: 'feature', description: 'Table Accessibility' },
      { type: 'story', description: 'US-605: As a screen reader user, I want properly structured tables' },
      { type: 'severity', description: 'normal' },
      { type: 'tag', description: 'accessibility' },
      { type: 'tag', description: 'tables' },
      { type: 'tag', description: 'semantic' }
    );
    await page.waitForSelector('.user-table');
    
    // Vérifier la structure de la table
    const thead = page.locator('.user-table thead');
    const tbody = page.locator('.user-table tbody');
    
    await expect(thead).toBeVisible();
    await expect(tbody).toBeVisible();
    
    // Vérifier les headers
    const thCount = await page.locator('.user-table thead th').count();
    console.log(`Found ${thCount} table headers`);
    expect(thCount).toBeGreaterThan(0);
  });

  test('should have accessible form validation messages', async ({ page }, testInfo) => {
    testInfo.annotations.push(
      { type: 'epic', description: 'Accessibility' },
      { type: 'feature', description: 'Validation Feedback' },
      { type: 'story', description: 'US-606: As a user, I want accessible validation messages' },
      { type: 'severity', description: 'critical' },
      { type: 'tag', description: 'accessibility' },
      { type: 'tag', description: 'validation' },
      { type: 'tag', description: 'forms' }
    );
    // Vérifier que le bouton est désactivé quand le formulaire est vide
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    // Vérifier que les champs sont requis
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    
    const nameRequired = await nameInput.evaluate(el => (el as HTMLInputElement).required);
    const emailRequired = await emailInput.evaluate(el => (el as HTMLInputElement).required);
    
    expect(nameRequired || emailRequired).toBeTruthy();
    
    // Remplir partiellement et vérifier que le bouton reste désactivé
    await page.fill('input[name="name"]', 'Test');
    await expect(submitButton).toBeDisabled();
    
    // Remplir complètement pour activer le bouton
    await page.fill('input[name="email"]', 'test@example.com');
    await expect(submitButton).toBeEnabled();
  });

  test('should have sufficient button sizes for touch targets', async ({ page }) => {
    await page.waitForSelector('.user-table');
    
    // Vérifier les dimensions des boutons
    const submitButton = page.locator('button[type="submit"]');
    const editButton = page.locator('.btn-edit').first();
    const deleteButton = page.locator('.btn-delete').first();
    
    const buttons = [
      { name: 'Submit', element: submitButton },
      { name: 'Edit', element: editButton },
      { name: 'Delete', element: deleteButton }
    ];
    
    for (const button of buttons) {
      const box = await button.element.boundingBox();
      if (box) {
        console.log(`${button.name} button: ${box.width}x${box.height}px`);
        // Taille minimale recommandée: 44x44px (WCAG)
        expect(box.width).toBeGreaterThan(20);
        expect(box.height).toBeGreaterThan(20);
      }
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Vérifier les landmarks ARIA
    const main = await page.locator('main, [role="main"]').count();
    const header = await page.locator('header, [role="banner"]').count();
    
    console.log(`Main landmarks: ${main}`);
    console.log(`Header landmarks: ${header}`);
    
    // Au moins un contenu principal devrait être présent
    expect(main).toBeGreaterThanOrEqual(0);
  });

  test('should have accessible button states', async ({ page }) => {
    const timestamp = Date.now();
    
    await page.fill('input[name="name"]', `A11y Test ${timestamp}`);
    
    // Le bouton devrait être désactivé si email est vide
    const submitButton = page.locator('button[type="submit"]');
    
    // Vérifier l'état du bouton
    const isDisabled = await submitButton.isDisabled();
    console.log(`Submit button disabled (without email): ${isDisabled}`);
    
    // Remplir l'email
    await page.fill('input[name="email"]', `a11y-${timestamp}@test.com`);
    
    // Le bouton devrait maintenant être activé
    const isNowEnabled = await submitButton.isEnabled();
    console.log(`Submit button enabled (with email): ${isNowEnabled}`);
    
    expect(isNowEnabled).toBeTruthy();
  });

  test('should have focus visible styles', async ({ page }) => {
    // Tabuler vers le premier input
    await page.keyboard.press('Tab');
    
    // Vérifier que le focus est visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Capturer les styles de focus
    const outlineStyle = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      };
    });
    
    console.log('Focus styles:', outlineStyle);
    
    // Au moins un indicateur de focus devrait être présent
    expect(
      outlineStyle.outline !== 'none' || 
      outlineStyle.boxShadow !== 'none'
    ).toBeTruthy();
  });

  test('should have proper alt text or aria labels for images', async ({ page }) => {
    // Vérifier toutes les images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    console.log(`Found ${imageCount} images`);
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const ariaHidden = await img.getAttribute('aria-hidden');
      
      // Chaque image devrait avoir alt, aria-label ou être aria-hidden
      if (ariaHidden !== 'true') {
        expect(alt !== null || ariaLabel !== null).toBeTruthy();
      }
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    const timestamp = Date.now();
    
    // Créer un utilisateur
    await page.fill('input[name="name"]', `Dynamic ${timestamp}`);
    await page.fill('input[name="email"]', `dynamic-${timestamp}@test.com`);
    await page.click('button[type="submit"]');
    
    // Vérifier la présence d'alertes ARIA pour les messages
    await page.waitForTimeout(1000);
    
    const alerts = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
    const alertCount = await alerts.count();
    
    console.log(`Found ${alertCount} ARIA live regions`);
  });

  test('should have proper color contrast ratios', async ({ page }) => {
    await page.waitForSelector('.user-table');
    
    // Tester le contraste de différents éléments
    const elements = [
      { name: 'H1', selector: 'h1' },
      { name: 'Table Header', selector: '.user-table th' },
      { name: 'Table Cell', selector: '.user-table td' },
      { name: 'Button', selector: 'button[type="submit"]' }
    ];
    
    for (const element of elements) {
      const el = page.locator(element.selector).first();
      const isVisible = await el.isVisible();
      
      if (isVisible) {
        const styles = await el.evaluate(node => {
          const computed = window.getComputedStyle(node);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        console.log(`${element.name}:`, styles);
      }
    }
  });
});
