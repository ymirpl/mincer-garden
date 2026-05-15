import { expect, test } from '@playwright/test';

test('home page renders the garden mosaic', async ({ page }) => {
  await page.goto('/mincer-garden/');

  await expect(page).toHaveTitle('garden.mincer');
  await expect(page.getByRole('link', { name: 'garden.mincer home' })).toBeVisible();
  await expect(page.locator('#mosaic')).toBeVisible();
});
