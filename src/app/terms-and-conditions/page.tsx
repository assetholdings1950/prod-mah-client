import React from "react";
import { FileText, UserCheck, Copyright, ShieldAlert, Banknote, XOctagon, AlertTriangle, Scale, RefreshCw } from "lucide-react";

export default function TermsAndConditionsPage() {
    const terms = [
        {
            icon: FileText,
            title: "1. Agreement to Terms",
            content: (
                <p>
                    By accessing our website, platform, and using our services, you agree to be bound by these Terms and Conditions and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site and our services.
                </p>
            )
        },
        {
            icon: UserCheck,
            title: "2. Eligibility & Account Registration",
            content: (
                <>
                    <p>
                        To utilize our services, you must register for an account. By registering, you represent and warrant that:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>You are at least 18 years of age or the legal age of majority in your jurisdiction.</li>
                        <li>All registration information you submit is truthful, accurate, and complete.</li>
                        <li>You will maintain the accuracy of such information and promptly update it as necessary.</li>
                        <li>Your use of the services does not violate any applicable law or regulation.</li>
                    </ul>
                </>
            )
        },
        {
            icon: Copyright,
            title: "3. Use License & Intellectual Property",
            content: (
                <>
                    <p>
                        Permission is granted to temporarily download one copy of the materials on Merlion Asset Holdings&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Modify or copy the materials.</li>
                        <li>Use the materials for any commercial purpose or for any public display.</li>
                        <li>Attempt to reverse engineer any software contained on Merlion Asset Holdings&apos;s website.</li>
                        <li>Remove any copyright or other proprietary notations from the materials.</li>
                        <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
                    </ul>
                </>
            )
        },
        {
            icon: ShieldAlert,
            title: "4. User Representations & Obligations",
            content: (
                <p>
                    You agree not to use the platform for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password, whether your password is with our service or a third-party service.
                </p>
            )
        },
        {
            icon: Banknote,
            title: "5. Financial Transactions & Investments",
            content: (
                <p>
                    All investments made through Merlion Asset Holdings are subject to the specific terms outlined in the respective investment plan or fund documentation. You acknowledge that investing involves risk, including the potential loss of principal. We are not responsible for any financial losses incurred through your use of our platform. Withdrawals and payouts are subject to the processing times and terms of the specific fund.
                </p>
            )
        },
        {
            icon: XOctagon,
            title: "6. Disclaimer of Warranties",
            content: (
                <p>
                    All the materials and services on Merlion Asset Holdings&apos;s website are provided &quot;as is&quot;. Merlion Asset Holdings makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
            )
        },
        {
            icon: AlertTriangle,
            title: "7. Limitations of Liability",
            content: (
                <p>
                    In no event shall Merlion Asset Holdings or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Merlion Asset Holdings&apos;s website, even if Merlion Asset Holdings or an authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
            )
        },
        {
            icon: Scale,
            title: "8. Governing Law & Dispute Resolution",
            content: (
                <p>
                    These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Merlion Asset Holdings operates, without regard to its conflict of law provisions. Any dispute arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts in that region.
                </p>
            )
        },
        {
            icon: RefreshCw,
            title: "9. Modifications to Terms",
            content: (
                <p>
                    Merlion Asset Holdings may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service. We encourage users to frequently check this page for any changes.
                </p>
            )
        }
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
            <div className="mx-auto max-w-4xl px-4 py-20 pt-32 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2E84] mb-6 tracking-tight drop-shadow-sm">Terms and Conditions</h1>
                    <p className="text-slate-500 text-lg font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    <div className="mt-8 h-1 w-24 bg-gradient-to-r from-blue-400 to-[#0B2E84] mx-auto rounded-full"></div>
                </div>

                <div className="space-y-8">
                    {terms.map((term, idx) => (
                        <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0B2E84] shadow-sm border border-blue-100">
                                    <term.icon className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#0F172A]">{term.title}</h2>
                            </div>
                            <div className="prose prose-slate max-w-none text-base text-slate-600 leading-relaxed space-y-4">
                                {term.content}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
                    <h3 className="text-xl font-bold text-[#0F172A] mb-4">Need Clarification?</h3>
                    <p className="text-slate-600 mb-6">Our legal and compliance team is available to help you understand our terms of service.</p>
                    <a href="mailto:legal@merlionassetholdings.com" className="inline-flex items-center justify-center rounded-lg bg-[#0B2E84] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2E84] transition-colors">
                        Contact Legal Support
                    </a>
                </div>
            </div>
        </main>
    );
}
