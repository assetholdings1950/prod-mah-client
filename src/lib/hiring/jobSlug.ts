import type { HiringJob } from "./jobs";

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function getJobApplicationSlug(job: Pick<HiringJob, "_id" | "title">) {
    return `${slugify(job.title)}-${job._id}`;
}

export function getJobIdFromApplicationSlug(slug: string) {
    const match = slug.match(/([a-f0-9]{24})$/i);
    return match?.[1];
}
