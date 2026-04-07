import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildContactReplyDraft,
  buildEstimateReplyDraft,
  buildReplyEmailHtml,
  buildReplyEmailText,
  buildReplyPreview,
} from "@/lib/adminReply";
import { getEmailLogoAttachment } from "@/lib/emailBranding";
import { getPublicSiteOrigin } from "@/lib/publicSiteOrigin";
import { isValidReplyEmail } from "@/lib/replyContact";
import { getAdminDashboardKey, isAdminAuthenticated } from "@/lib/server/adminAuth";
import { getContactInquiryById, updateContactInquiryReply } from "@/lib/server/contactStore";
import { getEstimateLeadById, updateEstimateLeadPipeline } from "@/lib/server/leadStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SendReplyPayload = {
  kind?: string;
  inquiryId?: string;
  recipientEmail?: string;
  subject?: string;
  message?: string;
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toMultilineText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").trim();
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

export async function POST(request: Request) {
  if (!getAdminDashboardKey()) {
    return NextResponse.json({ ok: false, message: "ADMIN_DASHBOARD_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ ok: false, message: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  const resend = getResendClient();
  const receiveEmail = getReceiveEmail().trim();
  const fromEmail = getFromEmail().trim();
  const siteOrigin = getPublicSiteOrigin({ requestUrl: request.url, fromEmail });

  if (!resend || !receiveEmail || !fromEmail) {
    return NextResponse.json(
      { ok: false, message: "메일 발송을 위한 RESEND 설정이 완료되지 않았습니다. 환경 변수를 확인해 주세요." },
      { status: 500 },
    );
  }

  let body: SendReplyPayload;
  try {
    body = (await request.json()) as SendReplyPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  const kind = toText(body.kind);
  const inquiryId = toText(body.inquiryId);
  const recipientEmail = toText(body.recipientEmail);
  const subject = toText(body.subject);
  const message = toMultilineText(body.message);

  if (kind !== "contact" && kind !== "estimate") {
    return NextResponse.json({ ok: false, message: "지원하지 않는 문의 타입입니다." }, { status: 400 });
  }

  if (!inquiryId) {
    return NextResponse.json({ ok: false, message: "문의 ID가 필요합니다." }, { status: 400 });
  }

  if (!isValidReplyEmail(recipientEmail)) {
    return NextResponse.json({ ok: false, message: "받는 사람 이메일을 정확히 입력해 주세요." }, { status: 400 });
  }

  if (!subject) {
    return NextResponse.json({ ok: false, message: "메일 제목을 입력해 주세요." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ ok: false, message: "메일 본문을 입력해 주세요." }, { status: 400 });
  }

  const replyTo = isValidReplyEmail(receiveEmail) ? receiveEmail : undefined;
  let warning = "";

  if (kind === "estimate") {
    const lead = await getEstimateLeadById(inquiryId);

    if (!lead) {
      return NextResponse.json({ ok: false, message: "견적 문의를 찾을 수 없습니다." }, { status: 404 });
    }

    const draft = buildEstimateReplyDraft(lead);

    try {
      await resend.emails.send({
        from: fromEmail,
        to: [recipientEmail],
        replyTo,
        subject,
        html: buildReplyEmailHtml(draft, message, receiveEmail, { siteOrigin }),
        text: buildReplyEmailText(draft, message, receiveEmail),
        attachments: [getEmailLogoAttachment()],
      });
    } catch {
      return NextResponse.json({ ok: false, message: "메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
    }

    try {
      const nextStatus = lead.pipelineStatus === "new" ? "first_reply_sent" : undefined;
      const updatedLead = await updateEstimateLeadPipeline(inquiryId, {
        pipelineStatus: nextStatus,
        lastContactedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ok: true,
        message: "답변 메일을 발송했습니다.",
        warning,
        lead: updatedLead
          ? {
              id: updatedLead.id,
              pipelineStatus: updatedLead.pipelineStatus,
              lastContactedAt: updatedLead.lastContactedAt,
            }
          : undefined,
      });
    } catch (error) {
      console.error("[POST /api/admin/replies] pipeline update failed", inquiryId, error);
      warning = "메일은 발송되었지만 운영 상태 업데이트에 실패했습니다.";
    }

    return NextResponse.json({
      ok: true,
      message: "답변 메일을 발송했습니다.",
      warning,
    });
  }

  const inquiry = await getContactInquiryById(inquiryId);

  if (!inquiry) {
    return NextResponse.json({ ok: false, message: "일반 문의를 찾을 수 없습니다." }, { status: 404 });
  }

  const draft = buildContactReplyDraft(inquiry);

  try {
    await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      replyTo,
      subject,
      html: buildReplyEmailHtml(draft, message, receiveEmail, { siteOrigin }),
      text: buildReplyEmailText(draft, message, receiveEmail),
      attachments: [getEmailLogoAttachment()],
    });
  } catch {
    return NextResponse.json({ ok: false, message: "메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  try {
    const updatedInquiry = await updateContactInquiryReply(inquiryId, {
      lastRepliedAt: new Date().toISOString(),
      lastReplySubject: subject,
      lastReplyPreview: buildReplyPreview(message),
    });

    return NextResponse.json({
      ok: true,
      message: "답변 메일을 발송했습니다.",
      warning,
      inquiry: updatedInquiry
        ? {
            id: updatedInquiry.id,
            lastRepliedAt: updatedInquiry.lastRepliedAt,
            lastReplySubject: updatedInquiry.lastReplySubject,
            lastReplyPreview: updatedInquiry.lastReplyPreview,
          }
        : undefined,
    });
  } catch (error) {
    console.error("[POST /api/admin/replies] reply record update failed", inquiryId, error);
    warning = "메일은 발송되었지만 답변 이력 저장에 실패했습니다.";
  }

  return NextResponse.json({
    ok: true,
    message: "답변 메일을 발송했습니다.",
    warning,
  });
}
