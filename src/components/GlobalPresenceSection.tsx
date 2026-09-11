"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";

const locations = [
  { country: "Singapore", code: "SG", detail: "Headquarters", isNew: false },
  { country: "United Arab Emirates", code: "AE", detail: "Global presence", isNew: false },
  { country: "Canada", code: "CA", detail: "Global presence", isNew: false },
  { country: "Russia", code: "RU", detail: "Global presence", isNew: false },
  { country: "United Kingdom", code: "GB", detail: "Global presence", isNew: false },
  { country: "India", code: "IN", detail: "New presence", isNew: true },
] as const;

export default function GlobalPresenceSection() {
  const shouldReduceMotion = useReducedMotion();
  const hiddenLine = shouldReduceMotion
    ? { opacity: 1, y: 0, filter: "blur(0px)" }
    : { opacity: 0, y: 34, filter: "blur(8px)" };

  return (
    <section
      id="global-presence"
      aria-labelledby="global-presence-title"
      className="relative overflow-hidden bg-[#F7F9FC]"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(37,99,235,0.10), transparent 28%), radial-gradient(circle at 85% 75%, rgba(96,165,250,0.10), transparent 30%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-[clamp(18px,5.5vw,96px)] py-[clamp(64px,8vw,108px)]">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
              <MapPin aria-hidden size={14} strokeWidth={1.8} className="text-blue-600" />
              <span className="font-[var(--font-inter,sans-serif)] text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-blue-600">
                Our Global Presence
              </span>
            </div>

            <motion.h2
              id="global-presence-title"
              className="m-0 max-w-[620px] font-[var(--font-playfair,serif)] text-[clamp(2rem,4.6vw,4rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[#081B3A]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.65 }}
            >
              <motion.span
                className="block"
                variants={{ hidden: hiddenLine, visible: { opacity: 1, y: 0, filter: "blur(0px)" } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                Global perspective,
              </motion.span>
              <motion.span
                className="block text-blue-600"
                variants={{ hidden: hiddenLine, visible: { opacity: 1, y: 0, filter: "blur(0px)" } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.75, delay: shouldReduceMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }}
              >
                now in India.
              </motion.span>
            </motion.h2>
          </div>

          <p className="m-0 max-w-[650px] font-[var(--font-inter,sans-serif)] text-[clamp(0.88rem,1.35vw,1.05rem)] leading-8 text-slate-600">
            Headquartered in Singapore, Merlion Asset Holdings has expanded its
            presence across the United Arab Emirates, Canada, Russia, the United
            Kingdom, and now India—bringing global market insight closer to the
            people and regions we serve.
          </p>
        </div>

        <ul className="mt-10 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {locations.map((location) => (
            <li
              key={location.code}
              className="group relative min-h-32 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(8,27,58,0.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.10)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <span
                      aria-hidden
                      className={`fi fi-${location.code.toLowerCase()} h-full w-full bg-cover bg-center`}
                    />
                  </span>
                  <div>
                    <p className="m-0 font-[var(--font-inter,sans-serif)] text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {location.detail}
                    </p>
                    <h3 className="m-0 mt-1 font-[var(--font-playfair,serif)] text-[clamp(1.05rem,1.7vw,1.3rem)] font-bold text-[#081B3A]">
                      {location.country}
                    </h3>
                  </div>
                </div>

                <span className="font-[var(--font-inter,sans-serif)] text-xs font-semibold tracking-[0.18em] text-slate-300">
                  {location.code}
                </span>
              </div>

              {location.isNew && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
