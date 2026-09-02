"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChartNoAxesCombined, Clock3, ShieldCheck } from "lucide-react";

const MarketWaveCanvas = dynamic(() => import("./MarketWaveCanvas"), { ssr: false });

const storeLinks = {
  apple: process.env.NEXT_PUBLIC_APP_STORE_URL || "https://www.apple.com/app-store/",
  google: process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || "https://play.google.com/store/apps",
};

const benefits = [
  { icon: ShieldCheck, label: "Secure access" },
  { icon: ChartNoAxesCombined, label: "Live portfolio view" },
  { icon: Clock3, label: "Account activity" },
];

export default function MobileAppSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      gsap.from("[data-app-reveal]", {
        opacity: 0,
        y: 34,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%", once: true },
      });
      gsap.from("[data-phone-pair]", {
        opacity: 0,
        y: 80,
        rotateX: 7,
        scale: 0.94,
        duration: 1.35,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 58%", once: true },
      });
      gsap.to("[data-phone-pair]", {
        yPercent: -2.5,
        duration: 4.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="mobile-app-section" aria-labelledby="mobile-app-title">
      <MarketWaveCanvas />
      <div className="mobile-app-glow" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col items-center px-5 pt-14 sm:px-8 sm:pt-16 lg:px-12 lg:pt-16">
        <h2 id="mobile-app-title" data-app-reveal className="mobile-app-heading">
          Merlion, wherever
          <span>capital moves.</span>
        </h2>
        <p data-app-reveal className="mobile-app-copy">
          The Merlion Asset Holdings app is now available on iOS and Android.
        </p>

        <div data-app-reveal className="mt-7 flex flex-col items-stretch gap-3 min-[430px]:flex-row min-[430px]:items-center">
          <a className="store-badge" href={storeLinks.apple} target="_blank" rel="noreferrer" aria-label="Download the Merlion app on the App Store">
            <Image src="/mobile-app/app-store-badge.png" alt="Download on the App Store" width={237} height={75} priority unoptimized />
          </a>
          <a className="store-badge" href={storeLinks.google} target="_blank" rel="noreferrer" aria-label="Get the Merlion app on Google Play">
            <Image src="/mobile-app/google-play-badge.png" alt="Get it on Google Play" width={253} height={75} priority unoptimized />
          </a>
        </div>

        <div data-phone-pair className="mobile-app-phone-stage relative mt-5 w-full max-w-[960px] will-change-transform sm:mt-6">
          <Image
            src="/mobile-app/merlion-phone-pair.png"
            alt="Merlion Asset Holdings app showing a portfolio overview and fund performance"
            width={1274}
            height={887}
            sizes="(max-width: 768px) 112vw, 930px"
            className="relative left-1/2 h-auto w-[160%] max-w-none -translate-x-1/2 drop-shadow-[0_35px_55px_rgba(0,0,0,0.55)]"
          />
        </div>
      </div>

      <div className="mobile-app-benefits relative z-20">
        {benefits.map(({ icon: Icon, label }) => (
          <div key={label} data-app-reveal className="mobile-app-benefit">
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
