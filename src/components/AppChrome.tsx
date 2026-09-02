"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WalletRewardBanner from "@/components/WalletRewardBanner";

const AUTH_ROUTES = ["/signup", "/login", "/forgot-password"];
const DASHBOARD_ROUTES = ["/dashboard", "/investments", "/wallet", "/kyc", "/payment-methods", "/profile", "/transactions", "/portfolio", "/account-opening", "/referrals", "/notifications"];

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isDashboardRoute = DASHBOARD_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (isAuthRoute || isDashboardRoute) return <>{children}</>;

  return (
    <>
      <Navbar />
      {pathname === "/" && (
        <div className="pt-16 md:pt-[88px]">
          <WalletRewardBanner />
        </div>
      )}
      {children}
      <Footer />
    </>
  );
}
