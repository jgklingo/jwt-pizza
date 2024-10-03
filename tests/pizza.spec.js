import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('buy pizza with login', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Order' }).click();
  await expect(page.getByRole('list')).toContainText('menu');
  await page.getByRole('combobox').selectOption('10');
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('test@test.test');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('test');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await page.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();
});