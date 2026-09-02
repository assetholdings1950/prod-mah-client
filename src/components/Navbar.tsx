"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gift, LogOut, User, LayoutDashboard, PieChart } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import appClient from "@/lib/appClient";
import {
  REWARD_BANNER_EVENT,
  REWARD_BANNER_STORAGE_KEY,
  useRewardBannerVisible,
} from "@/components/WalletRewardBanner";

const NAV_ITEMS = ["Funds", "About", "Hiring", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const rewardBannerVisible = useRewardBannerVisible();

  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const reopenRewardBanner = () => {
    localStorage.removeItem(REWARD_BANNER_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(REWARD_BANNER_EVENT, { detail: { visible: true } }),
    );
    if (pathname !== "/") router.push("/");
  };

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLoginOpen(false); setUserOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    setUserOpen(false);
    setMenuOpen(false);
    try {
      await appClient.post("/api/auth/logout");
    } catch {
      // ignore
    }
    clearUser();
    router.push("/");
  };

  const displayName = user
    ? (user.firstName || user.fullName || user.email.split("@")[0])
    : null;

  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() ||
    user.email[0].toUpperCase()
    : "";

  const forceSolid = pathname === "/hiring" || pathname.startsWith("/hiring/");
  const glassed = scrolled || menuOpen || forceSolid;

  return (
    <>
      {/* ── Main bar ─────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] h-16 md:h-[88px]"
        style={{
          background: forceSolid
            ? "rgba(255,255,255,0.97)"
            : glassed
              ? "rgba(248,250,252,0.80)"
              : "transparent",
          backdropFilter: glassed ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: glassed ? "blur(20px) saturate(180%)" : "none",
          boxShadow: glassed ? "0 1px 0 rgba(8,27,58,0.08), 0 4px 32px rgba(8,27,58,0.07)" : "none",
          transition: "background 400ms cubic-bezier(0.4,0,0.2,1), backdrop-filter 400ms cubic-bezier(0.4,0,0.2,1), box-shadow 400ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-8 md:px-12 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/mah-logo.jpeg"
              alt="Merlion Asset Holdings"
              width={150}
              height={88}
              className="h-9 md:h-13 w-auto rounded-lg object-cover"
            />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex gap-10 lg:gap-12 list-none m-0 p-0 flex-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <li key={item}><NavLink label={item} /></li>
            ))}
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {!rewardBannerVisible && (
              <button
                type="button"
                onClick={reopenRewardBanner}
                className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-full border border-[#2563eb]/25 bg-[#edf4ff] text-xs font-semibold text-[#174fb8] shadow-[0_4px_16px_rgba(37,99,235,.10)] transition hover:-translate-y-0.5 hover:bg-[#e3edff] sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                aria-label="Show Merlion welcome offer"
              >
                <Gift className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">Welcome offer</span>
                <span className="hidden sm:inline lg:hidden">Offer</span>
              </button>
            )}

            {user ? (
              /* ── Logged-in user menu ── */
              <div ref={userRef} className="hidden md:block relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={userOpen}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-navy/15 bg-white/70 text-navy font-medium text-sm tracking-[0.01em] cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-[0_4px_16px_rgba(8,27,58,0.12)] backdrop-blur"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B2E84] text-white text-xs font-bold">
                    {initials}
                  </span>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`opacity-50 transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* User dropdown */}
                <div
                  className={`absolute right-0 top-[calc(100%+10px)] w-60 bg-white rounded-2xl shadow-[0_16px_48px_rgba(8,27,58,0.14)] border border-navy/[0.07] overflow-hidden transition-[opacity,transform] duration-200 origin-top-right ${userOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-navy/[0.06]">
                    <p className="text-sm font-semibold text-navy truncate">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.fullName || displayName}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                    {user.kycStatus && (
                      <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${user.kycStatus === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : user.kycStatus === "under_review"
                          ? "bg-amber-50 text-amber-700"
                          : user.kycStatus === "rejected"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                        KYC: {user.kycStatus.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  <div className="p-1.5">

                    <Link
                      href="/dashboard"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy font-medium hover:bg-navy/[0.04] transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 opacity-60" />
                      Dashboard
                    </Link>
                    <Link
                      href="/portfolio"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy font-medium hover:bg-navy/[0.04] transition-colors"
                    >
                      <PieChart className="h-4 w-4 opacity-60" />
                      Portfolio
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy font-medium hover:bg-navy/[0.04] transition-colors"
                    >
                      <User className="h-4 w-4 opacity-60" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600 font-medium hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Login button + dropdown ── */
              <div ref={loginRef} className="hidden md:block relative">
                <button
                  onClick={() => setLoginOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={loginOpen}
                  className="flex items-center gap-2 pl-4 pr-3 py-2 rounded-full bg-navy text-white font-[var(--font-inter,sans-serif)] font-medium text-sm tracking-[0.02em] cursor-pointer transition-all duration-200 hover:bg-[var(--navy-2)] hover:shadow-[0_6px_20px_rgba(8,27,58,0.25)]"
                >
                  Login
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Login dropdown */}
                <div
                  className={`absolute right-0 top-[calc(100%+10px)] w-52 bg-white rounded-2xl shadow-[0_16px_48px_rgba(8,27,58,0.14)] border border-navy/[0.07] overflow-hidden transition-[opacity,transform] duration-200 origin-top-right ${loginOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                >
                  <div className="p-1.5">
                    <LoginOption
                      href="/login"
                      icon={<ClientIcon />}
                      label="Client Login"
                      sub="Access your portfolio"
                      onClick={() => setLoginOpen(false)}
                    />
                    <LoginOption
                      href="https://agent.merlionassetholdings.com/"
                      icon={<AgentIcon />}
                      label="Agent Login"
                      sub="Partner & advisor portal"
                      onClick={() => setLoginOpen(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl border border-navy/10 bg-navy/[0.04] cursor-pointer"
            >
              <span className={`block w-5 h-[1.5px] bg-navy rounded-full transition-all duration-300 origin-center ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-navy rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-navy rounded-full transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen menu ─────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[99] flex flex-col md:hidden transition-[opacity,visibility] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        style={{ background: "rgba(248,250,252,0.98)", backdropFilter: "blur(24px)" }}
      >
        <div className="h-16 shrink-0" />

        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 pb-12 overflow-y-auto">

          {/* Nav links */}
          <ul className="flex flex-col items-center gap-7 list-none m-0 p-0 w-full">
            {NAV_ITEMS.map((item, i) => (
              <li
                key={item}
                className="w-full text-center"
                style={{ animation: menuOpen ? `fade-up 0.4s ${i * 0.07}s both` : "none" }}
              >
                <Link
                  href={`/${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-[var(--font-inter,sans-serif)] font-semibold text-[2.25rem] leading-none text-navy opacity-75 hover:opacity-100 no-underline transition-opacity duration-200 tracking-[-0.02em]"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>

          <div className="w-full max-w-[200px] h-px bg-navy/10" />

          {/* Mobile: logged-in vs login links */}
          <div
            className="w-full max-w-[320px] flex flex-col gap-3"
            style={{ animation: menuOpen ? "fade-up 0.4s 0.22s both" : "none" }}
          >
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-[#eef4ff] px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2E84] text-white text-sm font-bold shrink-0">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-navy truncate">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.fullName || displayName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-navy/15 bg-white text-navy font-semibold text-sm no-underline"
                >
                  <LayoutDashboard className="h-4 w-4 opacity-60" />
                  Dashboard
                </Link>
                <Link
                  href="/portfolio"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-navy/15 bg-white text-navy font-semibold text-sm no-underline"
                >
                  <PieChart className="h-4 w-4 opacity-60" />
                  Portfolio
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-navy/15 bg-white text-navy font-semibold text-sm no-underline"
                >
                  <User className="h-4 w-4 opacity-60" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 font-semibold text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <p className="font-[var(--font-inter,sans-serif)] text-xs tracking-[0.18em] uppercase text-[var(--text-muted)] text-center mb-1">
                  Login Portal
                </p>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl bg-navy text-white no-underline transition-all duration-200 hover:bg-[var(--navy-2)]"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <ClientIcon white />
                  </span>
                  <div className="text-left">
                    <div className="font-[var(--font-inter,sans-serif)] font-semibold text-sm">Client Login</div>
                    <div className="font-[var(--font-inter,sans-serif)] text-xs text-white/60 mt-0.5">Access your portfolio</div>
                  </div>
                  <svg className="ml-auto opacity-50" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <Link
                  href="https://mah-agent-frontend.vercel.app"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border border-navy/15 bg-white text-navy no-underline transition-all duration-200 hover:bg-navy/[0.04]"
                >
                  <span className="w-9 h-9 rounded-xl bg-navy/[0.07] flex items-center justify-center shrink-0">
                    <AgentIcon />
                  </span>
                  <div className="text-left">
                    <div className="font-[var(--font-inter,sans-serif)] font-semibold text-sm text-navy">Agent Login</div>
                    <div className="font-[var(--font-inter,sans-serif)] text-xs text-[var(--text-muted)] mt-0.5">Partner & advisor portal</div>
                  </div>
                  <svg className="ml-auto opacity-30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Login dropdown option ─────────────────────────────────────── */
function LoginOption({
  href, icon, label, sub, onClick,
}: {
  href: string; icon: React.ReactNode; label: string; sub: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline transition-colors duration-150"
      style={{ background: hov ? "rgba(8,27,58,0.04)" : "transparent" }}
    >
      <span className="w-8 h-8 rounded-lg bg-navy/[0.07] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div>
        <div className="font-[var(--font-inter,sans-serif)] font-semibold text-sm text-navy leading-none">
          {label}
        </div>
        <div className="font-[var(--font-inter,sans-serif)] text-xs text-[var(--text-muted)] mt-1 leading-none">
          {sub}
        </div>
      </div>
    </Link>
  );
}

/* ── Desktop NavLink ───────────────────────────────────────────── */
function NavLink({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/${label.toLowerCase()}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`font-[var(--font-inter,sans-serif)] font-medium text-sm tracking-[0.02em] no-underline relative pb-1 transition-opacity duration-[250ms] text-navy ${hovered ? "opacity-100" : "opacity-[0.68]"
        }`}
    >
      {label}
      <span
        className={`absolute bottom-0 left-0 right-0 h-px bg-navy transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] origin-left ${hovered ? "scale-x-100" : "scale-x-0"
          }`}
      />
    </Link>
  );
}

/* ── Icons ─────────────────────────────────────────────────────── */
function ClientIcon({ white = false }: { white?: boolean }) {
  const stroke = white ? "#fff" : "var(--navy)";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
