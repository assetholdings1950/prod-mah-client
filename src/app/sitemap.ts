import type { MetadataRoute } from "next";
import apiClient from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { getJobApplicationSlug } from "@/lib/hiring/jobSlug";
import { getActiveJobs } from "@/lib/hiring/jobs";

const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://www.merlionassetholdings.com"
).replace(/\/$/, "");

const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/funds`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/hiring`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/hiring/express-interest`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/consult-with-us`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/compliance`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/risk-disclosure`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.3 },
];

type SitemapFund = {
    _id?: string;
    slug?: string;
    status?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
};

function validDate(value?: string | Date) {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function getActiveFunds(): Promise<SitemapFund[]> {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.investmentPlans.getList(
                "1",
                "1000",
                "",
                undefined,
                "active",
            ),
        );
        const payload = response.data?.data ??
            response.data?.plans ??
            response.data?.investmentPlans;
        const funds = Array.isArray(payload) ? payload : payload?.docs;

        return Array.isArray(funds) ? funds : [];
    } catch {
        return [];
    }
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [jobs, funds] = await Promise.all([
        getActiveJobs(),
        getActiveFunds(),
    ]);

    const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
        url: `${SITE_URL}/hiring/jobs/${getJobApplicationSlug(job)}/apply`,
        lastModified: validDate(job.updatedAt ?? job.createdAt),
        changeFrequency: "daily",
        priority: 0.7,
    }));

    const fundPages: MetadataRoute.Sitemap = funds
        .filter((fund) => fund.status === "active" && (fund.slug || fund._id))
        .map((fund) => ({
            url: `${SITE_URL}/funds/${encodeURIComponent(fund.slug || fund._id || "")}`,
            lastModified: validDate(fund.updatedAt ?? fund.createdAt),
            changeFrequency: "weekly",
            priority: 0.8,
        }));

    return Array.from(
        new Map(
            [...staticPages, ...jobPages, ...fundPages].map((entry) => [
                entry.url,
                entry,
            ]),
        ).values(),
    );
}
