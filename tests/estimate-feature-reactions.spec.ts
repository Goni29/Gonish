import { expect, test } from "@playwright/test";

const featureReplies: Array<{ id: string; reply: string }> = [
  { id: "member-auth", reply: "회원가입과 로그인은 가입 방식과 필요한 기본 정보만 먼저 정해도 범위를 꽤 정확하게 잡을 수 있어요." },
  { id: "social-login", reply: "소셜 로그인은 어떤 플랫폼을 붙일지와 기존 계정 연동 방식까지 같이 보면 구현 범위가 선명해져요." },
  { id: "role-permission", reply: "권한 분리는 누가 무엇을 볼 수 있는지부터 정하면 화면과 데이터 범위가 깔끔하게 정리돼요." },
  { id: "admin-dashboard", reply: "관리자 대시보드는 첫 화면에서 꼭 봐야 할 지표만 먼저 추리면 훨씬 실용적으로 설계할 수 있어요." },
  { id: "admin-module", reply: "업무 관리 모듈은 어떤 데이터를 등록하고 처리해야 하는지 흐름부터 잡으면 견적이 안정적으로 나와요." },
  { id: "admin-permission", reply: "관리자 권한 세분화는 역할별 접근 범위를 먼저 나누면 운영 구조가 훨씬 명확해져요." },
  { id: "stats-report", reply: "통계와 리포트는 어떤 지표를 기간별로 볼지부터 정하면 필요한 데이터 구조를 빠르게 잡을 수 있어요." },
  { id: "crud-board", reply: "콘텐츠와 데이터 기능은 등록, 수정, 삭제 흐름과 목록·상세 화면을 같이 보면 범위를 정확하게 정리할 수 있어요." },
  { id: "payment", reply: "온라인 결제는 결제 성공, 실패, 취소 이후 흐름까지 같이 정하면 실제 운영에 맞게 설계할 수 있어요." },
  { id: "subscription", reply: "정기 결제는 결제 주기, 해지, 재시도 같은 운영 규칙까지 함께 잡아야 견적이 정확해져요." },
  { id: "map", reply: "지도 연동은 고정 위치 표시인지, 여러 지점 안내인지에 따라 구현 범위가 꽤 달라져요." },
  { id: "notification-email", reply: "자동 이메일은 어떤 시점에 누구에게 보낼지 정하면 템플릿과 연동 범위를 깔끔하게 나눌 수 있어요." },
  { id: "notification-sms", reply: "문자와 알림 발송은 발송 조건과 실패 처리 기준까지 먼저 정해두면 운영이 훨씬 안정적이에요." },
  { id: "external-api", reply: "외부 API 연동은 연결 대상, 인증 방식, 실패 처리까지 먼저 정리하면 리스크를 많이 줄일 수 있어요." },
];

test.describe("Estimate feature reactions", () => {
  test("shows the latest feature-specific reply for every added feature", async ({ page }) => {
    test.setTimeout(90000);

    await page.goto("/estimate", { waitUntil: "networkidle" });

    await expect(page.getByTestId("estimate-reply-bubble").first()).toBeVisible();

    for (const feature of featureReplies) {
      const button = page.locator(`[data-option-id="${feature.id}"]`);
      await expect(button).toBeAttached();
      await button.evaluate((node) => {
        (node as HTMLButtonElement).click();
      });
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect
        .poll(async () => {
          const texts = await page.getByTestId("estimate-reply-bubble").allTextContents();
          return texts.some((text) => text.includes(feature.reply));
        })
        .toBe(true);
    }
  });
});
