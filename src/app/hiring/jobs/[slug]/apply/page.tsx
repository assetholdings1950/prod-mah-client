import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    MapPin,
    ShieldCheck,
} from "lucide-react";
import JobApplicationForm from "@/components/hiring/JobApplicationForm";
import { getActiveJobById } from "@/lib/hiring/jobs";
import {
    getJobApplicationSlug,
    getJobIdFromApplicationSlug,
} from "@/lib/hiring/jobSlug";

type ApplicationPageProps = {
    params: Promise<{ slug: string }>;
};

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://www.merlionassetholdings.com";

function getDescription(description: string) {
    const plainText = description.replace(/\s+/g, " ").trim();
    return plainText.length > 155
        ? `${plainText.slice(0, 152).trimEnd()}...`
        : plainText;
}

export async function generateMetadata({
    params,
}: ApplicationPageProps): Promise<Metadata> {
    const { slug } = await params;
    const id = getJobIdFromApplicationSlug(slug);
    if (!id) {
        return {
            title: "Vacancy not found | Merlion Asset Holdings",
            robots: { index: false, follow: false },
        };
    }
    const job = await getActiveJobById(id);

    if (!job) {
        return {
            title: "Vacancy not found | Merlion Asset Holdings",
            robots: { index: false, follow: false },
        };
    }

    const canonical = `${siteUrl}/hiring/jobs/${getJobApplicationSlug(job)}/apply`;
    const description = `Apply for ${job.title} at Merlion Asset Holdings in ${job.location}. ${getDescription(job.description)}`;

    return {
        title: `Apply for ${job.title} | Merlion Asset Holdings`,
        description,
        alternates: { canonical },
        openGraph: {
            type: "website",
            url: canonical,
            title: `Apply for ${job.title} | Merlion Asset Holdings`,
            description,
            siteName: "Merlion Asset Holdings",
        },
        twitter: {
            card: "summary_large_image",
            title: `Apply for ${job.title} | Merlion Asset Holdings`,
            description,
        },
    };
}

export default async function JobApplicationPage({
    params,
}: ApplicationPageProps) {
    const { slug } = await params;
    const id = getJobIdFromApplicationSlug(slug);
    if (!id) notFound();
    const job = await getActiveJobById(id);

    if (!job) notFound();

    const canonical = `${siteUrl}/hiring/jobs/${getJobApplicationSlug(job)}/apply`;
    const employmentType = job.type.toUpperCase().replaceAll("-", "_");
    const jobPosting = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        datePosted: job.createdAt,
        employmentType,
        hiringOrganization: {
            "@type": "Organization",
            name: "Merlion Asset Holdings",
            sameAs: siteUrl,
        },
        jobLocation: {
            "@type": "Place",
            address: {
                "@type": "PostalAddress",
                addressLocality: job.location,
            },
        },
        directApply: true,
        url: canonical,
    };

    return (
        <main className="min-h-screen bg-[#f7f9fd] pb-20 pt-16 text-navy md:pt-[88px]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jobPosting).replace(/</g, "\\u003c"),
                }}
            />

            <section className="border-b border-navy/10 bg-white">
                <div className="mx-auto max-w-[1180px] px-5 py-9 sm:px-8 md:px-12 md:py-12">
                    <Link
                        href="/hiring"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to open roles
                    </Link>

                    <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                        Careers at Merlion
                    </p>
                    <h1
                        className="mt-3 max-w-4xl text-[clamp(2.4rem,5vw,4.75rem)] font-normal leading-[1.02] tracking-[-0.04em] text-navy"
                        style={{ fontFamily: "var(--font-playfair)" }}
                    >
                        Apply for {job.title}
                    </h1>

                    <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-navy/62">
                        <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <BriefcaseBusiness className="h-4 w-4" />
                            {job.type}
                        </span>
                        {job.createdAt && (
                            <span className="inline-flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Posted {new Intl.DateTimeFormat("en", {
                                    dateStyle: "medium",
                                }).format(new Date(job.createdAt))}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-10 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:py-14">
                <section className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
                    <JobApplicationForm jobId={job._id} jobTitle={job.title} />
                </section>

                <aside className="min-w-0 space-y-6 lg:sticky lg:top-28">
                    <section className="min-w-0 overflow-hidden rounded-xl border border-navy/10 bg-white p-6">
                        <h2
                            className="text-2xl text-navy"
                            style={{ fontFamily: "var(--font-playfair)" }}
                        >
                            About the role
                        </h2>
                        <div
                            className="rich-text-preview mt-4 min-w-0 max-w-full overflow-hidden text-sm leading-7 text-navy/65"
                            dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                    </section>

                    <section className="rounded-xl border-l-2 border-blue-600 bg-white p-6">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        <h2 className="mt-4 text-sm font-bold text-navy">
                            Manual and confidential review
                        </h2>
                        <p className="mt-2 text-xs leading-6 text-navy/58">
                            Every submission is reviewed directly by the Merlion hiring
                            team. Your information is used only for recruitment purposes.
                        </p>
                    </section>
                </aside>
            </div>
        </main>
    );
}
