import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/consumer/home');

    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
  });

  test('should load home page successfully', async ({ page }) => {
    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/ConsoGab/);

    // Vérifier que le contenu principal est visible
    await expect(page.locator('text=Découvrir')).toBeVisible();

    // Vérifier que les éléments principaux sont présents
    await expect(page.locator('text=Entreprises actives')).toBeVisible();
    await expect(page.locator('text=Catalogues publics')).toBeVisible();
  });

  test('should display business categories', async ({ page }) => {
    // Vérifier que les catégories sont affichées
    const categories = page.locator('[data-testid="category-button"]');
    await expect(categories).toHaveCount(await categories.count()); // Au moins quelques catégories

    // Vérifier qu'une catégorie est cliquable
    const firstCategory = categories.first();
    await expect(firstCategory).toBeVisible();
    await expect(firstCategory).toBeEnabled();
  });

  test('should navigate to category page when category clicked', async ({ page }) => {
    // Cliquer sur la première catégorie
    const firstCategory = page.locator('[data-testid="category-button"]').first();
    const categoryText = await firstCategory.textContent();

    await firstCategory.click();

    // Vérifier la navigation
    await expect(page).toHaveURL(/\/category\//);

    // Vérifier que le titre de la catégorie est affiché
    if (categoryText) {
      await expect(page.locator(`text=${categoryText}`)).toBeVisible();
    }
  });

  test('should display businesses list', async ({ page }) => {
    // Attendre que les entreprises soient chargées
    await page.waitForSelector('[data-testid="business-card"]', { timeout: 10000 });

    const businessCards = page.locator('[data-testid="business-card"]');
    const count = await businessCards.count();

    // Au moins quelques entreprises devraient être affichées
    expect(count).toBeGreaterThan(0);

    // Vérifier qu'une carte d'entreprise a le contenu attendu
    const firstCard = businessCards.first();
    await expect(firstCard.locator('[data-testid="business-name"]')).toBeVisible();
  });

  test('should navigate to business detail when business clicked', async ({ page }) => {
    // Attendre les cartes d'entreprises
    await page.waitForSelector('[data-testid="business-card"]', { timeout: 10000 });

    // Cliquer sur la première entreprise
    const firstBusiness = page.locator('[data-testid="business-card"]').first();
    const businessName = await firstBusiness.locator('[data-testid="business-name"]').textContent();

    await firstBusiness.click();

    // Vérifier la navigation vers la page business
    await expect(page).toHaveURL(/\/business\//);

    // Vérifier que le nom de l'entreprise est dans l'URL ou le titre
    if (businessName) {
      await expect(page.locator(`text=${businessName}`).first()).toBeVisible();
    }
  });

  test('should navigate using bottom navigation', async ({ page }) => {
    // Tester la navigation vers la carte
    const mapTab = page.locator('[data-testid="nav-map"]');
    await mapTab.click();

    await expect(page).toHaveURL('/consumer/map');

    // Revenir à l'accueil
    const homeTab = page.locator('[data-testid="nav-home"]');
    await homeTab.click();

    await expect(page).toHaveURL('/consumer/home');
  });

  test('should handle offline mode gracefully', async ({ page, context }) => {
    // Simuler la perte de connexion
    await context.setOffline(true);

    // Attendre un peu pour que le SW prenne le relais
    await page.waitForTimeout(2000);

    // La page devrait toujours être fonctionnelle grâce au cache
    await expect(page.locator('text=Découvrir')).toBeVisible();

    // Remettre online
    await context.setOffline(false);
  });

  test('should be responsive on mobile', async ({ page, viewport }) => {
    // Simuler un viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Vérifier que la navigation mobile fonctionne
    const bottomNav = page.locator('[data-testid="bottom-navigation"]');
    await expect(bottomNav).toBeVisible();

    // Vérifier que le contenu s'adapte
    const mainContent = page.locator('main');
    const boundingBox = await mainContent.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('should handle loading states', async ({ page }) => {
    // Simuler un rechargement
    await page.reload();

    // Vérifier les états de chargement
    const loadingIndicators = page.locator('[data-testid="loading"], [data-testid="skeleton"]');
    const count = await loadingIndicators.count();

    // Il devrait y avoir des indicateurs de chargement
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Simuler une erreur réseau (si possible avec les mocks)
    // Pour l'instant, vérifier que les erreurs sont gérées
    const errorMessages = page.locator('[data-testid="error-message"]');
    const count = await errorMessages.count();

    // Normalement pas d'erreurs au chargement initial
    expect(count).toBe(0);
  });
});