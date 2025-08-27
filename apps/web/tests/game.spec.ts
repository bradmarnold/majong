import { test, expect } from '@playwright/test';

test.describe('Majong Game', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Majong/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Majong');
    
    // Check start button
    await expect(page.locator('button')).toContainText('Start New Game');
  });

  test('should start a new game', async ({ page }) => {
    await page.goto('/');
    
    // Click start new game
    await page.click('button:has-text("Start New Game")');
    
    // Wait for game to load
    await page.waitForSelector('.table-surface', { timeout: 5000 });
    
    // Check game header is visible
    await expect(page.locator('.bg-felt-900')).toBeVisible();
    
    // Check that we have a game table
    await expect(page.locator('.table-surface')).toBeVisible();
    
    // Check player name is displayed
    await expect(page.locator('text=You')).toBeVisible();
  });

  test('should show teaching drawer', async ({ page }) => {
    await page.goto('/');
    
    // Start game
    await page.click('button:has-text("Start New Game")');
    await page.waitForSelector('.table-surface');
    
    // Click teach me button
    await page.click('button:has-text("Teach Me")');
    
    // Check drawer is visible
    await expect(page.locator('text=Teaching Assistant')).toBeVisible();
    
    // Check for quick tips
    await expect(page.locator('text=Quick Tips')).toBeVisible();
  });

  test('should allow tile selection and discard', async ({ page }) => {
    await page.goto('/');
    
    // Start game
    await page.click('button:has-text("Start New Game")');
    await page.waitForSelector('.table-surface');
    
    // Wait for game to be in discarding phase
    await page.waitForSelector('text=discarding', { timeout: 5000 });
    
    // Try to select a tile in the bottom hand
    const tiles = page.locator('.hand-area .mahjong-tile').first();
    if (await tiles.count() > 0) {
      await tiles.first().click();
      
      // Check if discard button is enabled
      const discardButton = page.locator('button:has-text("Discard")');
      await expect(discardButton).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');
    
    // Check main page loads on mobile
    await expect(page.locator('h1')).toContainText('Majong');
    
    // Start game
    await page.click('button:has-text("Start New Game")');
    await page.waitForSelector('.table-surface');
    
    // Check game is playable on mobile
    await expect(page.locator('.table-surface')).toBeVisible();
    
    // Check controls are accessible
    await expect(page.locator('button:has-text("Draw")')).toBeVisible();
  });

  test('should handle draw action', async ({ page }) => {
    await page.goto('/');
    
    // Start game
    await page.click('button:has-text("Start New Game")');
    await page.waitForSelector('.table-surface');
    
    // Wait for drawing phase
    await page.waitForSelector('text=drawing', { timeout: 5000 });
    
    // Check draw button is available
    const drawButton = page.locator('button:has-text("Draw")');
    if (await drawButton.isEnabled()) {
      await drawButton.click();
      
      // Should move to discarding phase
      await expect(page.locator('text=discarding')).toBeVisible();
    }
  });

  test('should show game state information', async ({ page }) => {
    await page.goto('/');
    
    // Start game
    await page.click('button:has-text("Start New Game")');
    await page.waitForSelector('.table-surface');
    
    // Check round information
    await expect(page.locator('text=Round 1')).toBeVisible();
    
    // Check wind information
    await expect(page.locator('text=EAST Wind')).toBeVisible();
    
    // Check wall count
    await expect(page.locator('text=Wall:')).toBeVisible();
  });
});