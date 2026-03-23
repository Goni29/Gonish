"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type AdminLoginFormProps = {
  nextPath: string;
};

export default function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const [keyValue, setKeyValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyValue }),
      });

      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "로그인에 실패했어요.");
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "로그인에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label}>
        관리자 키
        <input
          type="password"
          value={keyValue}
          onChange={(event) => setKeyValue(event.target.value)}
          className={styles.input}
          placeholder="ADMIN_DASHBOARD_KEY"
          autoFocus
        />
      </label>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? "확인 중..." : "관리자 로그인"}
      </button>
    </form>
  );
}
