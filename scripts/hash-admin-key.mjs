/**
 * 관리자 비밀번호 해시 생성 스크립트
 *
 * 사용법:
 *   node scripts/hash-admin-key.mjs
 *
 * 출력된 ADMIN_DASHBOARD_KEY_HASH 값을 .env.local 또는
 * Vercel 환경변수에 설정하세요.
 * 비밀번호 원문은 절대 환경변수에 넣지 마세요.
 */

import { scryptSync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 입력 시 터미널에 문자를 표시하지 않음 (비밀번호 보호)
process.stdout.write("관리자 비밀번호를 입력하세요: ");
process.stdin.setRawMode?.(true);

let password = "";

process.stdin.on("data", (chunk) => {
  const char = chunk.toString();

  // Enter → 완료
  if (char === "\r" || char === "\n") {
    process.stdin.setRawMode?.(false);
    rl.close();
    process.stdout.write("\n");

    if (!password.trim()) {
      console.error("\n오류: 비밀번호를 입력해 주세요.");
      process.exit(1);
    }

    // scrypt 해시 생성
    // N=16384, r=8, p=1 (Node.js 기본값, 약 100ms 소요)
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password.trim(), salt, 64).toString("hex");
    const result = `${salt}:${hash}`;

    console.log("\n아래 값을 .env.local 또는 Vercel 환경변수에 설정하세요:\n");
    console.log(`ADMIN_DASHBOARD_KEY_HASH=${result}`);
    console.log("\n주의: 비밀번호 원문은 어디에도 저장하지 마세요.");

    process.exit(0);
  }

  // Ctrl+C → 취소
  if (char === "\x03") {
    process.stdout.write("\n취소되었습니다.\n");
    process.exit(0);
  }

  // Backspace
  if (char === "\x7f") {
    password = password.slice(0, -1);
    return;
  }

  password += char;
});
