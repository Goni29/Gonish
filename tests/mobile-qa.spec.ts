import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/* ─── 대상 페이지 ─── */
const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Contact', path: '/contact' },
  { name: 'Estimate', path: '/estimate' },
];

/* ─── 출력 디렉토리 ─── */
const RESULTS_DIR = path.join(process.cwd(), 'mobile-qa-results');
const SCREENSHOTS_DIR = path.join(RESULTS_DIR, 'screenshots');
const CHECKS_DIR = path.join(RESULTS_DIR, 'checks');

function ensureDirs() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(CHECKS_DIR, { recursive: true });
}

/* ─── 체크 결과 타입 ─── */
interface CheckResult {
  pass: boolean;
  detail: string;
  fix?: string;
  items?: unknown[];
}

/* ─── 테스트 ─── */
for (const { name: pageName, path: pagePath } of PAGES) {
  test(`Mobile QA: ${pageName}`, async ({ page }, testInfo) => {
    ensureDirs();

    const device = testInfo.project.name;
    const slug = `${pageName.toLowerCase()}-${device.toLowerCase()}`;

    /* ── 콘솔 에러 캡처 (네비게이션 전에 시작) ── */
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    /* ── 네비게이션 ── */
    await page.goto(pagePath, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    /* ── 스크린샷: 뷰포트 + 풀페이지 ── */
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${slug}.png`),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${slug}-full.png`),
      fullPage: true,
    });

    const checks: Record<string, CheckResult> = {};
    const vpWidth = page.viewportSize()!.width;

    /* ── 1. 수평 오버플로 ── */
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    checks['overflow'] = {
      pass: scrollWidth <= vpWidth,
      detail:
        scrollWidth <= vpWidth
          ? 'OK'
          : `scrollWidth(${scrollWidth}) > viewport(${vpWidth})`,
      fix: scrollWidth <= vpWidth
        ? undefined
        : `html, body { overflow-x: hidden; } 을 추가하거나, 넘치는 요소에 max-width: 100vw 적용. DevTools → Elements에서 <html>의 scrollWidth를 확인해 범인 요소를 찾을 것.`,
    };

    /* ── 2. 터치 타겟 (44×44px 미만) ── */
    const smallTargets = await page.evaluate(() => {
      const MIN = 44;
      const els = document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], [onclick]',
      );
      const bad: { tag: string; size: string; text: string }[] = [];
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        // 화면에 보이는 요소만 검사
        if (r.width === 0 || r.height === 0) return;
        const style = getComputedStyle(el);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.opacity === '0'
        )
          return;
        if (r.width < MIN || r.height < MIN) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            size: `${Math.round(r.width)}×${Math.round(r.height)}`,
            text: (el.textContent || '').trim().slice(0, 40),
          });
        }
      });
      return bad;
    });
    checks['touch-targets'] = {
      pass: smallTargets.length === 0,
      detail:
        smallTargets.length === 0
          ? 'OK'
          : `${smallTargets.length}개 요소 < 44px`,
      fix: smallTargets.length === 0
        ? undefined
        : `min-height: 44px; min-width: 44px; 을 적용하거나, padding을 늘려서 터치 영역을 확보. 아이콘 버튼이라면 p-3 (12px) 이상 권장. 인라인 링크(<a>)는 display: inline-block; padding: 8px 0; 으로 높이 확보.`,
      items: smallTargets.length > 0 ? smallTargets : undefined,
    };

    /* ── 3. 폰트 가독성 (12px 미만) ── */
    const smallFonts = await page.evaluate(() => {
      const MIN = 12;
      const textEls = document.querySelectorAll(
        'p, span, li, td, th, label, a, h1, h2, h3, h4, h5, h6',
      );
      const bad: { tag: string; fontSize: string; text: string }[] = [];
      const seen = new Set<string>();
      textEls.forEach((el) => {
        const text = (el.textContent || '').trim();
        if (!text || text.length < 2) return;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return;
        const fs = parseFloat(style.fontSize);
        if (fs > 0 && fs < MIN) {
          const key = `${el.tagName}-${fs}`;
          if (!seen.has(key)) {
            seen.add(key);
            bad.push({
              tag: el.tagName.toLowerCase(),
              fontSize: `${fs}px`,
              text: text.slice(0, 40),
            });
          }
        }
      });
      return bad;
    });
    checks['font-size'] = {
      pass: smallFonts.length === 0,
      detail:
        smallFonts.length === 0
          ? 'OK'
          : `${smallFonts.length}개 요소 < 12px`,
      fix: smallFonts.length === 0
        ? undefined
        : `최소 font-size: 12px (권장 14px 이상). iOS Safari는 16px 미만 input에서 자동 줌이 발생하므로 폼 요소는 font-size: 16px 이상 권장. Tailwind: text-xs(12px) 이상 사용.`,
      items: smallFonts.length > 0 ? smallFonts : undefined,
    };

    /* ── 4. 뷰포트 메타 태그 ── */
    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') || '' : null;
    });
    checks['viewport-meta'] = {
      pass: !!viewportMeta,
      detail: viewportMeta || 'viewport meta 태그 없음',
      fix: viewportMeta
        ? undefined
        : `<head>에 <meta name="viewport" content="width=device-width, initial-scale=1"> 추가. Next.js는 자동 생성하므로, 커스텀 _document에서 덮어쓰고 있지 않은지 확인.`,
    };

    /* ── 5. 깨진 이미지 ── */
    const brokenImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter((img) => {
          if (!img.src && !img.currentSrc) return false;
          if (img.src.startsWith('data:')) return false;
          return img.complete && img.naturalWidth === 0;
        })
        .map((img) => ({ src: img.src, alt: img.alt }));
    });
    checks['images'] = {
      pass: brokenImages.length === 0,
      detail:
        brokenImages.length === 0
          ? 'OK'
          : `${brokenImages.length}개 깨진 이미지`,
      fix: brokenImages.length === 0
        ? undefined
        : `이미지 src 경로가 올바른지 확인. Next.js <Image>를 쓰고 있다면 next.config.mjs의 images.remotePatterns 설정 점검. public/ 폴더의 파일명 대소문자도 확인.`,
      items: brokenImages.length > 0 ? brokenImages : undefined,
    };

    /* ── 6. 뷰포트 범위 ── */
    const outsideViewport = await page.evaluate((vw: number) => {
      const els = document.querySelectorAll(
        'section, nav, main, article, header, footer',
      );
      const bad: { tag: string; id: string; right: number }[] = [];
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.left >= vw || r.right > vw + 5) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            right: Math.round(r.right),
          });
        }
      });
      return bad;
    }, vpWidth);
    checks['viewport-bounds'] = {
      pass: outsideViewport.length === 0,
      detail:
        outsideViewport.length === 0
          ? 'OK'
          : `${outsideViewport.length}개 요소가 뷰포트 밖`,
      fix: outsideViewport.length === 0
        ? undefined
        : `뷰포트 밖으로 넘어간 요소에 max-width: 100%; 또는 overflow: hidden; 적용. position: absolute/fixed 요소의 left/right 값 점검.`,
      items: outsideViewport.length > 0 ? outsideViewport : undefined,
    };

    /* ── 7. 콘솔 에러 ── */
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('third-party') &&
        !e.includes('DevTools') &&
        !e.includes('Download the React DevTools'),
    );
    checks['console-errors'] = {
      pass: criticalErrors.length === 0,
      detail:
        criticalErrors.length === 0
          ? 'OK'
          : criticalErrors.join('; ').slice(0, 200),
      fix: criticalErrors.length === 0
        ? undefined
        : `브라우저 DevTools Console에서 에러 메시지를 확인. 모바일 전용 에러라면 특정 뷰포트에서만 실행되는 코드(IntersectionObserver, touch 이벤트 등)를 점검.`,
    };

    /* ── 8. Safe Area (노치/홈 인디케이터 영역) ── */
    const safeAreaIssues = await page.evaluate(() => {
      const NOTCH_HEIGHT = 47; // iPhone 노치 영역 높이
      const HOME_INDICATOR = 34; // iPhone 홈 인디케이터 높이
      const vpHeight = window.innerHeight;
      const els = document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"]',
      );
      const issues: { area: string; tag: string; text: string }[] = [];
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return;
        // 노치 영역 침범
        if (r.top >= 0 && r.top < NOTCH_HEIGHT && r.height > 0) {
          issues.push({
            area: 'notch',
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().slice(0, 30),
          });
        }
        // 홈 인디케이터 영역 침범
        if (r.bottom > vpHeight - HOME_INDICATOR && r.bottom <= vpHeight) {
          issues.push({
            area: 'home-indicator',
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().slice(0, 30),
          });
        }
      });
      return issues;
    });
    checks['safe-area'] = {
      pass: safeAreaIssues.length === 0,
      detail:
        safeAreaIssues.length === 0
          ? 'OK'
          : `${safeAreaIssues.length}개 요소가 safe area 침범`,
      fix: safeAreaIssues.length === 0
        ? undefined
        : `CSS에서 env(safe-area-inset-top), env(safe-area-inset-bottom) 사용. 예: padding-top: env(safe-area-inset-top); 고정 헤더/푸터에는 반드시 적용. Tailwind: pt-[env(safe-area-inset-top)] 또는 globals.css에 직접 작성.`,
      items: safeAreaIssues.length > 0 ? safeAreaIssues : undefined,
    };

    /* ═══ 애니메이션 검증 (여기부터 스크롤 발생) ═══ */

    /* ── 9. CSS 애니메이션 활성 여부 ── */
    const animationIssues = await page.evaluate(() => {
      const issues: { element: string; animation: string; state: string }[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const style = getComputedStyle(el);
        if (
          style.animationName &&
          style.animationName !== 'none' &&
          style.animationPlayState === 'paused'
        ) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0) {
            const cls = el.getAttribute('class') || '';
            issues.push({
              element: `<${el.tagName.toLowerCase()}> .${cls.split(' ').slice(0, 3).join('.')}`,
              animation: style.animationName,
              state: 'paused',
            });
          }
        }
      });
      return issues;
    });
    checks['css-animation'] = {
      pass: animationIssues.length === 0,
      detail:
        animationIssues.length === 0
          ? 'OK'
          : `${animationIssues.length}개 애니메이션 일시정지됨`,
      fix:
        animationIssues.length === 0
          ? undefined
          : `뷰포트 내 요소의 CSS 애니메이션이 paused 상태. animation-play-state: running 확인. IntersectionObserver나 ScrollTrigger로 제어 중이라면, 모바일 뷰포트에서 트리거 조건이 충족되는지 점검.`,
      items: animationIssues.length > 0 ? animationIssues : undefined,
    };

    /* ── 10. 스크롤 트리거 애니메이션 가시성 ── */
    const pageHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    const scrollVisibilityIssues: {
      position: string;
      section: string;
      invisible: number;
      total: number;
    }[] = [];

    for (const pct of [25, 50, 75]) {
      const scrollY = Math.round((pageHeight * pct) / 100);
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }),
        scrollY,
      );
      await page.waitForTimeout(1000);

      const sectionIssues = await page.evaluate((vpH: number) => {
        const results: {
          section: string;
          invisible: number;
          total: number;
        }[] = [];
        document.querySelectorAll('section').forEach((sec) => {
          const rect = sec.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > vpH) return;

          let invisible = 0;
          let total = 0;
          sec
            .querySelectorAll('h1,h2,h3,h4,p,span,img,a,button')
            .forEach((child) => {
              const cRect = child.getBoundingClientRect();
              if (cRect.height < 5 || cRect.width < 5) return;
              const cStyle = getComputedStyle(child);
              if (cStyle.display === 'none') return;
              total++;
              if (parseFloat(cStyle.opacity) < 0.1) invisible++;
            });

          if (total >= 3 && invisible > total * 0.5) {
            const id =
              sec.id ||
              sec.getAttribute('data-section') ||
              (sec.getAttribute('class') || '').split(' ')[0] ||
              'unknown';
            results.push({ section: id, invisible, total });
          }
        });
        return results;
      }, page.viewportSize()!.height);

      sectionIssues.forEach((issue) => {
        scrollVisibilityIssues.push({ position: `${pct}%`, ...issue });
      });
    }

    checks['scroll-animation'] = {
      pass: scrollVisibilityIssues.length === 0,
      detail:
        scrollVisibilityIssues.length === 0
          ? 'OK'
          : `${scrollVisibilityIssues.length}개 섹션에서 스크롤 후에도 콘텐츠 미표시`,
      fix:
        scrollVisibilityIssues.length === 0
          ? undefined
          : `스크롤 트리거 애니메이션(Framer Motion whileInView, GSAP ScrollTrigger)이 모바일에서 미발동. IntersectionObserver threshold를 0.1~0.2로 낮추거나, rootMargin: "0px 0px -10% 0px" 추가. 작은 뷰포트에서 요소가 충분히 노출되지 않아 트리거 안 될 수 있음.`,
      items:
        scrollVisibilityIssues.length > 0
          ? scrollVisibilityIssues
          : undefined,
    };

    /* ── 11. 핀 섹션 검증 (Home 전용) ── */
    if (pagePath === '/') {
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }),
      );
      await page.waitForTimeout(300);

      const pinResults = await page.evaluate(async () => {
        const results: {
          section: string;
          pinned: boolean;
          detail: string;
        }[] = [];
        const pinSpacers = document.querySelectorAll(
          '[class*="pin-spacer"]',
        );

        for (const spacer of Array.from(pinSpacers)) {
          const pinned = spacer.firstElementChild as HTMLElement | null;
          if (!pinned) continue;

          const spacerRect = spacer.getBoundingClientRect();
          const spacerTop = spacerRect.top + window.scrollY;
          const sectionName =
            pinned.id ||
            pinned.getAttribute('data-section') ||
            (pinned.getAttribute('class') || '').split(' ')[0] ||
            'pin-section';

          window.scrollTo({
            top: spacerTop + spacerRect.height * 0.3,
            behavior: 'instant' as ScrollBehavior,
          });
          await new Promise((r) => setTimeout(r, 600));

          const pinnedRect = pinned.getBoundingClientRect();
          const style = getComputedStyle(pinned);
          const isNearTop = pinnedRect.top >= -10 && pinnedRect.top <= 150;
          const isFixed = style.position === 'fixed';
          const hasPin = isFixed || isNearTop;

          results.push({
            section: sectionName,
            pinned: hasPin,
            detail: hasPin
              ? `고정됨 (top: ${Math.round(pinnedRect.top)}px, position: ${style.position})`
              : `미고정 (top: ${Math.round(pinnedRect.top)}px, position: ${style.position})`,
          });
        }

        if (results.length === 0) {
          results.push({
            section: 'N/A',
            pinned: true,
            detail: 'pin-spacer 미발견 (GSAP 미초기화 가능)',
          });
        }
        return results;
      });

      const pinFailed = pinResults.filter((r) => !r.pinned);
      checks['pin-section'] = {
        pass: pinFailed.length === 0,
        detail:
          pinFailed.length === 0
            ? `${pinResults.length}개 핀 섹션 정상`
            : `${pinFailed.length}/${pinResults.length}개 핀 섹션 미동작`,
        fix:
          pinFailed.length === 0
            ? undefined
            : `GSAP ScrollTrigger pin이 모바일에서 미작동. pinType: "transform" 사용 권장 (iOS Safari position:fixed 이슈). ScrollTrigger.normalizeScroll(true) 적용 필요. Lenis 사용 시 ScrollTrigger.scrollerProxy 설정 확인.`,
        items: pinFailed.length > 0 ? pinFailed : undefined,
      };
    } else {
      checks['pin-section'] = { pass: true, detail: '해당 없음' };
    }

    /* ── 12. 중간 스크롤 스크린샷 (애니메이션 전후 비교용) ── */
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }),
      Math.round(pageHeight * 0.5),
    );
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${slug}-mid.png`),
      fullPage: false,
    });

    /* ── 13. prefers-reduced-motion 대응 ── */
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(500);

    const reducedMotionIssues = await page.evaluate(() => {
      const issues: {
        element: string;
        animation: string;
        duration: string;
      }[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const style = getComputedStyle(el);
        if (style.animationName && style.animationName !== 'none') {
          const dur = parseFloat(style.animationDuration);
          if (dur > 0.01) {
            const cls = el.getAttribute('class') || '';
            issues.push({
              element: `<${el.tagName.toLowerCase()}>${el.id ? '#' + el.id : ''}.${cls.split(' ').slice(0, 2).join('.')}`,
              animation: style.animationName,
              duration: style.animationDuration,
            });
          }
        }
      });
      return issues;
    });

    await page.emulateMedia({ reducedMotion: 'no-preference' });

    checks['reduced-motion'] = {
      pass: reducedMotionIssues.length === 0,
      detail:
        reducedMotionIssues.length === 0
          ? 'OK'
          : `${reducedMotionIssues.length}개 애니메이션이 reduced-motion 무시`,
      fix:
        reducedMotionIssues.length === 0
          ? undefined
          : `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } } 글로벌 추가. Framer Motion: useReducedMotion() 훅. GSAP: gsap.matchMedia()로 조건부 비활성화.`,
      items:
        reducedMotionIssues.length > 0 ? reducedMotionIssues : undefined,
    };

    /* ── 스크롤 원위치 ── */
    await page.evaluate(() =>
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }),
    );

    /* ── 결과 저장 ── */
    const result = {
      page: pageName,
      path: pagePath,
      device,
      slug,
      viewport: page.viewportSize(),
      checks,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(CHECKS_DIR, `${slug}.json`),
      JSON.stringify(result, null, 2),
    );
  });
}
