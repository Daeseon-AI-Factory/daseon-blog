import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PortfolioShowcase } from "@/components/casefilm/portfolio-showcase";

export const metadata: Metadata = {
  title: "Portfolio — production case films",
  description:
    "Five production incidents and redesigns, shown as short case films with the decision and recorded result.",
  alternates: {
    canonical: "/portfolio",
    languages: { en: "/portfolio", ko: "/ko/portfolio" },
  },
};

export default function PortfolioEN() {
  return (
    <>
      <Header locale="en" currentPath="/portfolio" />
      <PortfolioShowcase locale="en" />
      <Footer locale="en" />
    </>
  );
}
