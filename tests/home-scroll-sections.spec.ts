import { expect, test, type Page } from "@playwright/test";

async function getSectionTops(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("main section")).map((section) =>
      Math.round(section.getBoundingClientRect().top + window.scrollY),
    ),
  );
}

async function getSignatureActiveStep(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelectorAll("main section")[1];
    const progressContainer = Array.from(section?.querySelectorAll("div") ?? []).find((element) => {
      const style = getComputedStyle(element);
      return (
        style.position === "absolute" &&
        style.bottom === "12px" &&
        style.left === "0px" &&
        style.right === "0px"
      );
    });
    const bars = Array.from(progressContainer?.children ?? []) as HTMLElement[];

    if (bars.length === 0) return -1;

    const widths = bars.map((bar) => parseFloat(getComputedStyle(bar).width));
    const maxWidth = Math.max(...widths);
    return widths.findIndex((width) => width === maxWidth);
  });
}

async function getFillBackgroundImage(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelectorAll("main section")[2];
    const fillText = section?.querySelector("p.absolute.inset-0");
    if (!(fillText instanceof HTMLElement)) return "";
    return getComputedStyle(fillText).backgroundImage;
  });
}

test.describe("Home scroll sections", () => {
  test("tablet/mobile scroll updates the signature steps and fill text", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "Desktop Safari", "Touch-focused regression check");

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const [, signatureTop, fillTop] = await getSectionTops(page);
    expect(signatureTop).toBeGreaterThan(0);
    expect(fillTop).toBeGreaterThan(signatureTop);

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), signatureTop);
    await page.waitForTimeout(900);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(0);

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), signatureTop + 360);
    await page.waitForTimeout(900);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(1);

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), signatureTop + 820);
    await page.waitForTimeout(900);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(2);

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), fillTop + 30);
    await page.waitForTimeout(500);
    await expect.poll(() => getFillBackgroundImage(page)).toBe("none");

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), fillTop + 320);
    await page.waitForTimeout(700);
    await expect
      .poll(() => getFillBackgroundImage(page))
      .not.toBe("none");
  });
});
