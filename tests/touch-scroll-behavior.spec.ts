import { expect, test, type Page } from "@playwright/test";

const PUBLIC_PAGES = ["/", "/about", "/portfolio", "/contact", "/estimate"];

async function inspectGlobalTouchMove(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const touchTarget = document.body ?? root;
    const createTouchLike = (clientY: number) => ({
      identifier: 1,
      target: touchTarget,
      clientX: 160,
      clientY,
      pageX: 160,
      pageY: clientY,
      screenX: 160,
      screenY: clientY,
      radiusX: 12,
      radiusY: 12,
    });
    const createTouchEvent = (type: string, touches: ReturnType<typeof createTouchLike>[], changedTouches = touches) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        touches: { value: touches },
        targetTouches: { value: touches },
        changedTouches: { value: changedTouches },
      });
      return event;
    };

    let prevented: boolean | null = null;
    const capture = (event: TouchEvent) => {
      prevented = event.defaultPrevented;
    };

    document.addEventListener("touchmove", capture, { passive: false });
    try {
      const startTouch = createTouchLike(540);
      const moveTouch = createTouchLike(420);

      touchTarget.dispatchEvent(createTouchEvent("touchstart", [startTouch]));
      touchTarget.dispatchEvent(createTouchEvent("touchmove", [moveTouch]));
    } finally {
      document.removeEventListener("touchmove", capture);
    }

    return {
      prevented,
      scrollMode: root.dataset.scrollMode ?? null,
    };
  });
}

async function getSignatureTop(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector('[data-home-section="signature"]');
    if (!(section instanceof HTMLElement)) return -1;
    return Math.round(section.getBoundingClientRect().top + window.scrollY);
  });
}

async function getSignatureStep(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector('[data-home-section="signature"]');
    const activeStepAttr = section?.getAttribute("data-active-step");
    return activeStepAttr ? Number.parseInt(activeStepAttr, 10) : -1;
  });
}

async function getSignatureLockState(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector('[data-home-section="signature"]');
    return section?.getAttribute("data-scene-locked") ?? "false";
  });
}

async function dispatchTouchSwipe(page: Page, startY: number, endY: number) {
  await page.evaluate(({ swipeStartY, swipeEndY }) => {
    const touchTarget = document.body ?? document.documentElement;
    const createTouchLike = (clientY: number) => ({
      identifier: 1,
      target: touchTarget,
      clientX: 160,
      clientY,
      pageX: 160,
      pageY: clientY,
      screenX: 160,
      screenY: clientY,
      radiusX: 12,
      radiusY: 12,
    });
    const createTouchEvent = (type: string, touches: ReturnType<typeof createTouchLike>[], changedTouches = touches) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        touches: { value: touches },
        targetTouches: { value: touches },
        changedTouches: { value: changedTouches },
      });
      return event;
    };

    const startTouch = createTouchLike(swipeStartY);
    const moveTouch = createTouchLike(swipeEndY);

    touchTarget.dispatchEvent(createTouchEvent("touchstart", [startTouch]));
    touchTarget.dispatchEvent(createTouchEvent("touchmove", [moveTouch]));
    touchTarget.dispatchEvent(createTouchEvent("touchend", [], [moveTouch]));
  }, { swipeStartY: startY, swipeEndY: endY });
}

test.describe("Touch scroll behavior", () => {
  test("public pages keep native touch scrolling unlocked on mobile and tablet", async ({ page }) => {
    for (const pagePath of PUBLIC_PAGES) {
      await page.goto(pagePath, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);

      const touchMove = await inspectGlobalTouchMove(page);
      expect(touchMove.scrollMode, `${pagePath} should use native touch scrolling`).toBe("native");
      expect(touchMove.prevented, `${pagePath} should not globally cancel touchmove while unlocked`).toBe(false);
    }
  });

  test("home signature scene only intercepts touch gestures while locked", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    await expect.poll(() => inspectGlobalTouchMove(page)).toMatchObject({
      prevented: false,
      scrollMode: "native",
    });

    const signatureTop = await getSignatureTop(page);
    expect(signatureTop).toBeGreaterThan(0);

    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), signatureTop + 12);
    await page.waitForTimeout(500);

    await expect.poll(() => getSignatureLockState(page)).toBe("true");
    await expect.poll(() => inspectGlobalTouchMove(page)).toMatchObject({
      prevented: true,
      scrollMode: "native",
    });

    await dispatchTouchSwipe(page, 620, 440);
    await page.waitForTimeout(700);
    await expect.poll(() => getSignatureStep(page)).toBe(1);
  });
});
