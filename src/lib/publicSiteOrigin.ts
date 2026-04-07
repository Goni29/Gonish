const LOCAL_HOSTNAME_REGEX = /^(localhost|0\.0\.0\.0|127(?:\.\d{1,3}){3})$/i;
const PREVIEW_HOSTNAME_REGEX = /\.vercel\.app$/i;

function normalizeOrigin(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return "";
  }
}

function isPrivateIpv4(hostname: string) {
  const octets = hostname.split(".").map((segment) => Number.parseInt(segment, 10));

  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPublicOrigin(origin: string) {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return false;
    }

    if (hostname === "::1" || hostname === "[::1]") {
      return false;
    }

    if (LOCAL_HOSTNAME_REGEX.test(hostname) || hostname.endsWith(".local") || isPrivateIpv4(hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function extractEmailAddress(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const angleMatch = trimmed.match(/<([^>]+)>/);
  const candidate = angleMatch?.[1] ?? trimmed;
  const emailMatch = candidate.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return emailMatch?.[0]?.toLowerCase() ?? "";
}

function getSenderDomainOrigin(fromEmail?: string) {
  const email = extractEmailAddress(fromEmail);
  if (!email.includes("@")) return "";

  const domain = email.split("@")[1];
  const origin = normalizeOrigin(domain);

  return origin && isPublicOrigin(origin) ? origin : "";
}

type PublicSiteOriginOptions = {
  requestUrl?: string;
  fromEmail?: string;
};

export function getPublicSiteOrigin({ requestUrl, fromEmail }: PublicSiteOriginOptions) {
  const explicitCandidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];

  for (const candidate of explicitCandidates) {
    const origin = normalizeOrigin(candidate);
    if (origin && isPublicOrigin(origin)) {
      return origin;
    }
  }

  const requestOrigin = normalizeOrigin(requestUrl);
  const senderDomainOrigin = getSenderDomainOrigin(fromEmail);

  if (requestOrigin && isPublicOrigin(requestOrigin)) {
    const requestHostname = new URL(requestOrigin).hostname.toLowerCase();

    if (PREVIEW_HOSTNAME_REGEX.test(requestHostname) && senderDomainOrigin) {
      return senderDomainOrigin;
    }

    return requestOrigin;
  }

  return senderDomainOrigin;
}
