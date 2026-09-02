"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./sidebar-avatar";
import { NAV_ITEMS, KYC_BADGE, KYC_BADGE_DEFAULT } from "./nav-config";
import fullLogo from "@/assets/MAH_main-logo.jpeg";
import iconLogo from "@/app/icon.png";

type SidebarUser = {
    name?: string | null;
    email?: string | null;
    kycStatus?: string;
};

type SidebarContentProps = {
    collapsed: boolean;
    pathname: string;
    user: SidebarUser | null | undefined;
    onLogout: () => void;
    onNavigate?: () => void;
};

export function SidebarContent({
    collapsed,
    pathname,
    user,
    onLogout,
    onNavigate,
}: SidebarContentProps) {
    const kyc = (user?.kycStatus && KYC_BADGE[user.kycStatus]) || KYC_BADGE_DEFAULT;

    return (
        <>
            {/* Logo */}
            <div className="flex h-[64px] flex-shrink-0 items-center justify-center border-b border-white/[0.08] px-4">
                <AnimatePresence mode="wait" initial={false}>
                    {collapsed ? (
                        <motion.div
                            key="icon"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Image
                                src={iconLogo}
                                alt="MAH"
                                width={38}
                                height={38}
                                className="rounded-xl object-contain"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="flex w-full items-center justify-center"
                        >
                            <div className="rounded-xl bg-white/95 px-3 py-1.5">
                                <Image
                                    src={fullLogo}
                                    alt="Merlion Asset Holdings"
                                    height={32}
                                    className="h-8 w-auto object-contain"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Profile card */}
            <AnimatePresence>
                {!collapsed ? (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-3 mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-3"
                    >
                        <div className="flex items-center gap-2.5">
                            <Avatar name={user?.name} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[12.5px] font-bold text-white">
                                    {user?.name ?? "Investor"}
                                </p>
                                <p className="truncate text-[10.5px] text-white/35">
                                    {user?.email ?? "—"}
                                </p>
                            </div>
                        </div>
                        <span
                            className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${kyc.className}`}
                        >
                            <ShieldCheck className="h-2.5 w-2.5" />
                            {kyc.label}
                        </span>
                    </motion.div>
                ) : (
                    <div className="mt-4 flex justify-center">
                        <Avatar name={user?.name} />
                    </div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <nav data-lenis-prevent className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/25">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/25"
                        >
                            Main Menu
                        </motion.p>
                    )}
                </AnimatePresence>

                <ul className="space-y-1">
                    {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                        const active = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <li key={href} className="relative">
                                <Link
                                    href={href}
                                    onClick={onNavigate}
                                    title={collapsed ? label : undefined}
                                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-[10px] text-[13px] font-medium transition-colors duration-150 ${collapsed ? "justify-center" : ""
                                        } ${active ? "text-white" : "text-white/50 hover:bg-white/[0.06] hover:text-white"}`}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="dashboard-nav-active"
                                            className="absolute inset-0 rounded-xl bg-[#1D4ED8] shadow-[0_4px_18px_rgba(29,78,216,0.32)]"
                                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                        />
                                    )}
                                    <Icon className="relative z-10 h-[17px] w-[17px] flex-shrink-0" />
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="relative z-10 flex-1 truncate"
                                            >
                                                {label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {active && !collapsed && (
                                        <ChevronRight className="relative z-10 h-3 w-3 flex-shrink-0 opacity-60" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom section */}
            <div className="border-t border-white/[0.08] px-3 pb-5 pt-3">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-2 overflow-hidden rounded-xl bg-white/[0.06] px-4 py-3"
                        >
                            <div className="mb-1 flex items-center gap-2">
                                <HelpCircle className="h-[15px] w-[15px] text-white/55" />
                                <p className="text-xs font-bold text-white">Need Help?</p>
                            </div>
                            <p className="text-[11px] leading-relaxed text-white/40">
                                Our support team is here to assist you.
                            </p>
                            <button className="mt-2.5 w-full rounded-lg border border-white/[0.16] py-[5px] text-[11px] font-bold text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white">
                                Contact Support
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={onLogout}
                    title={collapsed ? "Logout" : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-[10px] text-[13px] font-medium text-white/45 transition-colors hover:bg-rose-500/10 hover:text-rose-300 ${collapsed ? "justify-center" : ""}`}
                >
                    <LogOut className="h-[17px] w-[17px] flex-shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </>
    );
}
