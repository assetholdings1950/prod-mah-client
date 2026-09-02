"use client";
import React, { useEffect, useState } from "react";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import appClient from "@/lib/appClient";

interface Job {
    _id: string;
    title: string;
    description: string;
    location: string;
    type: string;
}

export default function HiringSection() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        appClient.get("/api/jobs")
            .then(res => {
                if (res.data?.success) {
                    setJobs(res.data.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="bg-slate-50 py-20 sm:py-32 relative overflow-hidden border-t border-slate-200">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">Join Our Team</h2>
                    <p className="mt-4 text-lg text-slate-600">Build the future of digital finance with Merlion Asset Holdings.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2E84] border-t-transparent" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200">
                        <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-[#0F172A]">No open positions</h3>
                        <p className="mt-2 text-sm text-slate-500">We are not currently hiring, but check back soon!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {jobs.map(job => (
                            <div key={job._id} className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
                                <div className="sm:flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#0F172A]">{job.title}</h3>
                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                                            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {job.type}</span>
                                        </div>
                                    </div>
                                    <Link href="/contact" className="mt-4 sm:mt-0 flex h-10 items-center justify-center rounded-lg bg-[#0B2E84] px-6 text-sm font-bold text-white transition hover:bg-[#082461]">
                                        Apply Now
                                    </Link>
                                </div>
                                <div className="mt-6 border-t border-slate-100 pt-6">
                                    <div
                                        className="rich-text-preview line-clamp-3 whitespace-pre-wrap text-sm text-slate-600"
                                        dangerouslySetInnerHTML={{ __html: job.description }}
                                    />
                                </div>
                            </div>
                        ))}

                        {jobs.length > 3 && (
                            <div className="mt-4 text-center">
                                <Link href="/hiring" className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2E84] hover:underline">
                                    View all open roles <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
