"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
    _id: string;
    email: string;
    clientId?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profileImage?: string | null;
    phoneNumber?: string | null;
    dateOfBirth?: string | null;
    gender?: "male" | "female" | "other" | null;
    nationality?: string | null;
    country?: string | null;
    countryCode?: string | null;
    city?: string | null;
    address?: string | null;
    postalCode?: string | null;
    preferredCurrency?: string;
    riskProfile?: "conservative" | "moderate" | "aggressive";
    status?: string;
    kycStatus?: "pending" | "not_submitted" | "under_review" | "approved" | "rejected";
    createdAt?: string;
}

interface AuthState {
    user: AuthUser | null;
    setUser: (user: AuthUser) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: "mah-client-auth",
        }
    )
);
