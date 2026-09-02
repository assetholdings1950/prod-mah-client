import React from "react";
import { AlertTriangle, TrendingDown, Droplets, Landmark, Scale, Cpu, ShieldX } from "lucide-react";

export default function RiskDisclosurePage() {
    const risks = [
        {
            icon: AlertTriangle,
            title: "1. General Investment Risks",
            content: (
                <p>
                    Investing in financial markets, including digital assets, alternative investments, and traditional securities, involves a high degree of risk. Prices can be highly volatile, and you could lose some or all of your initial investment. You should carefully consider your financial situation, objectives, and risk tolerance before making any investment decisions.
                </p>
            )
        },
        {
            icon: TrendingDown,
            title: "2. Market Volatility",
            content: (
                <p>
                    The value of investments may fluctuate significantly due to market conditions, economic factors, geopolitical events, and regulatory changes. Markets can experience sudden and severe drops in value. Past performance is not indicative of future results, and no guarantees are made regarding the success of any investment strategy or fund.
                </p>
            )
        },
        {
            icon: Droplets,
            title: "3. Liquidity Risk",
            content: (
                <p>
                    Certain investments may have limited liquidity, meaning you may not be able to sell or liquidate your position immediately or without incurring a significant loss in value. Lock-in periods often apply to specific investment plans as detailed in their respective terms. Early withdrawals, if permitted, may incur substantial penalties.
                </p>
            )
        },
        {
            icon: Landmark,
            title: "4. Counterparty & Credit Risk",
            content: (
                <p>
                    Investment returns may depend on the ability of third parties, including borrowers, issuers, or platform partners, to meet their financial obligations. Default or insolvency of these counterparties can result in partial or total loss of the invested capital.
                </p>
            )
        },
        {
            icon: Scale,
            title: "5. Regulatory & Tax Risk",
            content: (
                <p>
                    Changes in laws, regulations, or tax policies globally or within specific jurisdictions may adversely affect the value, legality, or tax treatment of your investments. Regulatory actions can also restrict the operations of the platform or the funds offered. We strongly recommend consulting with a professional tax or legal advisor before participating.
                </p>
            )
        },
        {
            icon: Cpu,
            title: "6. Technology & System Failure Risk",
            content: (
                <p>
                    The platform relies on complex technology systems, which may be vulnerable to cyberattacks, software bugs, or hardware failures. While we employ rigorous security measures, any such disruption could affect your ability to access your account, execute transactions, or lead to the loss of data or assets.
                </p>
            )
        },
        {
            icon: ShieldX,
            title: "7. No Guarantees",
            content: (
                <p>
                    Merlion Asset Holdings does not guarantee the performance of any investment, the return of principal, or any specific rate of return. All projections and target returns provided are estimates based on historical data and market analysis, and actual returns may vary significantly.
                </p>
            )
        }
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
            <div className="mx-auto max-w-4xl px-4 py-20 pt-32 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2E84] mb-6 tracking-tight drop-shadow-sm">Risk Disclosure</h1>
                    <p className="text-slate-500 text-lg font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    <div className="mt-8 h-1 w-24 bg-gradient-to-r from-blue-400 to-[#0B2E84] mx-auto rounded-full"></div>
                </div>

                <div className="space-y-8">
                    {risks.map((risk, idx) => (
                        <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0B2E84] shadow-sm border border-blue-100">
                                    <risk.icon className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#0F172A]">{risk.title}</h2>
                            </div>
                            <div className="prose prose-slate max-w-none text-base text-slate-600 leading-relaxed space-y-4">
                                {risk.content}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 rounded-2xl bg-white border border-red-200 shadow-sm p-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#0F172A] mb-4">Acknowledge the Risks</h3>
                    <p className="text-slate-600 mb-0 max-w-2xl mx-auto">
                        By continuing to use our platform and participate in investment opportunities, you acknowledge that you have read, understood, and accept the risks outlined in this disclosure.
                    </p>
                </div>
            </div>
        </main>
    );
}
