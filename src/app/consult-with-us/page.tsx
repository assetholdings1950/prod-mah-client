// src/app/consult-with-us/page.tsx
import ConsultWithUsPageClient from "@/components/consultation/ConsultWithUsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Consult With Us",
    description:
        "Schedule bespoke 1-on-1 consultations with Merlion Asset Holdings' Senior Wealth Directors. Tailored asset allocation, portfolio management, and private wealth advisory.",
};

export default function ConsultWithUsPage() {
    return <ConsultWithUsPageClient />;
}
