import { expect, test, type Page } from "@playwright/test";

async function getSectionTops(page: Page) {
  return page.evaluate(() =>
    [
      document.getElementById("home-hero"),
      document.querySelector('[data-home-section="signature"]'),
      document.querySelector('[data-home-section="fill-word"]'),
    ].map((section) => {
      if (!(section instanceof HTMLElement)) return -1;
      return Math.round(section.getBoundingClientRect().top + window.scrollY);
    }),
  );
}

async function getSignatureActiveStep(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector('[data-home-section="signature"]');
    const activeStepAttr = section?.getAttribute("data-active-step");
    if (activeStepAttr) return Number.parseInt(activeStepAttr, 10);

    const progressContainer =
      section?.querySelector(".signature-section__mobile-progress") ??
      Array.from(section?.querySelectorAll("div") ?? []).find((element) => {
        const style = getComputedStyle(element);
        return (
          style.position === "absolute" &&
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

async function getFillLevel(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector('[data-home-section="fill-word"]');
    const fillText = section?.querySelector('[data-fill-layer="water"]');
    if (!(fillText instanceof HTMLElement)) return 100;
    return Number.parseFloat(fillText.dataset.fillLevel ?? "100");
  });
}

async function requestFillProgress(page: Page, progress: number) {
  await page.evaluate((requestedProgress) => {
    const section = document.querySelector('[data-home-section="fill-word"]');
    if (!(section instanceof HTMLElement)) throw new Error("Fill section missing");
    section.dispatchEvent(new CustomEvent("gonish:fill-progress", {
      bubbles: true,
      detail: { progress: requestedProgress },
    }));
  }, progress);
}

async function requestSignatureStep(page: Page, detail: { step?: number; direction?: "forward" | "backward" }) {
  await page.evaluate((requestedDetail) => {
    const section = document.querySelector('[data-home-section="signature"]');
    if (!(section instanceof HTMLElement)) throw new Error("Signature section missing");
    section.dispatchEvent(new CustomEvent("gonish:signature-step", {
      bubbles: true,
      detail: requestedDetail,
    }));
  }, detail);
}

async function getScrollTop(page: Page) {
  return page.evaluate(() => Math.round(window.scrollY));
}

async function getSignatureLockState(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector('[data-home-section="signature"]');
    return section?.getAttribute("data-scene-locked") ?? "false";
  });
}

async function dispatchWheelBurst(page: Page, deltaY: number, events = 6) {
  await page.evaluate(({ requestedDeltaY, requestedEvents }) => {
    const perEventDelta = requestedDeltaY / requestedEvents;
    const target = document.documentElement;
    for (let index = 0; index < requestedEvents; index += 1) {
      target.dispatchEvent(new WheelEvent("wheel", {
        deltaY: perEventDelta,
        bubbles: true,
        cancelable: true,
      }));
    }
  }, { requestedDeltaY: deltaY, requestedEvents: events });
}

test.describe("Home scroll sections", () => {
  test("signature steps and fill text update across devices", async ({ page }) => {
    test.slow();

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const [, signatureTop, fillTop] = await getSectionTops(page);
    expect(signatureTop).toBeGreaterThan(0);
    expect(fillTop).toBeGreaterThan(signatureTop);

    const signatureStep0Scroll = signatureTop + 32;

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), signatureStep0Scroll);
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(0);
    await expect(page.locator('[data-home-section="signature"] [data-step-target]')).toHaveCount(3);

    await requestSignatureStep(page, { step: 1 });
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(1);

    await requestSignatureStep(page, { step: 2 });
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(2);

    await requestSignatureStep(page, { step: 1 });
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(1);

    await requestSignatureStep(page, { step: 0 });
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(0);

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), fillTop + 30);
    await page.waitForTimeout(500);
    await expect.poll(() => getFillLevel(page)).toBeGreaterThan(99);
    await requestFillProgress(page, 0.32);
    await expect
      .poll(() => getFillLevel(page))
      .toBeLessThan(95);
  });

  test("signature scene locks per gesture and exits naturally", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "Desktop Safari", "Wheel gesture regression is desktop-focused");

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const [heroTop, signatureTop, fillTop] = await getSectionTops(page);
    expect(heroTop).toBe(0);
    expect(signatureTop).toBeGreaterThan(0);
    expect(fillTop).toBeGreaterThan(signatureTop);

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), signatureTop + 12);
    await page.waitForTimeout(500);
    await expect.poll(() => getSignatureLockState(page)).toBe("true");
    await expect.poll(() => getSignatureActiveStep(page)).toBe(0);

    const lockedY = await getScrollTop(page);
    expect(Math.abs(lockedY - signatureTop)).toBeLessThanOrEqual(4);

    await dispatchWheelBurst(page, 180);
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(1);
    await expect.poll(() => getScrollTop(page)).toBe(lockedY);

    await dispatchWheelBurst(page, 180);
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(2);
    await expect.poll(() => getScrollTop(page)).toBe(lockedY);

    await dispatchWheelBurst(page, 180);
    await page.waitForTimeout(900);
    await expect.poll(() => getSignatureLockState(page)).toBe("false");
    const forwardExitY = await getScrollTop(page);
    expect(forwardExitY).toBeGreaterThan(lockedY + 40);
    expect(forwardExitY).toBeLessThan(fillTop - 80);

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), fillTop + 24);
    await page.waitForTimeout(250);
    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), signatureTop - 10);
    await page.waitForTimeout(500);
    await expect.poll(() => getSignatureLockState(page)).toBe("true");
    await expect.poll(() => getSignatureActiveStep(page)).toBe(2);

    const relockedY = await getScrollTop(page);
    expect(Math.abs(relockedY - signatureTop)).toBeLessThanOrEqual(4);

    await dispatchWheelBurst(page, -180);
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(1);
    await expect.poll(() => getScrollTop(page)).toBe(relockedY);

    await dispatchWheelBurst(page, -180);
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureActiveStep(page)).toBe(0);
    await expect.poll(() => getScrollTop(page)).toBe(relockedY);

    await dispatchWheelBurst(page, -180);
    await page.waitForTimeout(900);
    await expect.poll(() => getSignatureLockState(page)).toBe("false");
    const backwardExitY = await getScrollTop(page);
    expect(backwardExitY).toBeLessThan(relockedY - 40);
    expect(backwardExitY).toBeGreaterThan(heroTop + 80);
  });
});
