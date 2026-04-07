import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getEmailLogoAttachment } from "@/lib/emailBranding";
import {
  contactEmailHtml,
  contactReceiptEmailHtml,
  estimateEmailHtml,
  estimateReceiptEmailHtml,
} from "@/lib/emailTemplate";
import type { InquiryPayload, InquiryResponse } from "@/lib/inquiry";
import { getPublicSiteOrigin } from "@/lib/publicSiteOrigin";
import { isValidReplyContact, isValidReplyEmail, REPLY_CONTACT_VALIDATION_MESSAGE } from "@/lib/replyContact";
import { createContactInquiry } from "@/lib/server/contactStore";
import { createEstimateLead } from "@/lib/server/leadStore";
import { checkRateLimit, getClientIp, RATE_LIMIT } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(status: number, body: InquiryResponse) {
  return NextResponse.json(body, { status });
}

function getReceiveEmail() {
  return process.env.CONTACT_RECEIVE_EMAIL || "";
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "";
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

// 필드별 최대 길이 제한
const FIELD_LIMITS = {
  name:          100,
  project:       200,
  tone:          200,
  reply:         200,
  message:      3000,
  brand:         100,
  projectType:   100,
  pageScope:     100,
  features:     1000,
  readiness:     100,
  schedule:      100,
  domainHosting: 200,
  discounts:     500,
  basePrice:     100,
  priceRange:    100,
  goal:         2000,
  note:         2000,
} as const;

function isNonEmpty(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function checkLength(value: string, field: keyof typeof FIELD_LIMITS): string | null {
  const max = FIELD_LIMITS[field];
  if (value.length > max) {
    return `${field} 항목이 너무 깁니다. (최대 ${max}자)`;
  }
  return null;
}

export async function POST(request: Request) {
  // Rate limiting: 10분에 3회
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(
    ip,
    "inquiries",
    RATE_LIMIT.INQUIRIES.windowSecs,
    RATE_LIMIT.INQUIRIES.maxRequests,
  );
  if (!allowed) {
    return jsonResponse(429, { ok: false, message: "잠시 후 다시 시도해 주세요." });
  }

  const resend = getResendClient();
  const receiveEmail = getReceiveEmail();
  const fromEmail = getFromEmail();
  const siteOrigin = getPublicSiteOrigin({ requestUrl: request.url, fromEmail });
  const internalReplyTo = isValidReplyEmail(receiveEmail) ? receiveEmail : undefined;

  if (!resend || !receiveEmail || !fromEmail) {
    return jsonResponse(500, {
      ok: false,
      message: "문의 채널 환경설정이 완료되지 않았습니다. 관리자 설정을 확인해 주세요.",
    });
  }

  let payload: InquiryPayload;

  try {
    payload = (await request.json()) as InquiryPayload;
  } catch {
    return jsonResponse(400, { ok: false, message: "요청 본문을 읽을 수 없습니다." });
  }

  if (payload.kind === "contact") {
    const form = payload.form;

    if (!isNonEmpty(form.reply)) {
      return jsonResponse(400, { ok: false, message: "회신받을 연락처가 필요합니다." });
    }

    const sanitizedForm = {
      name: toText(form.name),
      project: toText(form.project),
      tone: toText(form.tone),
      reply: toText(form.reply),
      message: toText(form.message),
    };

    // 길이 검증
    for (const field of ["name", "project", "tone", "reply", "message"] as const) {
      const err = checkLength(sanitizedForm[field], field);
      if (err) return jsonResponse(400, { ok: false, message: err });
    }

    if (!isValidReplyContact(sanitizedForm.reply)) {
      return jsonResponse(400, {
        ok: false,
        message: REPLY_CONTACT_VALIDATION_MESSAGE,
      });
    }

    try {
      await createContactInquiry(sanitizedForm);
    } catch {
      return jsonResponse(500, { ok: false, message: "문의 저장에 실패했어요. 잠시 후 다시 시도해 주세요." });
    }

    const subject = `[Gonish 문의] ${toText(form.project) || toText(form.name) || "새 프로젝트"}`;
    const customerReceiptSubject = `[Gonish] ${toText(form.project) || "문의"} 문의가 접수되었습니다`;

    try {
      const adminEmailPromise = resend.emails.send({
        from: fromEmail,
        to: [receiveEmail],
        replyTo: isValidReplyEmail(sanitizedForm.reply) ? sanitizedForm.reply : undefined,
        subject,
        html: contactEmailHtml(sanitizedForm, { siteOrigin }),
        attachments: [getEmailLogoAttachment()],
      });

      const customerReceiptPromise = isValidReplyEmail(sanitizedForm.reply)
        ? resend.emails
            .send({
              from: fromEmail,
              to: [sanitizedForm.reply],
              replyTo: internalReplyTo,
              subject: customerReceiptSubject,
              html: contactReceiptEmailHtml(sanitizedForm, { siteOrigin }),
              attachments: [getEmailLogoAttachment()],
            })
            .catch(() => undefined)
        : Promise.resolve(undefined);

      await Promise.all([adminEmailPromise, customerReceiptPromise]);
    } catch {
      return jsonResponse(502, { ok: false, message: "메일 발송에 실패했어요. 잠시 후 다시 시도해 주세요." });
    }

    return jsonResponse(200, {
      ok: true,
      message: "문의가 전송됐어요. 남겨주신 내용을 바탕으로 곧 회신드릴게요.",
    });
  }

  if (payload.kind === "estimate") {
    const emailData = payload.emailData;
    const contractDraft = payload.contractDraft;

    if (!isNonEmpty(emailData.reply)) {
      return jsonResponse(400, { ok: false, message: "회신받을 연락처가 필요합니다." });
    }

    const sanitizedEmailData = {
      ...emailData,
      name: toText(emailData.name),
      brand: toText(emailData.brand),
      reply: toText(emailData.reply),
      projectType: toText(emailData.projectType),
      pageScope: toText(emailData.pageScope),
      features: toText(emailData.features),
      readiness: toText(emailData.readiness),
      schedule: toText(emailData.schedule),
      domainHosting: toText(emailData.domainHosting),
      discounts: toText(emailData.discounts),
      basePrice: toText(emailData.basePrice),
      priceRange: toText(emailData.priceRange),
      goal: toText(emailData.goal),
      note: toText(emailData.note),
    };

    // 길이 검증
    for (const field of [
      "name", "brand", "reply", "projectType", "pageScope",
      "features", "readiness", "schedule", "domainHosting",
      "discounts", "basePrice", "priceRange", "goal", "note",
    ] as const) {
      const err = checkLength(sanitizedEmailData[field], field);
      if (err) return jsonResponse(400, { ok: false, message: err });
    }

    if (!isValidReplyContact(sanitizedEmailData.reply)) {
      return jsonResponse(400, {
        ok: false,
        message: REPLY_CONTACT_VALIDATION_MESSAGE,
      });
    }

    const sanitizedContractDraft = {
      ...contractDraft,
      projectTitle: toText(contractDraft.projectTitle),
      clientName: toText(contractDraft.clientName),
      clientContact: toText(contractDraft.clientContact),
      projectTypeLabel: toText(contractDraft.projectTypeLabel),
      pageScopeLabel: toText(contractDraft.pageScopeLabel),
      readinessLabel: toText(contractDraft.readinessLabel),
      scheduleLabel: toText(contractDraft.scheduleLabel),
      domainHostingLabel: toText(contractDraft.domainHostingLabel),
      domainHostingNote: toText(contractDraft.domainHostingNote),
      estimateBandLabel: toText(contractDraft.estimateBandLabel),
      estimateBandDescription: toText(contractDraft.estimateBandDescription),
      basePriceLabel: toText(contractDraft.basePriceLabel),
      priceRangeLabel: toText(contractDraft.priceRangeLabel),
      scopeText: toText(contractDraft.scopeText),
      timeline: toText(contractDraft.timeline),
      quoteLabel: toText(contractDraft.quoteLabel),
      depositLabel: toText(contractDraft.depositLabel),
      balanceLabel: toText(contractDraft.balanceLabel),
      revisionPolicy: toText(contractDraft.revisionPolicy),
      contractExtra: toText(contractDraft.contractExtra),
      goal: toText(contractDraft.goal),
      note: toText(contractDraft.note),
      featureLabels: Array.isArray(contractDraft.featureLabels)
        ? contractDraft.featureLabels.filter((label) => isNonEmpty(label)).map((label) => label.trim())
        : [],
      discountLabels: Array.isArray(contractDraft.discountLabels)
        ? contractDraft.discountLabels.filter((label) => isNonEmpty(label)).map((label) => label.trim())
        : [],
    };

    let lead;
    try {
      lead = await createEstimateLead({
        emailData: sanitizedEmailData,
        contractDraft: sanitizedContractDraft,
      });
    } catch {
      return jsonResponse(500, { ok: false, message: "견적 문의 저장에 실패했어요. 잠시 후 다시 시도해 주세요." });
    }

    const contractUrl = new URL(`/admin/contracts/${lead.id}`, request.url);
    contractUrl.searchParams.set("key", lead.viewKey);

    const subject = `[Gonish 견적 문의] ${lead.emailData.brand || lead.emailData.name || lead.emailData.projectType || "새 프로젝트"}`;
    const customerReceiptSubject = `[Gonish] ${lead.emailData.brand || lead.emailData.name || "견적"} 견적 문의가 접수되었습니다`;

    try {
      const adminEmailPromise = resend.emails.send({
        from: fromEmail,
        to: [receiveEmail],
        replyTo: isValidReplyEmail(lead.emailData.reply) ? lead.emailData.reply : undefined,
        subject,
        html: estimateEmailHtml(lead.emailData, {
          contractUrl: contractUrl.toString(),
          siteOrigin,
        }),
        attachments: [getEmailLogoAttachment()],
      });

      const customerReceiptPromise = isValidReplyEmail(lead.emailData.reply)
        ? resend.emails
            .send({
              from: fromEmail,
              to: [lead.emailData.reply],
              replyTo: internalReplyTo,
              subject: customerReceiptSubject,
              html: estimateReceiptEmailHtml(lead.emailData, {
                siteOrigin,
              }),
              attachments: [getEmailLogoAttachment()],
            })
            .catch(() => undefined)
        : Promise.resolve(undefined);

      await Promise.all([adminEmailPromise, customerReceiptPromise]);
    } catch {
      return jsonResponse(502, { ok: false, message: "메일 발송에 실패했어요. 잠시 후 다시 시도해 주세요." });
    }

    return jsonResponse(200, {
      ok: true,
      message: "견적 문의가 전송됐어요. 메일 본문의 '계약서 초안 열기'로 바로 내보내기를 진행할 수 있어요.",
      contractUrl: contractUrl.toString(),
    });
  }

  return jsonResponse(400, { ok: false, message: "지원하지 않는 문의 유형입니다." });
}
