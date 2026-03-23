type Row = { label: string; value: string };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(value: string) {
  return value.trim();
}

function safeText(value: string, fallback = "-") {
  const normalized = normalizeText(value);
  if (!normalized) return fallback;
  return escapeHtml(normalized);
}

function safeMultiline(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return "";
  return escapeHtml(normalized).replaceAll("\n", "<br/>");
}

function rows(items: Row[]) {
  return items
    .map(
      ({ label, value }) => `
      <tr>
        <td style="padding:10px 12px;font-size:11px;font-weight:700;color:#665C63;letter-spacing:0.6px;width:130px;border-bottom:1px solid #f0ecee;vertical-align:top">${safeText(label)}</td>
        <td style="padding:10px 12px;font-size:13px;color:#141014;line-height:1.6;border-bottom:1px solid #f0ecee">${safeText(value)}</td>
      </tr>`,
    )
    .join("");
}

function wrap(badge: string, title: string, body: string) {
  return `
<div style="max-width:620px;margin:0 auto;font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;background:#FFFDFC;border:1px solid rgba(20,16,20,0.08);border-radius:22px;overflow:hidden">
  <div style="padding:24px 28px;border-bottom:2px solid #F31D5B;background:linear-gradient(180deg,#fffdfd 0%,#fff7fa 100%);display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:22px;font-weight:700;color:#F31D5B;letter-spacing:1.6px">Gonish</span>
    <span style="background:#F31D5B;color:#fff;padding:5px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:1.2px;float:right">${safeText(badge)}</span>
  </div>
  <div style="padding:22px 28px 0">
    <div style="font-size:20px;font-weight:700;color:#141014;margin-bottom:4px">${safeText(title)}</div>
    <div style="font-size:11px;color:#665C63">${new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
  <div style="padding:18px 28px 28px">
    ${body}
  </div>
  <div style="padding:14px 28px;border-top:1px solid #f0ecee;display:flex;justify-content:space-between;align-items:center;background:#fff9fb">
    <span style="font-size:10px;color:#665C63">Gonish | Custom Web Design & Development</span>
    <span style="display:inline-block;width:6px;height:6px;border-radius:3px;background:#F31D5B;float:right"></span>
  </div>
</div>`;
}

export function contactEmailHtml(form: {
  name: string;
  project: string;
  tone: string;
  reply: string;
  message: string;
}) {
  const tableRows = rows([
    { label: "Name", value: form.name },
    { label: "Contact", value: form.reply },
    { label: "Project", value: form.project },
    { label: "Mood", value: form.tone },
  ]);

  const body = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">${tableRows}</table>
    <div style="padding:16px 20px;background:#faf7f8;border-radius:8px;border-left:3px solid #F31D5B">
      <div style="font-size:10px;font-weight:700;color:#F31D5B;letter-spacing:1.4px;margin-bottom:8px">MESSAGE</div>
      <div style="font-size:13px;color:#141014;line-height:1.7;white-space:pre-wrap">${safeMultiline(form.message) || "내용 없음"}</div>
    </div>`;

  return wrap("PROJECT INQUIRY", form.project || "새 프로젝트 문의", body);
}

export function estimateEmailHtml(
  data: {
    name: string;
    brand: string;
    reply: string;
    projectType: string;
    pageScope: string;
    features: string;
    readiness: string;
    schedule: string;
    domainHosting: string;
    discounts: string;
    basePrice: string;
    priceRange: string;
    goal: string;
    note: string;
  },
  options?: { contractUrl?: string },
) {
  const clientRows = rows([
    { label: "이름", value: data.name },
    { label: "브랜드명", value: data.brand },
    { label: "연락처", value: data.reply },
  ]);

  const scopeRows = rows([
    { label: "프로젝트 유형", value: data.projectType },
    { label: "추가 화면 구성", value: data.pageScope },
    { label: "추가 기능", value: data.features },
    { label: "자료 준비 상태", value: data.readiness },
    { label: "희망 일정", value: data.schedule },
    { label: "도메인/호스팅", value: data.domainHosting },
    { label: "적용 혜택", value: data.discounts },
  ]);

  const featureTags = data.features
    .split(",")
    .map((feature) => normalizeText(feature))
    .filter((feature) => feature && feature !== "-");

  const discountTags = data.discounts
    .split(",")
    .map((discount) => normalizeText(discount))
    .filter((discount) => discount && discount !== "-");

  const contractUrl = options?.contractUrl ? escapeHtml(options.contractUrl) : "";

  const body = `
    <div style="border:1px solid rgba(243,29,91,0.14);background:#fff5f8;border-radius:16px;padding:16px 18px;margin-bottom:18px">
      <div style="font-size:10px;font-weight:700;color:#665C63;letter-spacing:1.4px;margin-bottom:8px">예상 시작가</div>
      <div style="font-size:30px;line-height:1;font-weight:700;color:#F31D5B">${safeText(data.basePrice)}</div>
      <div style="margin-top:8px;font-size:12px;color:#665C63">${safeText(data.priceRange)}</div>
    </div>

    <div style="font-size:10px;font-weight:700;color:#F31D5B;letter-spacing:1.4px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #f0ecee">CLIENT</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">${clientRows}</table>

    <div style="font-size:10px;font-weight:700;color:#F31D5B;letter-spacing:1.4px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #f0ecee">PROJECT SCOPE</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px">${scopeRows}</table>

    ${
      featureTags.length > 0
        ? `<div style="margin-bottom:14px">
      <div style="font-size:10px;font-weight:700;color:#665C63;letter-spacing:1.2px;margin-bottom:8px">선택 기능</div>
      ${featureTags.map((feature) => `<span style="display:inline-block;margin:0 8px 8px 0;padding:7px 12px;border-radius:999px;background:#fff6f9;border:1px solid rgba(243,29,91,.2);font-size:12px;color:#5c4951">${safeText(feature)}</span>`).join("")}
    </div>`
        : ""
    }

    ${
      discountTags.length > 0
        ? `<div style="margin-bottom:14px">
      <div style="font-size:10px;font-weight:700;color:#665C63;letter-spacing:1.2px;margin-bottom:8px">적용 혜택</div>
      ${discountTags.map((discount) => `<span style="display:inline-block;margin:0 8px 8px 0;padding:7px 12px;border-radius:999px;background:#fff;border:1px solid rgba(20,16,20,.14);font-size:12px;color:#4a3f45">${safeText(discount)}</span>`).join("")}
    </div>`
        : ""
    }

    <div style="padding:14px 16px;background:#faf7f8;border-radius:12px;border-left:3px solid #F31D5B;margin-bottom:16px">
      <div style="font-size:12px;color:#4d4349;line-height:1.7">
        견적은 현재 선택하신 범위를 기준으로 계산된 초안이며, 상세 범위 확정 시 조정될 수 있어요.
      </div>
    </div>

    ${
      data.goal || data.note
        ? `<div style="padding:16px 20px;background:#faf7f8;border-radius:12px;border-left:3px solid #F31D5B;margin-bottom:16px">
        ${data.goal ? `<div style="font-size:10px;font-weight:700;color:#F31D5B;letter-spacing:1.4px;margin-bottom:8px">PROJECT GOAL</div><div style="font-size:13px;color:#141014;line-height:1.7;margin-bottom:12px;white-space:pre-wrap">${safeMultiline(data.goal)}</div>` : ""}
        ${data.note ? `<div style="font-size:10px;font-weight:700;color:#F31D5B;letter-spacing:1.4px;margin-bottom:8px">NOTE</div><div style="font-size:13px;color:#141014;line-height:1.7;white-space:pre-wrap">${safeMultiline(data.note)}</div>` : ""}
      </div>`
        : ""
    }

    ${
      contractUrl
        ? `<div style="padding:16px 18px;background:#fff5f8;border:1px solid rgba(243,29,91,.18);border-radius:14px">
      <div style="font-size:10px;font-weight:700;color:#F31D5B;letter-spacing:1.4px;margin-bottom:8px">NEXT STEP</div>
      <div style="font-size:13px;color:#4d4349;line-height:1.7;margin-bottom:12px">아래 버튼으로 자동 입력된 계약서 초안을 열어 바로 PDF로 내보낼 수 있습니다.</div>
      <a href="${contractUrl}" style="display:inline-block;background:#F31D5B;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-size:13px;font-weight:700">계약서 초안 열기</a>
      <div style="margin-top:10px;font-size:11px;color:#6c5f66;line-height:1.6;word-break:break-all">${contractUrl}</div>
    </div>`
        : ""
    }`;

  return wrap("ESTIMATE", `${data.brand || data.name || "새 프로젝트"} 견적서`, body);
}
