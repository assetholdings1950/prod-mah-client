"use client";
import React, { useState } from "react";
import { Search, ShieldCheck, Award, TrendingUp } from "lucide-react";

export default function AgentVerificationSection() {
    const [agentId, setAgentId] = useState("");
    const [agentData, setAgentData] = useState<any>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agentId.trim()) return;
        setLoading(true);
        setError("");
        setAgentData(null);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8080';
            const res = await fetch(`${baseUrl}/agent/verify/${encodeURIComponent(agentId)}`);
            const data = await res.json();
            if (data.success) {
                setAgentData(data.data);
            } else {
                setError("Agent not found or invalid ID.");
            }
        } catch (err) {
            setError("Failed to verify agent.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-slate-50 py-20 sm:py-32 relative overflow-hidden border-y border-slate-200">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10 text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-[#0B2E84] mb-4" />
                <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">Verify Your Agent</h2>
                <p className="mt-4 text-lg text-slate-600">Ensure you are working with an authorized Merlion Asset Holdings agent. Enter their Agent ID below to check their credentials and performance.</p>

                <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto flex gap-3">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={agentId}
                            onChange={(e) => setAgentId(e.target.value)}
                            placeholder="Enter Agent ID (e.g., AGT123)"
                            className="block w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 shadow-sm focus:border-[#0B2E84] focus:outline-none focus:ring-1 focus:ring-[#0B2E84] sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-[#0B2E84] px-6 py-3 font-bold text-white transition hover:bg-[#082461] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 font-medium max-w-md mx-auto">
                        {error}
                    </div>
                )}

                {agentData && (
                    <div className="mt-10 rounded-2xl bg-white p-8 shadow-xl max-w-2xl mx-auto text-left border border-slate-100">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0F172A]">{agentData.fullName}</h3>
                                <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 mt-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Verified Agent
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Performance Rating</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-[#0F172A]">{agentData.performance.rating}</span>
                                    <span className="text-sm text-slate-500">/ 5.0</span>
                                </div>
                                <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1"><Award className="h-4 w-4" /> {agentData.performance.records}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Client Investment</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-[#0F172A]">${(agentData.performance.totalClientInvestment).toLocaleString()}</span>
                                </div>
                                <p className="mt-2 text-sm text-[#0B2E84] font-medium flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Trusted Advisor</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
