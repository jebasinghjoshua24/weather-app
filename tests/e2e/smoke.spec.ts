import { test, expect } from "@playwright/test";

test("home loads and shows ATMOSPHERE header", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /ATMOSPHERE/i })).toBeVisible({ timeout: 15000 });
  // Search placeholder from SearchBar
  await expect(page.getByPlaceholder(/Search city/i)).toBeVisible();
});

test("popular cities pills are visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Presets:")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tokyo" })).toBeVisible();
});

test("temperature unit toggle works", async ({ page }) => {
  await page.goto("/");
  const cBtn = page.getByRole("button", { name: "°C" });
  const fBtn = page.getByRole("button", { name: "°F" });
  await expect(cBtn).toBeVisible();
  await expect(fBtn).toBeVisible();
  // Initially C is pressed
  await expect(cBtn).toHaveAttribute("aria-pressed", "true");
  await fBtn.click();
  await expect(fBtn).toHaveAttribute("aria-pressed", "true");
});
