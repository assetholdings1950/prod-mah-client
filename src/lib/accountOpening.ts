import type { AuthUser } from "@/store/authStore";

export const ACCOUNT_OPENING_VERSION = "2026.1";

export type ProfileRequirement = {
    key: keyof Pick<AuthUser, "phoneNumber" | "country" | "city" | "countryCode" | "postalCode" | "address">;
    label: string;
};

export const PROFILE_REQUIREMENTS: ProfileRequirement[] = [
    { key: "phoneNumber", label: "Phone number" }, { key: "country", label: "Country" },
    { key: "city", label: "City" }, { key: "countryCode", label: "Country code" },
    { key: "postalCode", label: "Postal code" }, { key: "address", label: "Street address" },
];

export type AccountOpeningDeclaration = {
    employmentStatus: string; occupation: string; employerName: string; annualIncome: string;
    sourceOfFunds: string; estimatedNetWorth: string; investmentObjective: string;
    investmentExperience: string; taxResidency: string; taxIdentificationNumber: string;
    politicallyExposed: string; usPerson: string; beneficialOwner: string;
};

export type AccountOpeningRecord = {
    _id: string;
    client: string;
    version: string;
    legalName: string;
    signatureUrl: string;
    signaturePublicId: string;
    declaration: AccountOpeningDeclaration;
    status: "pending" | "approved" | "rejected";
    adminRemarks?: string;
    submittedAt: string;
    reviewedAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

export function getMissingProfileRequirements(profile: Partial<AuthUser> | null | undefined) {
    return PROFILE_REQUIREMENTS.filter(({ key }) => {
        const value = profile?.[key];
        return typeof value !== "string" || value.trim().length === 0;
    });
}

export async function fetchAccountOpeningRecord(): Promise<AccountOpeningRecord | null> {
    const response = await fetch("/api/account-forms", { method: "GET", cache: "no-store" });
    const body = await response.json();
    if (!response.ok || body?.status === false) throw new Error(body?.message || "Unable to fetch account form status.");
    return body?.data ?? null;
}

export async function isAccountOpeningApproved() {
    return (await fetchAccountOpeningRecord())?.status === "approved";
}
