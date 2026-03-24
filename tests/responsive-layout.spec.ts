import { test, expect, type Page } from '@playwright/test';

/* ──────────────────────────────────────────────
   Target pages
   ────────────────────────────────────────────── */
const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Contact', path: '/contact' },
  { name: 'Estimate', path: '/estimate' },
];

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

/** Collect console errors during the lifetime of a callback */
async function collectConsoleErrors(
  page: Page,
  fn: () => Promise<void>,
): Promise<string[]> {
  const errors: string[] = [];
  const handler = (msg: import('@playwright/test').ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('console', handler);
  await fn();
  page.off('console', handler);
  return errors;
}

/* ──────────────────────────────────────────────
   Tests — run for every page
   ────────────────────────────────────────────── */
for (const { name, path } of PAGES) {
  test.describe(`${name} page (${path})`, () => {
    /* ---------- 1. Page loads successfully ---------- */
    test('should load with HTTP 200', async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);
    });

    /* ---------- 2. No horizontal overflow ---------- */
    test('should have no horizontal overflow', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      // Wait a bit for any animations to settle
      await page.waitForTimeout(1000);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(overflow, 'Page has horizontal scroll — likely an element overflows the viewport').toBe(false);
    });

    /* ---------- 3. Header visibility ---------- */
    test('header should be visible', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const header = page.locator('header').first();
      // Header might not exist on every page — skip gracefully
      const count = await header.count();
      if (count > 0) {
        await expect(header).toBeVisible();
      }
    });

    /* ---------- 4. Footer visibility ---------- */
    test('footer should be visible after scrolling to bottom', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const footer = page.locator('footer').first();
      const count = await footer.count();
      if (count > 0) {
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();
      }
    });

    /* ---------- 5. No broken images ---------- */
    test('all images should load correctly', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs
          .filter((img) => {
            // Skip lazy images that haven't loaded yet (no src)
            if (!img.src && !img.currentSrc) return false;
            // Skip SVG data URIs & tiny tracking pixels
            if (img.src.startsWith('data:')) return false;
            return img.complete && img.naturalWidth === 0;
          })
          .map((img) => ({
            src: img.src || img.currentSrc,
            alt: img.alt,
          }));
      });

      expect(
        brokenImages,
        `Broken images found: ${JSON.stringify(brokenImages, null, 2)}`,
      ).toHaveLength(0);
    });

    /* ---------- 6. Key elements stay within viewport ---------- */
    test('key elements should be within viewport bounds', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const viewportWidth = page.viewportSize()!.width;

      // Check that no absolutely-positioned element sticks out of view
      const outOfBounds = await page.evaluate((vpWidth: number) => {
        const allElements = document.querySelectorAll('section, nav, main, article, aside');
        const bad: { tag: string; id: string; className: string; right: number }[] = [];
        allElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Element starts way outside viewport to the right
          if (rect.left >= vpWidth || rect.right > vpWidth + 5) {
            bad.push({
              tag: el.tagName,
              id: el.id,
              className: el.className?.toString().slice(0, 60) || '',
              right: Math.round(rect.right),
            });
          }
        });
        return bad;
      }, viewportWidth);

      expect(
        outOfBounds,
        `Elements outside viewport: ${JSON.stringify(outOfBounds, null, 2)}`,
      ).toHaveLength(0);
    });

    /* ---------- 7. No overlapping major sections ---------- */
    test('major sections should not overlap each other', async ({ page }) => {
      // Estimate page has intentional overlapping sections for visual effect
      if (path === '/estimate') {
        test.skip();
        return;
      }

      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const overlaps = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('section'));
        const rects = sections.map((s) => ({
          tag: s.tagName,
          id: s.id,
          rect: s.getBoundingClientRect(),
        }));

        const issues: string[] = [];
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i].rect;
            const b = rects[j].rect;
            // Check vertical overlap with some tolerance (5px)
            const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (overlapY > 5 && a.height > 0 && b.height > 0) {
              // Also check horizontal overlap
              const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              if (overlapX > 5) {
                issues.push(
                  `Section#${rects[i].id || i} overlaps Section#${rects[j].id || j} by ${Math.round(overlapX)}×${Math.round(overlapY)}px`,
                );
              }
            }
          }
        }
        return issues;
      });

      expect(
        overlaps,
        `Section overlaps detected:\n${overlaps.join('\n')}`,
      ).toHaveLength(0);
    });

    /* ---------- 8. No console errors ---------- */
    test('should have no console errors', async ({ page }) => {
      const errors = await collectConsoleErrors(page, async () => {
        await page.goto(path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      });

      // Filter out known / non-critical noise
      const critical = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('third-party') &&
          !e.includes('DevTools'),
      );

      expect(
        critical,
        `Console errors:\n${critical.join('\n')}`,
      ).toHaveLength(0);
    });
  });
}
