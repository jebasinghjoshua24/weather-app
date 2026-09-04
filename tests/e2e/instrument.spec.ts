import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("instrument smoke @a11y", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /ATMOSPHERE/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Search city/i)).toBeVisible();
});

test("no horizontal scroll instrument @a11y", async ({ page }) => {
  await page.goto("/");
  const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2);
  expect(ok).toBe(true);
});

test("keyboard nav search + unit @a11y", async ({ page }) => {
  await page.goto("/");
  const search = page.getByPlaceholder(/Search city/i);
  await search.focus();
  await expect(search).toBeFocused();
  const c = page.getByRole("button", { name: "°C" });
  await c.focus();
  await expect(c).toBeFocused();
});

test("contrast axe @a11y", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(["wcag2aa"]).analyze();
  const contrast = results.violations.filter((v) => v.id === "color-contrast");
  expect(contrast).toEqual([]);
});
