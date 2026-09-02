"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import MarketWaveCanvas from "@/components/mobile-app/MarketWaveCanvas";

export const REWARD_BANNER_STORAGE_KEY = "mah-reward-banner-dismissed";
export const REWARD_BANNER_EVENT = "mah:reward-banner";

function subscribeToRewardBanner(callback: () => void) {
  window.addEventListener(REWARD_BANNER_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(REWARD_BANNER_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getRewardBannerSnapshot() {
  return localStorage.getItem(REWARD_BANNER_STORAGE_KEY) !== "true";
}

export function useRewardBannerVisible() {
  return useSyncExternalStore(subscribeToRewardBanner, getRewardBannerSnapshot, () => true);
}

export default function WalletRewardBanner() {
  const isVisible = useRewardBannerVisible();

  const dismiss = () => {
    localStorage.setItem(REWARD_BANNER_STORAGE_KEY, "true");
    window.dispatchEvent(
      new CustomEvent(REWARD_BANNER_EVENT, { detail: { visible: false } }),
    );
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Merlion welcome offer"
      className="relative z-20 w-full overflow-hidden border-y border-[#d7e2f1] bg-white shadow-[0_12px_36px_rgba(8,27,58,0.08)]"
    >
      <div className="grid min-h-[190px] lg:min-h-[176px] lg:grid-cols-[43%_57%]">
        <section className="relative flex min-w-0 flex-col justify-center overflow-hidden bg-[#fbfdff] px-5 py-7 sm:px-8 lg:z-10 lg:-mr-[60px] lg:px-[clamp(40px,5vw,84px)] lg:py-6 lg:pr-[110px] lg:[clip-path:polygon(0_0,100%_0,calc(100%_-_60px)_100%,0_100%)]">
          <div className="absolute inset-0 opacity-35" aria-hidden="true">
            <MarketWaveCanvas />
          </div>
          <div className="relative z-10 max-w-[650px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1761e8] sm:text-xs">
              Merlion welcome offer
            </p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-[clamp(1.75rem,3vw,3rem)] font-bold leading-[1.05] tracking-[-0.035em] text-[#081b3a]">
              Your first move, <em className="font-normal text-[#2563eb]">rewarded.</em>
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#42526b] sm:text-sm">
              Register or consult with our team to begin.
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#071b3b] px-5 py-6 text-white sm:px-8 lg:pl-[90px] lg:pr-[42px]">
          <div className="absolute inset-0 opacity-75" aria-hidden="true">
            <MarketWaveCanvas />
          </div>
          <div className="relative z-10 grid h-full items-center gap-5 sm:grid-cols-2 lg:grid-cols-[minmax(120px,.8fr)_1px_minmax(160px,.9fr)_minmax(270px,1.45fr)] lg:gap-5">
            <div>
              <p className="whitespace-nowrap font-[var(--font-playfair)] text-3xl leading-none sm:text-4xl lg:text-[2.3rem]">
                USD <span className="italic text-[#3477ef]">25</span>
              </p>
              <p className="mt-2 text-[11px] text-white/70 sm:text-xs">After registration</p>
            </div>

            <div className="hidden h-20 bg-white/28 lg:block" aria-hidden="true" />

            <div>
              <p className="whitespace-nowrap font-[var(--font-playfair)] text-3xl leading-none sm:text-4xl lg:text-[2.3rem]">
                USD <span className="italic text-[#3477ef]">50</span>
              </p>
              <p className="mt-2 max-w-[190px] text-[11px] leading-4 text-white/70 sm:text-xs">
                After consultation + registration
              </p>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <div className="grid grid-cols-2 gap-2 lg:flex lg:justify-end lg:gap-3">
                <Link
                  href="/signup"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-[#081b3a] shadow-[0_8px_24px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5 hover:bg-[#f1f5ff] sm:text-sm lg:min-w-[132px]"
                >
                  Register now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/consult-with-us"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/65 px-4 text-center text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 sm:text-sm lg:min-w-[142px]"
                >
                  Consult with us
                </Link>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/55 lg:text-right">
                Rewards are added after manual eligibility verification.{" "}
                <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-white">
                  View terms
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss promotion"
        className="absolute right-3 top-3 z-30 grid h-9 w-9 place-items-center rounded-full border border-[#081b3a]/15 bg-white/80 text-[#081b3a] shadow-sm backdrop-blur transition hover:rotate-90 hover:bg-white lg:border-white/65 lg:bg-transparent lg:text-white lg:hover:bg-white/10"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </aside>
  );
}
