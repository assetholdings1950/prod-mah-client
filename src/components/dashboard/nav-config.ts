import { LayoutDashboard, TrendingUp, Wallet, ShieldCheck, CreditCard, UserCircle, ArrowLeftRight, BriefcaseBusiness, FileSignature, Gift, Bell, Headset } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard",       href: "/dashboard",       icon: LayoutDashboard },
    { label: "Browse Plans",    href: "/investments",     icon: TrendingUp },
    { label: "My Portfolio",    href: "/portfolio",       icon: BriefcaseBusiness },
    { label: "Wallet",          href: "/wallet",          icon: Wallet },
    { label: "Transactions",    href: "/transactions",    icon: ArrowLeftRight },
    { label: "Payment Methods", href: "/payment-methods", icon: CreditCard },
    { label: "KYC Verification",href: "/kyc",             icon: ShieldCheck },
    { label: "Account Opening", href: "/account-opening", icon: FileSignature },
    { label: "Profile",         href: "/profile",         icon: UserCircle },
    { label: "Refer & Earn",    href: "/referrals",       icon: Gift },
    { label: "Notifications",   href: "/notifications",   icon: Bell },
];

// Routes that require approved KYC — /kyc itself is always accessible
export const KYC_GATED = ["/dashboard", "/investments", "/wallet", "/payment-methods", "/account-opening"];

export const KYC_BADGE: Record<string, { label: string; className: string }> = {
    approved: { label: "Verified", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    pending: { label: "Pending Review", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    rejected: { label: "Action Needed", className: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
};

export const KYC_BADGE_DEFAULT = {
    label: "Not Started",
    className: "bg-white/10 text-white/45 border-white/10",
};
