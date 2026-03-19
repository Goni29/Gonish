import type { Metadata } from "next";
import EstimatePage from "@/views/EstimatePage";

export const metadata: Metadata = {
  title: "Estimate | Gonish",
  description:
    "복잡한 개발 용어 없이, 필요한 제작 범위와 상담 방향을 정리하는 Gonish 견적 페이지",
};

export default function Page() {
  return <EstimatePage />;
}
