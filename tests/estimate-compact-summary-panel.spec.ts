import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function dispatchTouchToggle(locator: Locator) {
  await locator.evaluate((node) => {
    node.dispatchEvent(new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerType: "touch",
    }));
    node.dispatchEvent(new TouchEvent("touchend", {
      bubbles: true,
      cancelable: true,
    }));
  });
}

test("compact estimate panel animates through opening and closing states", async ({ isMobile, page }) => {
  test.skip(!isMobile, "Compact summary panel is only rendered on tablet/mobile layouts.");

  await page.goto("/estimate", { waitUntil: "domcontentloaded" });

  await page.evaluate(() => window.scrollTo(0, 540));

  const toggle = page.getByTestId("estimate-compact-summary-toggle");
  const overlay = page.locator(".estimate-compact-summary-overlay");
  const panelShell = page.locator("#estimate-compact-summary-panel");
  const panel = page.getByTestId("estimate-compact-summary-panel");

  await dispatchTouchToggle(toggle);

  expect(await toggle.getAttribute("aria-expanded")).toBe("true");
  await expect(overlay).toHaveClass(/estimate-compact-summary-overlay--(opening|open)/);
  await expect(panelShell).toHaveClass(/estimate-compact-summary-shell--(opening|open)/);
  await expect(panel).toBeVisible();
  await expect(panelShell).toHaveClass(/estimate-compact-summary-shell--open/, { timeout: 2000 });

  await dispatchTouchToggle(toggle);

  expect(await toggle.getAttribute("aria-expanded")).toBe("false");
  await expect(overlay).toHaveClass(/estimate-compact-summary-overlay--(closing|closed)/);
  await expect(panelShell).toHaveClass(/estimate-compact-summary-shell--(closing|closed)/);
  await expect(panel).toBeHidden();
});
