"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleLogout} className={`${styles.button} ${styles.buttonSecondary}`} disabled={loading}>
      {loading ? "로그아웃..." : "로그아웃"}
    </button>
  );
}
