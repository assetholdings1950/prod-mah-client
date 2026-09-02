"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import appClient from "@/lib/appClient";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { TopHeader } from "@/components/dashboard/top-header";
import { AccountManagerSupport } from "@/components/dashboard/account-manager-support";

const SIDEBAR_OPEN = 244;
const SIDEBAR_COLLAPSED = 76;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearUser } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Close mobile drawer on route change
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    // KYC gate — runs after hydration to avoid SSR mismatch
    useEffect(() => {
        if (!mounted) return;
        if (user && user.kycStatus && user.kycStatus !== "approved" && pathname !== "/kyc") {
            router.replace("/kyc");
        }
    }, [mounted, user, pathname, router]);

    const handleLogout = async () => {
        try {
            await appClient.post("/api/auth/logout");
        } finally {
            clearUser();
            router.replace("/");
        }
    };

    // Skeleton while Zustand hydrates — prevents flash of gated content
    if (!mounted) {
        return (
            <div className="flex h-screen overflow-hidden bg-[#EEF3FB]">
                <div className="w-[244px] shrink-0 bg-[#0B1628]" />
                <div className="flex-1 animate-pulse bg-[#EEF3FB]" />
            </div>
        );
    }

    const kycBlocked = !!user && !!user.kycStatus && user.kycStatus !== "approved" && pathname !== "/kyc";

    const sidebarUser = user
        ? {
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.fullName || user.email,
            email: user.email,
            kycStatus: user.kycStatus,
        }
        : null;

    return (
        <div className="flex h-screen overflow-hidden bg-[#EEF3FB]">

            {/* ── Desktop sidebar ── */}
            <motion.aside
                animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_OPEN }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className="relative hidden flex-shrink-0 flex-col overflow-hidden bg-[#0B1628] lg:flex"
            >
                {/* Subtle dot texture */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
                    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="dash-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="#90b8e8" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dash-dots)" />
                    </svg>
                </div>

                <div className="relative z-10 flex h-full flex-col">
                    <SidebarContent
                        collapsed={collapsed}
                        pathname={pathname}
                        user={sidebarUser}
                        onLogout={handleLogout}
                    />
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="absolute -right-3 top-[26px] z-20 flex h-6 w-6 items-center justify-center rounded-full border border-[#1c2c47] bg-[#0B1628] text-white/50 shadow-md transition-colors hover:border-[#1D4ED8]/50 hover:text-white"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
                        <ChevronLeft className="h-3 w-3" />
                    </motion.div>
                </button>
            </motion.aside>

            {/* ── Mobile drawer ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 240 }}
                            className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#0B1628] shadow-2xl lg:hidden"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute right-3 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white"
                                aria-label="Close menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <SidebarContent
                                collapsed={false}
                                pathname={pathname}
                                user={sidebarUser}
                                onLogout={handleLogout}
                                onNavigate={() => setMobileOpen(false)}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main content ── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopHeader
                    pathname={pathname}
                    user={sidebarUser}
                    onLogout={handleLogout}
                    onOpenMobile={() => setMobileOpen(true)}
                />
                <main className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>{kycBlocked ? null : children}</main>
            </div>
            <AccountManagerSupport />
        </div>
    );
}
