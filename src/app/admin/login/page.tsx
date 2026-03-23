import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminDashboardKey, isAdminAuthenticated } from "@/lib/server/adminAuth";
import AdminLoginForm from "./AdminLoginForm";
import styles from "./page.module.css";

type MaybePromise<T> = Promise<T> | T;

type LoginPageProps = {
  searchParams: MaybePromise<{ next?: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | Gonish",
  description: "Gonish 운영 관리자 로그인",
};

function sanitizeNextPath(value: string | undefined) {
  if (!value) return "/admin/leads";
  if (!value.startsWith("/admin/")) return "/admin/leads";
  return value;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);
  const hasAdminKey = Boolean(getAdminDashboardKey());

  if (await isAdminAuthenticated()) {
    redirect(nextPath);
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Gonish admin</p>
        <h1 className={styles.title}>운영 대시보드 로그인</h1>
        <p className={styles.desc}>견적 문의 리드와 계약서 링크를 관리하는 화면입니다.</p>

        {!hasAdminKey ? (
          <p className={styles.missingKey}>서버 환경변수 `ADMIN_DASHBOARD_KEY`가 설정되지 않아 로그인할 수 없습니다.</p>
        ) : (
          <AdminLoginForm nextPath={nextPath} />
        )}

        <p className={styles.back}>
          <Link href="/">메인으로 돌아가기</Link>
        </p>
      </section>
    </div>
  );
}
