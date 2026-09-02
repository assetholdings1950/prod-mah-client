import React from "react";
import { Scale, ShieldCheck, Globe, Briefcase, Database, FileSearch, MessageSquareWarning } from "lucide-react";

export default function CompliancePage() {
    const complianceSections = [
        {
            icon: Scale,
            title: "1. Regulatory Framework",
            content: (
                <p>
                    Merlion Asset Holdings is committed to operating within the highest standards of regulatory compliance. Our operations, platforms, and financial products adhere strictly to the guidelines established by the relevant financial authorities in our operating jurisdictions. We continuously monitor regulatory developments to ensure full alignment with local and international laws.
                </p>
            )
        },
        {
            icon: ShieldCheck,
            title: "2. Anti-Money Laundering (AML) & KYC",
            content: (
                <p>
                    We maintain a strict, comprehensive Anti-Money Laundering (AML) program to prevent illicit financial activities. As part of this commitment, all users must undergo a rigorous Know Your Customer (KYC) identity verification process before accessing our investment products. We employ automated monitoring and reserve the right to report suspicious activities to appropriate law enforcement agencies.
                </p>
            )
        },
        {
            icon: Globe,
            title: "3. Sanctions Compliance",
            content: (
                <p>
                    We strictly adhere to global sanctions lists, including those issued by the UN, OFAC, and local authorities. We do not engage in business with individuals, entities, or jurisdictions that are subject to comprehensive international sanctions or embargoes. Regular screening processes are enforced for all clients and transactions.
                </p>
            )
        },
        {
            icon: Briefcase,
            title: "4. Code of Conduct & Ethics",
            content: (
                <p>
                    Integrity, transparency, and client protection form the core of our corporate governance. Our employees, agents, and partners are bound by a rigorous Code of Conduct designed to eliminate conflicts of interest, prevent insider trading, and ensure that all financial advice and actions prioritize the best interests of our clients.
                </p>
            )
        },
        {
            icon: Database,
            title: "5. Data Protection & Privacy",
            content: (
                <p>
                    In accordance with our Privacy Policy and relevant global data protection acts (such as GDPR or PDPA), we enforce strict internal controls to safeguard personal and financial data. Access to sensitive information is granted strictly on a need-to-know basis, utilizing enterprise-grade encryption for data at rest and in transit.
                </p>
            )
        },
        {
            icon: FileSearch,
            title: "6. Audit & Review",
            content: (
                <p>
                    Our internal compliance team conducts periodic reviews and risk assessments of our operational processes. Furthermore, we engage reputable third-party auditing firms to perform independent financial and security audits, ensuring that our compliance frameworks remain robust and effective against evolving threats.
                </p>
            )
        },
        {
            icon: MessageSquareWarning,
            title: "7. Reporting Misconduct",
            content: (
                <p>
                    We encourage our clients, employees, and partners to report any suspected ethical violations, compliance breaches, or fraudulent activities. All reports are investigated thoroughly by our independent compliance committee, and whistleblowers are protected from retaliation to the fullest extent permitted by law.
                </p>
            )
        }
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
            <div className="mx-auto max-w-4xl px-4 py-20 pt-32 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2E84] mb-6 tracking-tight drop-shadow-sm">Compliance</h1>
                    <p className="text-slate-500 text-lg font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    <div className="mt-8 h-1 w-24 bg-gradient-to-r from-blue-400 to-[#0B2E84] mx-auto rounded-full"></div>
                </div>

                <div className="space-y-8">
                    {complianceSections.map((section, idx) => (
                        <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0B2E84] shadow-sm border border-blue-100">
                                    <section.icon className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#0F172A]">{section.title}</h2>
                            </div>
                            <div className="prose prose-slate max-w-none text-base text-slate-600 leading-relaxed space-y-4">
                                {section.content}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
                    <h3 className="text-xl font-bold text-[#0F172A] mb-4">Compliance Inquiries</h3>
                    <p className="text-slate-600 mb-6">If you have specific questions regarding our regulatory framework or wish to report a compliance matter, please reach out directly to our compliance officers.</p>
                    <a href="mailto:compliance@merlionassetholdings.com" className="inline-flex items-center justify-center rounded-lg bg-[#0B2E84] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2E84] transition-colors">
                        Contact Compliance Team
                    </a>
                </div>
            </div>
        </main>
    );
}
