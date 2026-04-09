import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppLayout from "@/components/layout/AppLayout";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "Gonish",
  description: "Curated premium brand portfolio by Gonish",
  icons: {
    icon: "/G.svg",
    shortcut: "/G.svg",
    apple: "/Gonish.png",
  },
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
