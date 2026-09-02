import React from "react";
import { Shield, Database, Eye, Share2, Globe, Lock, Clock, Scale } from "lucide-react";

export default function PrivacyPolicyPage() {
    const policies = [
        {
            icon: Shield,
            title: "1. Introduction",
            content: (
                <p>
                    Welcome to Merlion Asset Holdings (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website, utilize our application, or engage with our services. It also informs you about your privacy rights and how the law protects you.
                </p>
            )
        },
        {
            icon: Database,
            title: "2. The Data We Collect About You",
            content: (
                <>
                    <p>
                        Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Identity Data:</strong> First name, last name, username or similar identifier, marital status, title, date of birth, and gender.</li>
                        <li><strong>Contact Data:</strong> Billing address, email address, and telephone numbers.</li>
                        <li><strong>Financial Data:</strong> Bank account, payment card details, and investment portfolio details.</li>
                        <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products and services you have purchased from us.</li>
                    </ul>
                </>
            )
        },
        {
            icon: Eye,
            title: "3. How We Collect Your Data",
            content: (
                <p>
                    We use different methods to collect data from and about you including through direct interactions (where you provide data by filling in forms or by corresponding with us) and automated technologies (as you interact with our website, we may automatically collect Technical Data about your equipment, browsing actions, and patterns).
                </p>
            )
        },
        {
            icon: Share2,
            title: "4. How We Use Your Personal Data",
            content: (
                <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to perform the contract we are about to enter into or have entered into with you, where it is necessary for our legitimate interests (or those of a third party), and where your interests and fundamental rights do not override those interests, or where we need to comply with a legal or regulatory obligation.
                </p>
            )
        },
        {
            icon: Globe,
            title: "5. International Transfers",
            content: (
                <p>
                    We may share your personal data within our corporate group or with trusted third parties, which may involve transferring your data outside the jurisdiction where you reside. Whenever we transfer your personal data, we ensure a similar degree of protection is afforded to it by implementing appropriate safeguards and ensuring compliance with applicable data protection laws.
                </p>
            )
        },
        {
            icon: Lock,
            title: "6. Data Security",
            content: (
                <p>
                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. They will only process your personal data on our instructions, and they are subject to a duty of confidentiality.
                </p>
            )
        },
        {
            icon: Clock,
            title: "7. Data Retention",
            content: (
                <p>
                    We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. By law, we may have to keep basic information about our customers (including Contact, Identity, Financial, and Transaction Data) for a specified period after they cease being customers for tax and legal purposes.
                </p>
            )
        },
        {
            icon: Scale,
            title: "8. Your Legal Rights",
            content: (
                <>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Request access to your personal data.</li>
                        <li>Request correction of your personal data.</li>
                        <li>Request erasure of your personal data.</li>
                        <li>Object to processing of your personal data.</li>
                        <li>Request restriction of processing your personal data.</li>
                        <li>Request transfer of your personal data.</li>
                    </ul>
                </>
            )
        }
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
            <div className="mx-auto max-w-4xl px-4 py-20 pt-32 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2E84] mb-6 tracking-tight drop-shadow-sm">Privacy Policy</h1>
                    <p className="text-slate-500 text-lg font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    <div className="mt-8 h-1 w-24 bg-gradient-to-r from-blue-400 to-[#0B2E84] mx-auto rounded-full"></div>
                </div>

                <div className="space-y-8">
                    {policies.map((policy, idx) => (
                        <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0B2E84] shadow-sm border border-blue-100">
                                    <policy.icon className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#0F172A]">{policy.title}</h2>
                            </div>
                            <div className="prose prose-slate max-w-none text-base text-slate-600 leading-relaxed space-y-4">
                                {policy.content}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
                    <h3 className="text-xl font-bold text-[#0F172A] mb-4">Questions about our privacy policy?</h3>
                    <p className="text-slate-600 mb-6">If you have any questions, concerns, or requests regarding this policy, our privacy team is here to help.</p>
                    <a href="mailto:privacy@merlionassetholdings.com" className="inline-flex items-center justify-center rounded-lg bg-[#0B2E84] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2E84] transition-colors">
                        Contact Privacy Team
                    </a>
                </div>
            </div>
        </main>
    );
}
