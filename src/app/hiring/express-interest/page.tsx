import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import ExpressionOfInterestForm from "@/components/hiring/ExpressionOfInterestForm";

export const metadata: Metadata = {
    title: "Express Your Interest | Merlion Asset Holdings Careers",
    description: "Share your profile with Merlion Asset Holdings for consideration for current and future career opportunities.",
    alternates: { canonical: "/hiring/express-interest" },
};

export default function ExpressInterestPage() {
    return (
        <main className="min-h-screen bg-[#f7f9fd] pb-20 pt-20 text-navy md:pt-[108px]">
            <div className="mx-auto max-w-[1180px] px-5 sm:px-8 md:px-12">
                <Link href="/hiring" className="inline-flex items-center gap-2 text-sm font-semibold text-navy/60 hover:text-navy"><ArrowLeft className="h-4 w-4" /> Careers</Link>
                <div className="mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
                    <div>
                        <header className="border-b border-navy/10 pb-8">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Join our talent network</p>
                            <h1 className="mt-3 max-w-3xl text-4xl font-normal leading-tight md:text-5xl" style={{ fontFamily: "var(--font-playfair)" }}>Your next Merlion role may begin here.</h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-navy/62">Do not see the right opening today? Introduce yourself to our hiring team. Every expression of interest is reviewed manually and retained for relevant career opportunities.</p>
                        </header>
                        <div className="mt-8"><ExpressionOfInterestForm /></div>
                    </div>
                    <aside className="rounded-2xl border border-navy/10 bg-white p-6 lg:sticky lg:top-28">
                        <ShieldCheck className="h-8 w-8 text-blue-600" />
                        <h2 className="mt-4 text-2xl font-normal" style={{ fontFamily: "var(--font-playfair)" }}>Manual and confidential review</h2>
                        <p className="mt-3 text-sm leading-7 text-navy/58">Your information is used only for recruitment. Submitting an interest does not create a job application or guarantee contact.</p>
                    </aside>
                </div>
            </div>
        </main>
    );
}
