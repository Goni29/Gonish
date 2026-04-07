import { expect, test, type Locator, type Page } from "@playwright/test";

const PUBLIC_PAGES = ["/about", "/portfolio", "/contact", "/estimate"];
const FLOATING_CHARACTER_CASES = [
  { path: "/contact", testId: "contact-floating-character" },
  { path: "/estimate", testId: "estimate-floating-character" },
] as const;

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

async function dispatchSyntheticTouchSequence(target: Locator) {
  await target.evaluate((node) => {
    const createTouchLike = (clientX: number, clientY: number) => ({
      identifier: 1,
      target: node,
      clientX,
      clientY,
      pageX: clientX,
      pageY: clientY,
      screenX: clientX,
      screenY: clientY,
      radiusX: 12,
      radiusY: 12,
      force: 0.5,
    });
    const createTouchEvent = (
      type: string,
      touches: ReturnType<typeof createTouchLike>[],
      changedTouches = touches,
    ) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        touches: { value: touches },
        targetTouches: { value: touches },
        changedTouches: { value: changedTouches },
      });
      return event;
    };

    const startTouch = createTouchLike(160, 540);
    const moveTouch = createTouchLike(184, 500);

    node.dispatchEvent(createTouchEvent("touchstart", [startTouch]));
    node.dispatchEvent(createTouchEvent("touchmove", [moveTouch]));
    node.dispatchEvent(createTouchEvent("touchend", [], [moveTouch]));
  });
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

  test("floating character touch lock does not throw runtime errors", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    for (const { path, testId } of FLOATING_CHARACTER_CASES) {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(900);

      const baselineErrorCount = pageErrors.length;
      const target = page.getByTestId(testId);
      await expect(target).toBeVisible();

      await dispatchSyntheticTouchSequence(target);
      await page.waitForTimeout(200);

      expect(
        pageErrors.slice(baselineErrorCount),
        `${path} floating character should not trigger page errors on touch lock`,
      ).toEqual([]);
    }
  });
});
