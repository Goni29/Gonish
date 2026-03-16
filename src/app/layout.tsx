import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppLayout from "@/components/layout/AppLayout";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "Gonish Portfolio",
  description: "Curated premium brand portfolio by Gonish",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
