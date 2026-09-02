"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    ChevronDown,
    Loader2,
    MapPin,
    Search,
    ShieldCheck,
    SlidersHorizontal,
} from "lucide-react";
import appClient from "@/lib/appClient";
import { getJobApplicationSlug } from "@/lib/hiring/jobSlug";
import heroVisual from "@/assets/hiring-careers-banner.png";

interface Job {
    _id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    createdAt?: string;
}

type JobFilterOptions = {
    locations: string[];
    employmentTypes: string[];
};

const PREVIEW_JOBS: Job[] = [
    {
        _id: "preview-wealth-advisory",
        title: "Wealth Advisory Associate",
        description:
            "Partner with experienced advisors to deliver tailored wealth solutions and build enduring client relationships.",
        location: "Singapore",
        type: "Full-time",
        createdAt: "2026-07-27T09:00:00.000Z",
    },
    {
        _id: "preview-client-relationship",
        title: "Client Relationship Executive",
        description:
            "Nurture client relationships, understand their goals, and connect them with solutions that create long-term impact.",
        location: "Singapore",
        type: "Full-time",
        createdAt: "2026-07-23T09:00:00.000Z",
    },
    {
        _id: "preview-investment-operations",
        title: "Investment Operations Analyst",
        description:
            "Ensure accuracy and efficiency across investment operations and reporting to support robust client outcomes.",
        location: "Singapore",
        type: "Full-time",
        createdAt: "2026-07-16T09:00:00.000Z",
    },
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function getPostedLabel(value?: string) {
    if (!value) return "Recently";

    const postedAt = new Date(value);
    if (Number.isNaN(postedAt.getTime())) return "Recently";

    const days = Math.round((postedAt.getTime() - Date.now()) / 86_400_000);
    if (Math.abs(days) < 7) return formatter.format(days, "day");

    const weeks = Math.round(days / 7);
    return formatter.format(weeks, "week");
}

export default function HiringPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [location, setLocation] = useState("all");
    const [employmentType, setEmploymentType] = useState("all");
    const [filtersReady, setFiltersReady] = useState(false);
    const [filterOptions, setFilterOptions] = useState<JobFilterOptions>({
        locations: [],
        employmentTypes: [],
    });
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

    useEffect(() => {
        const readFiltersFromUrl = () => {
            const params = new URLSearchParams(window.location.search);
            const urlKeyword = params.get("keyword") ?? "";
            setKeyword(urlKeyword);
            setDebouncedKeyword(urlKeyword.trim());
            setLocation(params.get("location") || "all");
            setEmploymentType(params.get("type") || "all");
            setFiltersReady(true);
        };

        const handlePopState = () => {
            setLoading(true);
            readFiltersFromUrl();
        };

        readFiltersFromUrl();
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    useEffect(() => {
        const nextKeyword = keyword.trim();
        if (nextKeyword === debouncedKeyword) return;
        const timeout = window.setTimeout(() => {
            setLoading(true);
            setDebouncedKeyword(nextKeyword);
        }, 300);
        return () => window.clearTimeout(timeout);
    }, [debouncedKeyword, keyword]);

    useEffect(() => {
        if (!filtersReady) return;

        const url = new URL(window.location.href);
        if (debouncedKeyword) url.searchParams.set("keyword", debouncedKeyword);
        else url.searchParams.delete("keyword");
        if (location !== "all") url.searchParams.set("location", location);
        else url.searchParams.delete("location");
        if (employmentType !== "all") url.searchParams.set("type", employmentType);
        else url.searchParams.delete("type");
        window.history.replaceState(window.history.state, "", url);
    }, [debouncedKeyword, employmentType, filtersReady, location]);

    useEffect(() => {
        if (!filtersReady) return;

        let active = true;
        const controller = new AbortController();

        appClient
            .get("/api/jobs", {
                params: {
                    ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
                    ...(location !== "all" ? { location } : {}),
                    ...(employmentType !== "all" ? { type: employmentType } : {}),
                },
                signal: controller.signal,
            })
            .then((response) => {
                if (!active) return;
                if (response.data?.success && Array.isArray(response.data.data)) {
                    setJobs(response.data.data);
                    setLoadFailed(false);
                    setFilterOptions({
                        locations: Array.isArray(response.data.filters?.locations)
                            ? response.data.filters.locations
                            : [],
                        employmentTypes: Array.isArray(
                            response.data.filters?.employmentTypes,
                        )
                            ? response.data.filters.employmentTypes
                            : [],
                    });
                } else {
                    setLoadFailed(true);
                }
            })
            .catch(() => {
                if (active) setLoadFailed(true);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [debouncedKeyword, employmentType, filtersReady, location]);

    const displayJobs =
        process.env.NODE_ENV === "development" && loadFailed ? PREVIEW_JOBS : jobs;

    const locations = useMemo(
        () =>
            filterOptions.locations.length > 0
                ? filterOptions.locations
                : Array.from(new Set(displayJobs.map((job) => job.location))).sort(),
        [displayJobs, filterOptions.locations],
    );

    const employmentTypes = useMemo(
        () =>
            filterOptions.employmentTypes.length > 0
                ? filterOptions.employmentTypes
                : Array.from(new Set(displayJobs.map((job) => job.type))).sort(),
        [displayJobs, filterOptions.employmentTypes],
    );

    const filteredJobs = useMemo(() => {
        const searchTerm = keyword.trim().toLowerCase();

        if (!loadFailed) return displayJobs;

        return displayJobs.filter((job) => {
            const matchesKeyword =
                !searchTerm ||
                job.title.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm);
            const matchesLocation = location === "all" || job.location === location;
            const matchesType =
                employmentType === "all" || job.type === employmentType;

            return matchesKeyword && matchesLocation && matchesType;
        });
    }, [displayJobs, employmentType, keyword, loadFailed, location]);

    const resetFilters = () => {
        setLoading(true);
        setKeyword("");
        setLocation("all");
        setEmploymentType("all");
    };

    const changeKeyword = (value: string) => {
        setKeyword(value);
    };

    const changeLocation = (value: string) => {
        setLoading(true);
        setLocation(value);
    };

    const changeEmploymentType = (value: string) => {
        setLoading(true);
        setEmploymentType(value);
    };

    return (
        <main className="min-h-screen bg-white text-navy">
            <section
                aria-label="Singapore skyline"
                className="relative mt-16 h-[170px] overflow-hidden border-b border-navy/10 sm:h-[190px] md:mt-[88px] md:h-[215px]"
            >
                <Image
                    src={heroVisual}
                    alt="Singapore skyline and the Merlion at sunrise"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-[center_58%]"
                />
            </section>

            <section className="border-b border-navy/10 bg-white">
                <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-9 sm:px-8 md:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-10">
                    <div className="lg:border-r lg:border-navy/15 lg:pr-12">
                        <h1
                            className="max-w-[610px] text-[clamp(2.5rem,3.35vw,3rem)] font-normal leading-[1.04] tracking-[-0.04em] text-navy lg:flex lg:flex-col"
                            style={{ fontFamily: "var(--font-playfair)" }}
                        >
                            <span className="lg:block">Find the role where</span>
                            <span className="lg:block">standards matter.</span>
                        </h1>
                    </div>

                    <div className="flex max-w-[650px] flex-col justify-center">
                        <p className="max-w-[610px] text-base leading-7 text-navy/72">
                            We build lasting client outcomes through disciplined advice and
                            careful risk management. Every Merlion candidate is selected
                            through a thorough, manual review so our standards are never
                            compromised.
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
                            <Link href="/hiring/track" className="inline-flex w-fit items-center gap-3 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4">
                                <ArrowRight className="h-4 w-4" /> Track an application
                            </Link>
                            <Link href="/hiring/express-interest" className="inline-flex w-fit items-center gap-3 text-sm font-semibold text-navy transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4">
                                <ArrowRight className="h-4 w-4" /> Submit Job Application
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section id="open-roles" className="mx-auto max-w-[1320px] px-5 sm:px-8 md:px-12">
                <div className="grid lg:grid-cols-[285px_minmax(0,1fr)]">
                    <aside className="border-b border-navy/10 py-10 lg:border-b-0 lg:border-r lg:py-12 lg:pr-10">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-navy">Refine your search</h2>
                            <SlidersHorizontal className="h-4 w-4 text-navy/45 lg:hidden" />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-navy/58">
                                    Keyword
                                </span>
                                <span className="relative block">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" />
                                    <input
                                        value={keyword}
                                        onChange={(event) => changeKeyword(event.target.value)}
                                        placeholder="Search roles or keywords"
                                        className="h-11 w-full rounded-sm border border-navy/15 bg-white pl-10 pr-3 text-sm text-navy outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                                    />
                                </span>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-navy/58">
                                    Location
                                </span>
                                <span className="relative block">
                                    <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-navy/45" />
                                    <select
                                        value={location}
                                        onChange={(event) => changeLocation(event.target.value)}
                                        className="h-11 w-full appearance-none rounded-sm border border-navy/15 bg-white pl-10 pr-9 text-sm text-navy outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                                    >
                                        <option value="all">All locations</option>
                                        {locations.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" />
                                </span>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-navy/58">
                                    Employment type
                                </span>
                                <span className="relative block">
                                    <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-navy/45" />
                                    <select
                                        value={employmentType}
                                        onChange={(event) =>
                                            changeEmploymentType(event.target.value)
                                        }
                                        className="h-11 w-full appearance-none rounded-sm border border-navy/15 bg-white pl-10 pr-9 text-sm text-navy outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                                    >
                                        <option value="all">All types</option>
                                        {employmentTypes.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" />
                                </span>
                            </label>
                        </div>

                        <div className="mt-6 border-t border-navy/10 pt-5">
                            <div className="flex items-center justify-between gap-3">
                                <p
                                    className="text-xl text-navy"
                                    style={{ fontFamily: "var(--font-playfair)" }}
                                >
                                    {filteredJobs.length} {filteredJobs.length === 1 ? "role" : "roles"} found
                                </p>
                                {(keyword || location !== "all" || employmentType !== "all") && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <div className="mt-6 border-l-2 border-blue-600 pl-4">
                                <p className="text-xs leading-5 text-navy/62">
                                    All applications and progress are manually managed by the
                                    Merlion hiring team.
                                </p>
                            </div>
                        </div>
                    </aside>

                    <div className="py-10 lg:py-12 lg:pl-12">
                        <div className="hidden grid-cols-[minmax(0,1fr)_120px_110px_105px_90px] gap-5 border-b border-navy/15 pb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-navy/55 md:grid">
                            <span>Role</span>
                            <span>Location</span>
                            <span>Type</span>
                            <span>Posted</span>
                            <span className="text-right">Action</span>
                        </div>

                        {loading ? (
                            <div className="flex min-h-72 items-center justify-center">
                                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="flex min-h-72 flex-col items-center justify-center text-center">
                                <BriefcaseBusiness className="h-8 w-8 text-navy/25" />
                                <h3
                                    className="mt-4 text-2xl text-navy"
                                    style={{ fontFamily: "var(--font-playfair)" }}
                                >
                                    No matching roles
                                </h3>
                                <p className="mt-2 max-w-sm text-sm leading-6 text-navy/55">
                                    Adjust your filters or return later to see new opportunities.
                                </p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div>
                                {filteredJobs.map((job) => {
                                    const expanded = expandedJobId === job._id;

                                    return (
                                        <article key={job._id} className="border-b border-navy/12">
                                            <div className="grid gap-5 py-7 md:grid-cols-[minmax(0,1fr)_120px_110px_105px_90px] md:items-center">
                                                <div>
                                                    <h3
                                                        className="text-[clamp(1.4rem,2.1vw,1.85rem)] leading-tight tracking-[-0.02em] text-navy"
                                                        style={{ fontFamily: "var(--font-playfair)" }}
                                                    >
                                                        {job.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-navy/66">
                                                    <MapPin className="h-4 w-4 shrink-0" />
                                                    <span>{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-navy/66">
                                                    <BriefcaseBusiness className="h-4 w-4 shrink-0" />
                                                    <span>{job.type}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-navy/66">
                                                    <CalendarDays className="h-4 w-4 shrink-0" />
                                                    <span>{getPostedLabel(job.createdAt)}</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    aria-expanded={expanded}
                                                    onClick={() =>
                                                        setExpandedJobId(expanded ? null : job._id)
                                                    }
                                                    className="inline-flex items-center justify-start gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800 md:justify-end"
                                                >
                                                    {expanded ? "Close" : "View role"}
                                                    <ArrowRight
                                                        className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                                                    />
                                                </button>
                                            </div>

                                            {expanded && (
                                                <div className="mb-7 border-l-2 border-blue-600 bg-[#f7f9fd] px-5 py-5">
                                                    <div
                                                        className="rich-text-preview max-w-3xl text-sm leading-7 text-navy/68"
                                                        dangerouslySetInnerHTML={{
                                                            __html: job.description,
                                                        }}
                                                    />
                                                    <div className="mt-5 flex flex-wrap items-center gap-4">
                                                        <Link
                                                            href={`/hiring/jobs/${getJobApplicationSlug(job)}/apply`}
                                                            className="inline-flex h-10 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#102c5c]"
                                                        >
                                                            Express interest
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                        <span className="inline-flex items-center gap-2 text-xs text-navy/50">
                                                            <ShieldCheck className="h-4 w-4" />
                                                            Reviewed manually by the hiring team
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

        </main>
    );
}
