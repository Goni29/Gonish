import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactEmailHtml, estimateEmailHtml } from "@/lib/emailTemplate";
import type { InquiryPayload, InquiryResponse } from "@/lib/inquiry";
import { isValidReplyContact, isValidReplyEmail, REPLY_CONTACT_VALIDATION_MESSAGE } from "@/lib/replyContact";
import { createContactInquiry } from "@/lib/server/contactStore";
import { createEstimateLead } from "@/lib/server/leadStore";

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

function getSiteOrigin(requestUrl: string) {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";

  if (explicit.trim()) {
    const normalized = explicit.trim();
    return normalized.startsWith("http") ? normalized : `https://${normalized}`;
  }

  try {
    return new URL(requestUrl).origin;
  } catch {
    return "";
  }
}

function isNonEmpty(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const resend = getResendClient();
  const receiveEmail = getReceiveEmail();
  const fromEmail = getFromEmail();
  const siteOrigin = getSiteOrigin(request.url);

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

    try {
      await resend.emails.send({
        from: fromEmail,
        to: [receiveEmail],
        replyTo: isValidReplyEmail(sanitizedForm.reply) ? sanitizedForm.reply : undefined,
        subject,
        html: contactEmailHtml(sanitizedForm, { siteOrigin }),
      });
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

    try {
      await resend.emails.send({
        from: fromEmail,
        to: [receiveEmail],
        replyTo: isValidReplyEmail(lead.emailData.reply) ? lead.emailData.reply : undefined,
        subject,
        html: estimateEmailHtml(lead.emailData, {
          contractUrl: contractUrl.toString(),
          siteOrigin,
        }),
      });
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
