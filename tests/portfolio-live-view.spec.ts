import { expect, test } from "@playwright/test";

test.describe("Portfolio preview pinch guard", () => {
  test("blocks pinch on the desktop preview for mobile and tablet viewports", async ({ page }) => {
    await page.goto("/portfolio", { waitUntil: "networkidle" });

    const viewportWidth = page.viewportSize()?.width ?? 0;
    if (viewportWidth >= 1024) return;

    const previewFrame = page.locator("iframe").first();
    const pinchDisabledBadge = page.getByText("Pinch disabled");

    await expect(previewFrame).toBeVisible();
    await expect(pinchDisabledBadge).toBeVisible();
    await expect
      .poll(async () => previewFrame.evaluate((node) => node.style.pointerEvents))
      .toBe("none");
  });
});
