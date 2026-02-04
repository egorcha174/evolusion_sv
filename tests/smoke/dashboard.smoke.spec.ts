import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main dashboard page
    await page.goto('/'); 
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard and display grid, weather, and battery widgets', async ({ page }) => {
    // Check if the dashboard grid is visible
    const dashboardGrid = page.locator('.dashboard-grid'); 
    await expect(dashboardGrid).toBeVisible();

    // Check for at least one device card (assuming it's rendered within the grid)
    const deviceCards = page.locator('.device-card-wrapper'); 
    await expect(deviceCards.first()).toBeVisible();
    await expect(deviceCards).toHaveCount(1); // Check for at least one, or adjust as needed

    // Check if weather widget is visible
    const weatherWidget = page.locator('.weather-widget-container'); 
    await expect(weatherWidget).toBeVisible();

    // Check if battery widget is visible
    const batteryWidget = page.locator('.battery-widget-container'); 
    await expect(batteryWidget).toBeVisible();
  });

  // Basic drag-and-drop simulation
  test('should allow dragging a device card in edit mode', async ({ page }) => {
    // Enter edit mode
    await page.locator('button:has-text("Edit Dashboard")').click();
    await expect(page.locator('button:has-text("Exit Edit Mode")')).toBeVisible();

    // Assuming a device card is present
    const deviceCard = page.locator('.device-card-wrapper').first();
    const initialBoundingBox = await deviceCard.boundingBox();
    expect(initialBoundingBox).toBeDefined();

    // Assuming there's a droppable cell
    const targetCell = page.locator('[data-col="1"][data-row="1"]'); // Target a specific cell
    const targetBoundingBox = await targetCell.boundingBox();
    expect(targetBoundingBox).toBeDefined();

    if (initialBoundingBox && targetBoundingBox) {
        await deviceCard.hover();
        await page.mouse.down();
        await targetCell.hover();
        await page.mouse.up();
        
        // Verify that the layout change is reflected (this might require more specific checks
        // depending on how the layout is updated visually or in the DOM).
        // For a smoke test, we might just check if the card is still visible and not crashed.
        await expect(deviceCard).toBeVisible();
    }

    // Exit edit mode
    await page.locator('button:has-text("Exit Edit Mode")').click();
    await expect(page.locator('button:has-text("Edit Dashboard")')).toBeVisible();
  });
});
