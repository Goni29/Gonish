export type EmailDetailRow = {
  label: string;
  value: string;
  accent?: boolean;
};

const DISPLAY_FONT = "'Epilogue', 'Avenir Next', 'Segoe UI', Arial, sans-serif";
const BODY_FONT = "'Manrope', 'Segoe UI', Arial, sans-serif";
const BRAND_PINK = "#f31d5b";
const BRAND_PINK_DEEP = "#b90040";
const BRAND_PLUM = "#2d1b4e";
const BRAND_BORDER = "rgba(243,29,91,0.14)";
const BRAND_BORDER_SOFT = "rgba(243,29,91,0.08)";
const INK_PRIMARY = "#1c1b1c";
const INK_SECONDARY = "#5c3f42";
const INK_MUTED = "#7a6067";
const INK_FAINT = "#9d808b";

type EditorialSectionOptions = {
  eyebrow: string;
  title?: string;
  body: string;
};

type OrbitBandOptions = {
  eyebrow: string;
  title: string;
  body?: string;
  aside?: string;
};

type GonishEmailShellOptions = {
  badge: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  siteOrigin?: string;
  orbitLabel?: string;
  heroHighlights?: string[];
  footerNote?: string;
};

type PrimaryButtonOptions = {
  href: string;
  label: string;
  align?: "left" | "center";
};

type LogoRenderOptions = {
  variant?: "hero" | "footer";
};

export function normalizeEmailText(value: string) {
  return value.trim();
}

export function escapeEmailHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function safeEmailText(value: string, fallback = "-") {
  const normalized = normalizeEmailText(value);
  return escapeEmailHtml(normalized || fallback);
}

export function safeEmailMultiline(value: string, fallback = "-") {
  const normalized = normalizeEmailText(value);
  return escapeEmailHtml(normalized || fallback).replaceAll("\n", "<br/>");
}

export function splitEmailCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && item !== "-");
}

export function formatEmailDate(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function buildAbsoluteAssetUrl(origin: string | undefined, path: string) {
  const base = origin?.trim();
  if (!base) return "";

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function renderLogo(siteOrigin?: string, options?: LogoRenderOptions) {
  const logoUrl = buildAbsoluteAssetUrl(siteOrigin, "/Gonish_email_logo.png");
  const variant = options?.variant ?? "hero";
  const width = variant === "hero" ? 360 : 170;

  if (logoUrl) {
    return `
      <img
        src="${escapeEmailHtml(logoUrl)}"
        width="${width}"
        alt="Gonish"
        style="display:block;width:${width}px;max-width:${width}px;height:auto;margin:0 auto;border:0;"
      />`;
  }

  return `
    <div style="font-family:${DISPLAY_FONT};font-size:${variant === "hero" ? "44px" : "28px"};line-height:1;color:${BRAND_PLUM};font-weight:800;letter-spacing:-0.05em;text-align:center;">
      Gonish
    </div>`;
}

function renderHeroHighlights(items: string[]) {
  const filtered = items.map((item) => normalizeEmailText(item)).filter(Boolean);
  if (filtered.length === 0) return "";

  return `
    <div style="margin-top:18px;text-align:center;font-family:${BODY_FONT};font-size:12px;line-height:1.9;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${INK_FAINT};">
      ${filtered.map((item) => safeEmailText(item)).join(" &nbsp;&nbsp;·&nbsp;&nbsp; ")}
    </div>`;
}

function renderFooterLink(siteOrigin?: string) {
  const homepage = buildAbsoluteAssetUrl(siteOrigin, "/");
  if (!homepage) return "";

  return `
    <div style="margin-top:14px;">
      <a href="${safeEmailText(homepage, "")}" style="font-family:${BODY_FONT};font-size:11px;line-height:1.6;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND_PINK};text-decoration:none;">
        Gonish 둘러보기
      </a>
    </div>`;
}

export function renderDetailTable(items: EmailDetailRow[]) {
  const rows = items
    .filter((item) => normalizeEmailText(item.label) || normalizeEmailText(item.value))
    .map(
      ({ label, value, accent }) => `
        <tr>
          <td style="padding:14px 0;width:148px;vertical-align:top;font-family:${BODY_FONT};font-size:11px;line-height:1.5;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${INK_FAINT};">
            ${safeEmailText(label)}
          </td>
          <td style="padding:14px 0 14px 18px;vertical-align:top;font-family:${BODY_FONT};font-size:${accent ? "24px" : "14px"};line-height:${accent ? "1.25" : "1.9"};font-weight:${accent ? "800" : "700"};letter-spacing:${accent ? "-0.02em" : "0"};color:${accent ? BRAND_PINK : INK_PRIMARY};">
            ${safeEmailText(value)}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:0;">
            <div style="height:1px;background:${BRAND_BORDER_SOFT};"></div>
          </td>
        </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows}
    </table>`;
}

export function renderLineList(items: string[], emptyText = "정리 예정") {
  const filtered = items.map((item) => normalizeEmailText(item)).filter(Boolean);

  if (filtered.length === 0) {
    return `<div style="font-family:${BODY_FONT};font-size:14px;line-height:1.85;color:${INK_MUTED};">${safeEmailText(emptyText)}</div>`;
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${filtered
        .map(
          (item) => `
            <tr>
              <td width="18" style="padding:6px 0;vertical-align:top;font-family:${BODY_FONT};font-size:16px;line-height:1;color:${BRAND_PINK};">
                &bull;
              </td>
              <td style="padding:2px 0 10px 4px;font-family:${BODY_FONT};font-size:14px;line-height:1.85;color:${INK_PRIMARY};">
                ${safeEmailText(item)}
              </td>
            </tr>`,
        )
        .join("")}
    </table>`;
}

export function renderQuoteRail(content: string) {
  return `
    <div style="padding-left:18px;border-left:2px solid rgba(243,29,91,0.28);">
      <div style="font-family:${BODY_FONT};font-size:15px;line-height:2;color:${INK_SECONDARY};">
        ${content}
      </div>
    </div>`;
}

export function renderEditorialSection({ eyebrow, title, body }: EditorialSectionOptions) {
  return `
    <div style="margin-top:42px;padding-top:18px;border-top:1px solid ${BRAND_BORDER_SOFT};">
      <div style="font-family:${BODY_FONT};font-size:11px;line-height:1.4;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:rgba(185,0,64,0.62);">
        ${safeEmailText(eyebrow)}
      </div>
      ${
        title
          ? `
        <div style="margin-top:10px;font-family:${DISPLAY_FONT};font-size:28px;line-height:1.16;font-weight:800;letter-spacing:-0.03em;color:${INK_PRIMARY};">
          ${safeEmailText(title)}
        </div>`
          : ""
      }
      <div style="margin-top:${title ? "14px" : "10px"};">
        ${body}
      </div>
    </div>`;
}

export function renderOrbitBand({ eyebrow, title, body, aside }: OrbitBandOptions) {
  return `
    <div style="margin-top:42px;padding-top:18px;border-top:1px solid ${BRAND_BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="font-family:${BODY_FONT};font-size:11px;line-height:1.4;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:rgba(185,0,64,0.62);">
            ${safeEmailText(eyebrow)}
          </td>
          <td align="right" style="font-family:${BODY_FONT};font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${INK_FAINT};">
            ${aside ? safeEmailText(aside) : ""}
          </td>
        </tr>
      </table>
      <div style="margin-top:18px;font-family:${BODY_FONT};font-size:13px;line-height:1.5;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${INK_FAINT};">
        ${safeEmailText(title)}
      </div>
      ${
        body
          ? `
        <div style="margin-top:10px;font-family:${DISPLAY_FONT};font-size:44px;line-height:1.02;font-weight:800;letter-spacing:-0.05em;color:${BRAND_PINK};">
          ${safeEmailText(body)}
        </div>`
          : ""
      }
    </div>`;
}

export function renderPrimaryButton({ href, label, align = "center" }: PrimaryButtonOptions) {
  return `
    <div style="margin-top:24px;text-align:${align};">
      <a href="${safeEmailText(href, "")}" style="display:inline-block;padding:15px 28px;border-radius:16px;background:linear-gradient(135deg, ${BRAND_PINK} 0%, #ff6e9c 100%);box-shadow:0 18px 36px -16px rgba(243,29,91,0.28);font-family:${DISPLAY_FONT};font-size:15px;line-height:1.2;font-weight:800;letter-spacing:0.02em;color:#ffffff;text-decoration:none;">
        ${safeEmailText(label)}
      </a>
    </div>`;
}

export function buildGonishEmailShell({
  badge,
  eyebrow,
  title,
  subtitle,
  body,
  siteOrigin,
  orbitLabel,
  heroHighlights = [],
  footerNote = "Gonish에서 전해드리는 메일입니다.",
}: GonishEmailShellOptions) {
  void badge;
  void eyebrow;
  const orbitText = orbitLabel?.trim() || "안내 메일";

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeEmailText(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@500;700;800&family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:#fdf8f9;">
    <div style="background:radial-gradient(circle at 12% 8%, rgba(243,29,91,0.07) 0%, rgba(243,29,91,0) 28%), radial-gradient(circle at 88% 16%, rgba(124,77,255,0.06) 0%, rgba(124,77,255,0) 24%), linear-gradient(180deg, #fdf8f9 0%, #fff5f8 100%);">
      <div style="max-width:720px;margin:0 auto;padding:52px 20px 56px;">
        <div style="position:relative;">
          <div style="position:absolute;top:72px;left:-56px;width:240px;height:240px;border:1px solid rgba(243,29,91,0.06);border-radius:50%;"></div>
          <div style="position:absolute;top:224px;right:-30px;width:190px;height:190px;border:1px solid rgba(243,29,91,0.05);border-radius:50%;"></div>
          <div style="position:relative;z-index:1;">
            <div style="text-align:center;">
              ${renderLogo(siteOrigin, { variant: "hero" })}
            </div>

            <div style="margin-top:18px;text-align:center;font-family:${BODY_FONT};font-size:11px;line-height:1.7;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${INK_FAINT};">
              ${safeEmailText(orbitText)} &nbsp;&nbsp;·&nbsp;&nbsp; ${escapeEmailHtml(formatEmailDate())}
            </div>

            <div style="margin-top:24px;text-align:center;font-family:${DISPLAY_FONT};font-size:48px;line-height:1.04;font-weight:800;letter-spacing:-0.05em;color:${INK_PRIMARY};">
              ${safeEmailText(title)}
            </div>
            <div style="margin:20px auto 0;max-width:560px;text-align:center;font-family:${BODY_FONT};font-size:16px;line-height:1.95;color:${INK_SECONDARY};">
              ${safeEmailText(subtitle)}
            </div>
            ${renderHeroHighlights(heroHighlights)}

            <div style="margin:34px auto 0;max-width:520px;height:1px;background:linear-gradient(90deg, rgba(243,29,91,0) 0%, rgba(243,29,91,0.24) 50%, rgba(243,29,91,0) 100%);"></div>

            ${body}

            <div style="margin-top:68px;padding-top:22px;text-align:center;border-top:1px solid ${BRAND_BORDER_SOFT};">
              <div style="text-align:center;">
                ${renderLogo(siteOrigin, { variant: "footer" })}
              </div>
              <div style="margin-top:10px;font-family:${BODY_FONT};font-size:12px;line-height:1.85;color:${INK_MUTED};">
                ${safeEmailText(footerNote)}
              </div>
              ${renderFooterLink(siteOrigin)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
