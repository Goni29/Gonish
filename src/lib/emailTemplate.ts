import {
  buildAbsoluteAssetUrl,
  buildGonishEmailShell,
  renderDetailTable,
  renderEditorialSection,
  renderLineList,
  renderOrbitBand,
  renderPrimaryButton,
  renderQuoteRail,
  safeEmailMultiline,
  safeEmailText,
  splitEmailCsv,
} from "@/lib/emailBranding";

type ContactEmailOptions = {
  siteOrigin?: string;
};

type EstimateEmailOptions = {
  contractUrl?: string;
  siteOrigin?: string;
};

export function contactEmailHtml(
  form: {
    name: string;
    project: string;
    tone: string;
    reply: string;
    message: string;
  },
  options?: ContactEmailOptions,
) {
  const title = form.project || form.name || "새 프로젝트 문의";
  const adminContactsUrl = buildAbsoluteAssetUrl(options?.siteOrigin, "/admin/contacts");

  const body = [
    renderEditorialSection({
      eyebrow: "문의 내용",
      title: "문의 요약",
      body: renderDetailTable([
        { label: "이름", value: form.name || "미입력" },
        { label: "회신 연락처", value: form.reply || "미입력" },
        { label: "문의 주제", value: form.project || "새 프로젝트 문의" },
        { label: "원하는 분위기", value: form.tone || "미정" },
      ]),
    }),
    renderEditorialSection({
      eyebrow: "남겨주신 말",
      title: "전달해 주신 메모",
      body: renderQuoteRail(safeEmailMultiline(form.message, "남겨진 메시지가 없습니다.")),
    }),
    renderEditorialSection({
      eyebrow: "확인 안내",
      title: "회신은 이 연락처로 이어집니다",
      body: `
        <div style="font-size:14px;line-height:1.9;color:#5c3f42;">
          <strong style="color:#b90040;">${safeEmailText(form.reply || "회신 연락처 미입력")}</strong> 로 답장을 이어갈 수 있습니다.
          아래에서 문의 목록을 열면 바로 확인하고 회신하실 수 있어요.
        </div>`,
    }),
    adminContactsUrl
      ? renderPrimaryButton({
          href: adminContactsUrl,
          label: "문의 목록 열기",
        })
      : "",
  ].join("");

  return buildGonishEmailShell({
    badge: "새 문의",
    eyebrow: "문의 알림",
    title: `${title} 문의가 도착했습니다`,
    subtitle: `${form.name || "새로운 문의자"}님이 문의를 남겨주셨습니다. 아래에 주요 내용을 정리해두었으니 확인 후 편하실 때 답장을 이어가 주세요.`,
    siteOrigin: options?.siteOrigin,
    orbitLabel: "일반 문의",
    heroHighlights: [form.tone || "원하는 분위기 미정", form.reply || "회신 연락처 확인"],
    footerNote: "문의 폼으로 접수된 내용입니다. 필요하시면 문의 목록에서 바로 확인하고 답장을 이어가실 수 있어요.",
    body,
  });
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
  options?: EstimateEmailOptions,
) {
  const featureItems = splitEmailCsv(data.features);
  const discountItems = splitEmailCsv(data.discounts);
  const contractUrl = options?.contractUrl?.trim() || "";
  const adminLeadsUrl = buildAbsoluteAssetUrl(options?.siteOrigin, "/admin/leads");
  const title = data.brand || data.name || data.projectType || "새 프로젝트";

  const body = [
    renderOrbitBand({
      eyebrow: "예상 견적",
      title: data.priceRange || "예산 범위 조율 예정",
      body: data.basePrice || "별도 안내",
      aside: "견적 초안",
    }),
    renderEditorialSection({
      eyebrow: "기본 정보",
      title: "기본 정보",
      body: renderDetailTable([
        { label: "이름", value: data.name || "미입력" },
        { label: "브랜드명", value: data.brand || "미입력" },
        { label: "회신 연락처", value: data.reply || "미입력" },
      ]),
    }),
    renderEditorialSection({
      eyebrow: "상담 범위",
      title: "상담에 필요한 범위",
      body: renderDetailTable([
        { label: "프로젝트 유형", value: data.projectType || "미정" },
        { label: "페이지 범위", value: data.pageScope || "미정" },
        { label: "자료 준비 상태", value: data.readiness || "확인 필요" },
        { label: "희망 일정", value: data.schedule || "미정" },
        { label: "도메인/호스팅", value: data.domainHosting || "미정" },
      ]),
    }),
    renderEditorialSection({
      eyebrow: "선택 항목",
      title: "기능과 혜택",
      body: `
        <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#b90040;">선택 기능</div>
        <div style="margin-top:12px;">${renderLineList(featureItems, "기본 구성 중심")}</div>
        <div style="margin-top:22px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#b90040;">적용 혜택</div>
        <div style="margin-top:12px;">${renderLineList(discountItems, "혜택 없음")}</div>
      `,
    }),
    data.goal || data.note
      ? renderEditorialSection({
          eyebrow: "추가 메모",
          title: "전달해 주신 내용",
          body: `
            ${
              data.goal
                ? `
              <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#b90040;">프로젝트 목표</div>
              <div style="margin-top:12px;">${renderQuoteRail(safeEmailMultiline(data.goal))}</div>`
                : ""
            }
            ${
              data.note
                ? `
              <div style="margin-top:${data.goal ? "24px" : "0"};font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#b90040;">추가 요청사항</div>
              <div style="margin-top:12px;">${renderQuoteRail(safeEmailMultiline(data.note))}</div>`
                : ""
            }
          `,
        })
      : "",
    contractUrl
      ? renderEditorialSection({
          eyebrow: "바로 확인하기",
          title: "계약서 초안을 함께 확인하실 수 있어요",
          body: `
            <div style="font-size:14px;line-height:1.9;color:#5c3f42;">
              아래 링크에서 자동 입력된 계약서 초안을 열어 바로 검토하실 수 있습니다.
            </div>
            ${renderPrimaryButton({ href: contractUrl, label: "계약서 초안 보기", align: "left" })}
            <div style="margin-top:14px;font-size:11px;line-height:1.75;color:#9d808b;word-break:break-all;">
              ${safeEmailText(contractUrl)}
            </div>
          `,
        })
      : adminLeadsUrl
        ? renderEditorialSection({
            eyebrow: "바로 확인하기",
            title: "문의 목록에서 이어서 확인하실 수 있어요",
            body: `
              <div style="font-size:14px;line-height:1.9;color:#5c3f42;">
                계약서 링크가 아직 없어도 문의 목록에서 내용을 확인하고 후속 안내를 이어가실 수 있습니다.
              </div>
              ${renderPrimaryButton({ href: adminLeadsUrl, label: "견적 문의 목록 열기", align: "left" })}
            `,
          })
        : "",
  ]
    .filter(Boolean)
    .join("");

  return buildGonishEmailShell({
    badge: "새 견적 문의",
    eyebrow: "견적 문의 알림",
    title: `${title} 견적 문의가 도착했습니다`,
    subtitle: "견적 문의에 필요한 범위와 일정, 전달해 주신 메모를 아래에 정리해두었습니다. 확인 후 다음 안내를 편하게 이어가 주세요.",
    siteOrigin: options?.siteOrigin,
    orbitLabel: "견적 문의",
    heroHighlights: [data.projectType || "프로젝트 유형 미정", data.schedule || "희망 일정 조율", data.reply || "회신 연락처 확인"],
    footerNote: "견적 문의 폼으로 접수된 내용입니다. 계약서 초안이나 문의 목록에서 바로 이어서 확인하실 수 있어요.",
    body,
  });
}
