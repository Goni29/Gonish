import { expect, test } from "@playwright/test";

test.describe("About process compact layout", () => {
  test("keeps connectors clear of icons without horizontal overflow", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "Desktop Safari", "Compact layout only applies below lg.");

    await page.goto("/about");

    const section = page.getByTestId("about-process-compact");
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });

    expect(hasHorizontalOverflow).toBe(false);

    const overlaps = await page.evaluate(() => {
      const icons = Array.from(document.querySelectorAll("[data-testid='about-process-compact-icon']"))
        .map((element) => element.getBoundingClientRect())
        .map((rect) => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }));

      const connectors = Array.from(document.querySelectorAll("[data-testid='about-process-compact-connector']"))
        .map((element) => element.getBoundingClientRect())
        .map((rect) => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }));

      return connectors.some((connector) =>
        icons.some((icon) =>
          connector.left < icon.right &&
          connector.right > icon.left &&
          connector.top < icon.bottom &&
          connector.bottom > icon.top,
        ),
      );
    });

    expect(overlaps).toBe(false);

    await section.screenshot({
      path: testInfo.outputPath(`about-process-${testInfo.project.name.replace(/\s+/g, "-").toLowerCase()}.png`),
    });
  });
});
