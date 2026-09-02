"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, ChevronDown, User, Settings, LogOut, Clock, FileText, LayoutDashboard, PieChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./sidebar-avatar";
import { NAV_ITEMS } from "./nav-config";
import { WalletMenu } from "./wallet-menu";

type HeaderUser = {
    name?: string | null;
    email?: string | null;
};

type TopHeaderProps = {
    pathname: string;
    user: HeaderUser | null | undefined;
    onLogout: () => void;
    onOpenMobile: () => void;
};

export function TopHeader({ pathname, user, onLogout, onOpenMobile }: TopHeaderProps) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const activeItem = NAV_ITEMS.find(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    );
    const pageTitle = activeItem?.label ?? "Overview";

    return (
        <header className="sticky top-0 z-20 flex h-[64px] flex-shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6">
            {/* Left — breadcrumb + mobile menu trigger */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenMobile}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#0F172A]/60 transition-colors hover:bg-[#F8FAFC] lg:hidden"
                    aria-label="Open menu"
                >
                    <Menu className="h-4 w-4" />
                </button>
                <div>
                    <p className="text-[11px] text-[#0F172A]/35">Main Menu / {pageTitle}</p>
                    <p className="text-[15px] font-bold text-[#0F172A]">{pageTitle}</p>
                </div>
            </div>

            {/* Right — wallet menu + account form + notifications + user menu */}
            <div className="flex items-center gap-2.5">

                {/* Wallet dropdown */}
                <WalletMenu />

                {/* Account Opening Form */}
                <Link href="/account-opening" className={`hidden items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/30 sm:flex ${pathname === "/account-opening" ? "border-[#1D4ED8] bg-[#1D4ED8] text-white" : "border-[#1D4ED8]/30 bg-[#1D4ED8]/5 text-[#1D4ED8] hover:bg-[#1D4ED8]/10"}`}>
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    Account Opening Form
                </Link>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => { setNotifOpen((o) => !o); setUserMenuOpen(false); }}
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#0F172A]/55 transition-colors hover:bg-[#F8FAFC]"
                        aria-label="Notifications"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D85A30]" />
                    </button>

                    <AnimatePresence>
                        {notifOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.12)]"
                                >
                                    <div className="border-b border-[#E2E8F0] px-4 py-3">
                                        <p className="text-xs font-bold text-[#0F172A]">Notifications</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                                        <Clock className="h-5 w-5 text-[#0F172A]/20" />
                                        <p className="text-xs text-[#0F172A]/40">
                                            You&apos;re all caught up — no new notifications.
                                        </p>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => { setUserMenuOpen((o) => !o); setNotifOpen(false); }}
                        className="flex items-center gap-2 rounded-full border border-[#E2E8F0] py-1 pl-1 pr-2.5 transition-colors hover:bg-[#F8FAFC]"
                    >
                        <Avatar name={user?.name} size="sm" />
                        <span className="hidden text-xs font-bold text-[#0F172A] sm:inline">
                            {(user?.name ?? "Investor").split(" ")[0]}
                        </span>
                        <ChevronDown
                            className={`h-3.5 w-3.5 text-[#0F172A]/35 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    <AnimatePresence>
                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.12)]"
                                >
                                    <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] px-4 py-3">
                                        <Avatar name={user?.name} />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-[#0F172A]">
                                                {user?.name ?? "Investor"}
                                            </p>
                                            <p className="truncate text-[10.5px] text-[#0F172A]/40">
                                                {user?.email ?? "—"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-1.5">
                                        <Link
                                            href="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#0F172A]/70 transition-colors hover:bg-[#F8FAFC]"
                                        >
                                            <User className="h-3.5 w-3.5" /> View Profile
                                        </Link>
                                        <div className="my-1 border-t border-[#E2E8F0]" />
                                        <button
                                            onClick={onLogout}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                                        >
                                            <LogOut className="h-3.5 w-3.5" /> Logout
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
