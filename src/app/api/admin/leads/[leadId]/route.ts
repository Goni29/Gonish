import { NextResponse } from "next/server";
import { isEstimatePipelineStatus, type EstimatePipelineStatus } from "@/lib/leadPipeline";
import { getAdminDashboardKey, isAdminAuthenticated } from "@/lib/server/adminAuth";
import { updateEstimateLeadPipeline } from "@/lib/server/leadStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MaybePromise<T> = Promise<T> | T;

type RouteParams = {
  params: MaybePromise<{ leadId: string }>;
};

type UpdateLeadPayload = {
  pipelineStatus?: string;
  assignedTo?: string;
  nextActionAt?: string | null;
  lastContactedAt?: string | null;
  internalNote?: string;
  closeReason?: string;
  archived?: boolean;
  basePrice?: string;
  priceRange?: string;
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableDateInput(value: unknown) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;
  return value.trim();
}

export async function PATCH(request: Request, context: RouteParams) {
  if (!getAdminDashboardKey()) {
    return NextResponse.json({ ok: false, message: "ADMIN_DASHBOARD_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ ok: false, message: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  const resolvedParams = await context.params;
  const leadId = (resolvedParams.leadId || "").trim();
  if (!leadId) {
    return NextResponse.json({ ok: false, message: "리드 ID가 필요합니다." }, { status: 400 });
  }

  let body: UpdateLeadPayload;
  try {
    body = (await request.json()) as UpdateLeadPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  let pipelineStatus: EstimatePipelineStatus | undefined;
  if (body.pipelineStatus !== undefined) {
    const candidate = toText(body.pipelineStatus);
    if (!isEstimatePipelineStatus(candidate)) {
      return NextResponse.json({ ok: false, message: "지원하지 않는 상태값입니다." }, { status: 400 });
    }
    pipelineStatus = candidate;
  }

  const patch = {
    pipelineStatus,
    assignedTo: body.assignedTo !== undefined ? toText(body.assignedTo) : undefined,
    nextActionAt: toNullableDateInput(body.nextActionAt),
    lastContactedAt: toNullableDateInput(body.lastContactedAt),
    internalNote: body.internalNote !== undefined ? toText(body.internalNote) : undefined,
    closeReason: body.closeReason !== undefined ? toText(body.closeReason) : undefined,
    archived: typeof body.archived === "boolean" ? body.archived : undefined,
    basePrice: body.basePrice !== undefined ? toText(body.basePrice) : undefined,
    priceRange: body.priceRange !== undefined ? toText(body.priceRange) : undefined,
  } as const;

  const hasChanges = Object.values(patch).some((value) => value !== undefined);
  if (!hasChanges) {
    return NextResponse.json({ ok: false, message: "변경할 값이 없습니다." }, { status: 400 });
  }

  try {
    const updated = await updateEstimateLeadPipeline(leadId, patch);
    if (!updated) {
      return NextResponse.json({ ok: false, message: "대상 리드를 찾지 못했습니다." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: "리드 운영 상태를 저장했어요.",
      lead: {
        id: updated.id,
        pipelineStatus: updated.pipelineStatus,
        assignedTo: updated.assignedTo,
        nextActionAt: updated.nextActionAt,
        lastContactedAt: updated.lastContactedAt,
        internalNote: updated.internalNote,
        closeReason: updated.closeReason,
        archived: updated.archived,
        updatedAt: updated.updatedAt,
        basePrice: updated.emailData.basePrice,
        priceRange: updated.emailData.priceRange,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/admin/leads]", leadId, error);
    return NextResponse.json({ ok: false, message: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
