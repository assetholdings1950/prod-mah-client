"use client";

import type { ReactNode } from "react";
import SoftAurora from "@/components/UI/SoftAurora";

type AuthShellProps = {
  children: ReactNode;
  cardWidth?: string;
};

export default function AuthShell({
  children,
  cardWidth = "max-w-[700px]",
}: AuthShellProps) {
  return (
    <main className="relative h-screen overflow-hidden bg-[#eef6ff] text-[#071F55]">
      <div className="absolute inset-0 pointer-events-none opacity-100">
        <SoftAurora
          speed={0.8}
          scale={1.55}
          brightness={1.05}
          color1="#2563EB"
          color2="#7DD3FC"
          noiseFrequency={2.35}
          noiseAmplitude={1.05}
          bandHeight={0.48}
          bandSpread={1.05}
          colorSpeed={0.7}
          enableMouseInteraction
          mouseInfluence={0.18}
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.70),transparent_24%),radial-gradient(circle_at_82%_84%,rgba(219,232,255,0.42),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.28),rgba(248,250,252,0.56))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(11,46,132,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(11,46,132,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-45" />

      <section className="relative z-10 flex h-full items-center justify-center px-4 py-4 sm:px-6">
        <div className="w-full">
          <div className={`auth-card-in mx-auto w-full ${cardWidth} rounded-[24px] border border-white/65 bg-white/42 px-4 py-4 text-[#071F55] shadow-[0_28px_90px_rgba(29,78,216,0.16)] backdrop-blur-2xl sm:px-6 sm:py-5 lg:px-7`}>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
