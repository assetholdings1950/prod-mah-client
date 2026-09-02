"use client";
import React, { useState } from "react";
import { Gift, Copy, CheckCircle, Users } from "lucide-react";

export default function ReferralsPage() {
    const [copied, setCopied] = useState(false);
    const referralCode = "REF-MERLION-2026"; // Mock code, should fetch from backend
    const referralLink = `https://mah-app.com/signup?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#0F172A]">Refer and Earn</h1>
                <p className="mt-1 text-sm text-slate-500">Invite friends and earn rewards when they invest with Merlion Asset Holdings.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Gift className="h-32 w-32 text-[#0B2E84]" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-[#0F172A]">Your Referral Link</h2>
                            <p className="mt-2 text-sm text-slate-600 max-w-md">Share this link with your network. They will get a bonus on their first deposit, and you will earn a percentage of their investment charges.</p>
                            
                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex-1 truncate rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200">
                                    {referralLink}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0B2E84] px-5 text-sm font-bold text-white transition hover:bg-[#082461]"
                                >
                                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy Link"}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                            <h3 className="font-bold text-[#0F172A]">Your Referrals</h3>
                        </div>
                        <div className="p-12 text-center text-slate-500">
                            <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <p className="text-sm">You haven't referred anyone yet.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-[#0F172A]">Rewards Summary</h3>
                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Total Referred</span>
                                <span className="font-bold text-[#0F172A]">0</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Pending Bonus</span>
                                <span className="font-bold text-[#0F172A]">$0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Earned Bonus</span>
                                <span className="font-bold text-emerald-600">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
