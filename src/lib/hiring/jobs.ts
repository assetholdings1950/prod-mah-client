import { cache } from "react";
import apiClient from "@/lib/apiClient";
import { BACKEND_ENDPOINTS } from "@/lib/config/apiConfig";

export type HiringJob = {
    _id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
};

type JobsResponse = {
    success?: boolean;
    data?: HiringJob[];
};

export const getActiveJobs = cache(async (): Promise<HiringJob[]> => {
    try {
        const response = await apiClient.get<JobsResponse>(
            BACKEND_ENDPOINTS.jobs.list,
        );

        return response.data?.success && Array.isArray(response.data.data)
            ? response.data.data
            : [];
    } catch {
        return [];
    }
});

export const getActiveJobById = cache(async (id: string) => {
    const jobs = await getActiveJobs();
    return jobs.find((job) => job._id === id);
});
