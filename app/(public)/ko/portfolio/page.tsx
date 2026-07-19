import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PortfolioShowcase } from "@/components/casefilm/portfolio-showcase";

export const metadata: Metadata = {
  title: "포트폴리오 - 제품 증거와 운영 사례",
  description:
    "직접 만든 제품의 실제 화면과 공개 링크, 제조 시스템에서 바꾼 운영 사례를 함께 정리한 백엔드 포트폴리오.",
  alternates: {
    canonical: "/ko/portfolio",
    languages: { en: "/portfolio", ko: "/ko/portfolio" },
  },
};

export default function PortfolioKO() {
  return (
    <div lang="ko">
      <Header locale="ko" currentPath="/ko/portfolio" />
      <PortfolioShowcase locale="ko" />
      <Footer locale="ko" />
    </div>
  );
}
