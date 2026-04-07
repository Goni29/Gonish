import {
  buildGonishEmailShell,
  escapeEmailHtml,
  renderDetailTable,
  renderEditorialSection,
  renderQuoteRail,
  safeEmailSmartText,
  safeEmailText,
  splitEmailCsv,
} from "@/lib/emailBranding";
import type { ContactInquiryRecord, EstimateLeadRecord } from "@/lib/inquiry";
import { isValidReplyEmail } from "@/lib/replyContact";

export type InquiryReplyKind = "contact" | "estimate";

export type ReplySummaryItem = {
  label: string;
  value: string;
};

export type InquiryReplyDraft = {
  kind: InquiryReplyKind;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  message: string;
  badge: string;
  heading: string;
  summaryItems: ReplySummaryItem[];
};

type ReplyEmailHtmlOptions = {
  siteOrigin?: string;
};

function normalize(value: string) {
  return value.trim();
}

function toDisplayText(value: string, fallback = "미정") {
  const normalized = normalize(value);
  return normalized || fallback;
}

function firstNonEmpty(values: string[], fallback: string) {
  for (const value of values) {
    const normalized = normalize(value);
    if (normalized) {
      return normalized;
    }
  }
  return fallback;
}

function csvToDisplay(value: string, fallback: string) {
  const items = splitEmailCsv(value);
  return items.length > 0 ? items.join(", ") : fallback;
}

function toReplyRecipient(value: string) {
  const normalized = normalize(value);
  return isValidReplyEmail(normalized) ? normalized : "";
}

function renderMessageBlocks(message: string) {
  const blocks = normalize(message)
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return renderQuoteRail("메시지 내용이 비어 있습니다.");
  }

  const renderedParts: string[] = [];
  const textBlocks: string[] = [];

  const flushTextBlocks = () => {
    if (textBlocks.length === 0) return;
    renderedParts.push(renderQuoteRail(textBlocks.join('<div style="height:16px;line-height:16px;">&nbsp;</div>')));
    textBlocks.length = 0;
  };

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
      flushTextBlocks();
      renderedParts.push(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:4px;">
          ${lines
            .map(
              (line) => `
                <tr>
                  <td width="18" style="padding:6px 0;vertical-align:top;">
                    <span style="display:inline-block;width:7px;height:7px;border-radius:999px;background:#f31d5b;"></span>
                  </td>
                  <td style="padding:3px 0 6px;font-size:14px;line-height:1.9;color:#5c3f42;">
                    ${safeEmailSmartText(line.slice(2).trim(), "-", { maxCharsPerLine: 26, maxLines: 3, minCharsPerLine: 10 })}
                  </td>
                </tr>`,
            )
            .join("")}
        </table>`);
      continue;
    }

    textBlocks.push(
      `<div>${lines
        .map((line) => safeEmailSmartText(line, "-", { maxCharsPerLine: 30, maxLines: 4, minCharsPerLine: 12 }))
        .join("<br/>")}</div>`,
    );
  }

  flushTextBlocks();

  return renderedParts.join('<div style="height:16px;line-height:16px;">&nbsp;</div>');
}

function buildReplyGuide() {
  return "추가로 전하고 싶은 내용이나 참고 자료가 있으면 이 메일에 답장으로 보내 주세요. 확인 후 다음 안내에 반영해 드릴게요.";
}

export function buildReplyPreview(message: string, limit = 160) {
  const compact = message.replace(/\s+/g, " ").trim();
  if (compact.length <= limit) {
    return compact;
  }

  return `${compact.slice(0, Math.max(0, limit - 3)).trim()}...`;
}

export function buildReplyEmailText(draft: InquiryReplyDraft, message: string, receiveEmail: string) {
  void receiveEmail;
  const summary = draft.summaryItems.map((item) => `- ${item.label}: ${item.value}`).join("\n");

  return [
    draft.heading,
    "",
    `${draft.recipientName}님께,`,
    "",
    normalize(message),
    "",
    "문의 주신 내용",
    summary,
    "",
    buildReplyGuide(),
    "",
    "감사합니다.",
    "Gonish 드림",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildReplyEmailHtml(
  draft: InquiryReplyDraft,
  message: string,
  receiveEmail: string,
  options?: ReplyEmailHtmlOptions,
) {
  void receiveEmail;
  const replyBadge = draft.kind === "estimate" ? "견적 문의 답장" : "문의 답장";

  const body = [
    renderEditorialSection({
      eyebrow: "답변",
      title: "먼저 답변드릴게요",
      body: renderMessageBlocks(message),
    }),
    renderEditorialSection({
      eyebrow: "문의 내용",
      title: "현재 이렇게 이해하고 있어요",
      body: renderDetailTable(draft.summaryItems),
    }),
    renderEditorialSection({
      eyebrow: "안내",
      title: "추가로 필요한 내용이 있으면 편하게 답장해 주세요",
      body: `
        <div style="font-size:14px;line-height:1.9;color:#5c3f42;">
          ${safeEmailSmartText(buildReplyGuide(), "-", { maxCharsPerLine: 30, maxLines: 4, minCharsPerLine: 12 })}
        </div>
      `,
    }),
  ].join("");

  return buildGonishEmailShell({
    badge: replyBadge,
    eyebrow: "Gonish",
    title: draft.heading,
    subtitle: `${draft.recipientName}님, 문의 주신 내용 잘 읽어보았습니다. 먼저 확인한 내용을 정리해 보내드리니, 다른 점이 있거나 더 전하고 싶은 내용이 있으면 이 메일에 편하게 답장해 주세요.`,
    siteOrigin: options?.siteOrigin,
    orbitLabel: draft.kind === "estimate" ? "견적 문의" : "일반 문의",
    heroHighlights: [],
    footerNote: "궁금하신 점이나 참고 자료가 있으면 이 메일에 이어서 편하게 보내 주세요.",
    body,
  });
}

export function buildEstimateReplyDraft(lead: EstimateLeadRecord): InquiryReplyDraft {
  const projectName = firstNonEmpty(
    [lead.emailData.brand, lead.contractDraft.projectTitle, lead.emailData.projectType],
    "프로젝트",
  );
  const recipientName = firstNonEmpty([lead.contractDraft.clientName, lead.emailData.name], "고객");

  return {
    kind: "estimate",
    recipientName,
    recipientEmail: toReplyRecipient(lead.emailData.reply),
    subject: `[Gonish] ${projectName} 관련 문의 잘 받았습니다`,
    message: [
      "안녕하세요, Gonish입니다.",
      "",
      `${projectName} 관련 문의 잘 받았습니다.`,
      "남겨주신 내용을 바탕으로 우선 방향을 정리해 보았고, 현재는 아래와 같이 이해하고 있어요.",
      "",
      `- 프로젝트 유형: ${toDisplayText(lead.emailData.projectType)}`,
      `- 페이지 범위: ${toDisplayText(lead.emailData.pageScope, "조율 예정")}`,
      `- 주요 기능: ${csvToDisplay(lead.emailData.features, "기본 문의 중심")}`,
      `- 예산 범위: ${toDisplayText(lead.emailData.priceRange || lead.emailData.basePrice, "범위 조율 예정")}`,
      `- 희망 일정: ${toDisplayText(lead.emailData.schedule, "일정 조율 예정")}`,
      "",
      "혹시 제가 이해한 내용과 다른 부분이 있거나, 꼭 반영하고 싶은 참고 사례가 있다면 편하게 회신 주세요.",
      "확인 후 범위와 일정 안내를 조금 더 구체적으로 정리해서 다시 보내드리겠습니다.",
      "",
      "감사합니다.",
      "Gonish 드림",
    ].join("\n"),
    badge: "견적 문의 답장",
    heading: `${projectName} 관련 문의 잘 받았습니다`,
    summaryItems: [
      { label: "프로젝트 유형", value: toDisplayText(lead.emailData.projectType) },
      { label: "페이지 범위", value: toDisplayText(lead.emailData.pageScope, "조율 예정") },
      { label: "주요 기능", value: csvToDisplay(lead.emailData.features, "기본 문의 중심") },
      { label: "예산 범위", value: toDisplayText(lead.emailData.priceRange || lead.emailData.basePrice, "범위 조율 예정") },
      { label: "희망 일정", value: toDisplayText(lead.emailData.schedule, "일정 조율 예정") },
      { label: "자료 준비 상태", value: toDisplayText(lead.emailData.readiness, "확인 예정") },
    ],
  };
}

export function buildContactReplyDraft(inquiry: ContactInquiryRecord): InquiryReplyDraft {
  const projectName = firstNonEmpty([inquiry.form.project], "문의");
  const recipientName = firstNonEmpty([inquiry.form.name], "고객");

  return {
    kind: "contact",
    recipientName,
    recipientEmail: toReplyRecipient(inquiry.form.reply),
    subject: `[Gonish] ${projectName} 관련 문의 잘 받았습니다`,
    message: [
      "안녕하세요, Gonish입니다.",
      "",
      "문의 남겨주셔서 감사합니다.",
      "전해 주신 내용을 읽어 보았고, 현재는 아래 방향으로 이해하고 있어요.",
      "",
      `- 문의 주제: ${toDisplayText(inquiry.form.project, "상담 문의")}`,
      `- 원하는 분위기: ${toDisplayText(inquiry.form.tone, "정리 예정")}`,
      `- 회신 연락처: ${toDisplayText(inquiry.form.reply, "미입력")}`,
      "",
      "추가로 참고할 레퍼런스나 꼭 전하고 싶은 요청사항이 있다면 이 메일에 편하게 이어서 남겨 주세요.",
      "확인 후 다음 답장에서 방향과 진행 범위를 조금 더 구체적으로 정리해 드리겠습니다.",
      "",
      "감사합니다.",
      "Gonish 드림",
    ].join("\n"),
    badge: "문의 답장",
    heading: `${projectName} 관련 문의 잘 받았습니다`,
    summaryItems: [
      { label: "문의 주제", value: toDisplayText(inquiry.form.project, "상담 문의") },
      { label: "원하는 분위기", value: toDisplayText(inquiry.form.tone, "정리 예정") },
      { label: "회신 연락처", value: toDisplayText(inquiry.form.reply, "미입력") },
      { label: "문의 내용", value: toDisplayText(inquiry.form.message, "미입력") },
    ],
  };
}
