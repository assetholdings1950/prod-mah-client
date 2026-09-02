"use client";

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ────────────────────────────────────────────────────────────
   FundsCarousel3D — a GSAP-driven 3D coverflow slider.
   Wraps arbitrary card nodes; the centred card faces the viewer,
   side cards rotate back in perspective. Drag / arrows / dots /
   autoplay. Keeps your real HTML cards (no WebGL).
   ──────────────────────────────────────────────────────────── */
export interface FundsCarousel3DProps {
    items: ReactNode[];
    /** ms between auto-advances; 0 disables autoplay. */
    autoPlay?: number;
    /** px width of the centre card track slot (cards can be smaller). */
    className?: string;
}

export default function FundsCarousel3D({
    items,
    autoPlay = 5000,
    className,
}: FundsCarousel3DProps) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const count = items.length;

    // drag state
    const drag = useRef<{ active: boolean; startX: number; moved: boolean }>({
        active: false,
        startX: 0,
        moved: false,
    });

    const clamp = useCallback(
        (i: number) => (count ? (i + count) % count : 0),
        [count]
    );

    const go = useCallback((dir: number) => setIndex((i) => clamp(i + dir)), [clamp]);
    const goTo = useCallback((i: number) => setIndex(clamp(i)), [clamp]);

    /* ── Position every card in 3D space whenever index changes ── */
    useGSAP(
        () => {
            cardRefs.current.forEach((el, i) => {
                if (!el) return;

                // shortest signed offset on the ring (so wrap-around animates the short way)
                let offset = i - index;
                if (offset > count / 2) offset -= count;
                if (offset < -count / 2) offset += count;

                const abs = Math.abs(offset);
                const isCenter = offset === 0;

                // visual params per depth
                const x = offset * 56; // % translate
                const z = -abs * 180; // px depth
                const ry = offset * -38; // deg rotation
                const scale = isCenter ? 1 : Math.max(0.78, 1 - abs * 0.12);
                const opacity = abs > 2 ? 0 : 1;

                gsap.to(el, {
                    xPercent: -50,
                    yPercent: -50,
                    x: `${x}%`,
                    z,
                    rotateY: ry,
                    scale,
                    opacity,
                    duration: 0.7,
                    ease: "power3.out",
                    overwrite: "auto",
                });

                // stacking + interactivity
                el.style.zIndex = String(100 - abs);
                el.style.pointerEvents = isCenter ? "auto" : "none";
                el.style.filter = isCenter ? "none" : `brightness(${1 - abs * 0.16})`;
            });
        },
        { dependencies: [index, count], scope: stageRef }
    );

    /* ── Autoplay ── */
    useEffect(() => {
        if (!autoPlay || paused || count <= 1) return;
        const id = window.setTimeout(() => go(1), autoPlay);
        return () => window.clearTimeout(id);
    }, [index, autoPlay, paused, count, go]);

    /* ── Keyboard ── */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") go(-1);
            else if (e.key === "ArrowRight") go(1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [go]);

    /* ── Pointer drag / swipe ── */
    const onPointerDown = (e: React.PointerEvent) => {
        drag.current = { active: true, startX: e.clientX, moved: false };
        setPaused(true);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag.current.active) return;
        if (Math.abs(e.clientX - drag.current.startX) > 8) drag.current.moved = true;
    };
    const onPointerUp = (e: React.PointerEvent) => {
        if (!drag.current.active) return;
        const dx = e.clientX - drag.current.startX;
        drag.current.active = false;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    };

    if (!count) return null;

    return (
        <div
            className={className}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* ── 3D stage ── */}
            <div
                ref={stageRef}
                className="fc3d__stage"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => (drag.current.active = false)}
                role="group"
                aria-roledescription="carousel"
            >
                {items.map((node, i) => (
                    <div
                        key={i}
                        ref={(el) => {
                            cardRefs.current[i] = el;
                        }}
                        className="fc3d__card"
                        aria-hidden={i !== index}
                    >
                        {node}
                    </div>
                ))}

                <style>{css}</style>
            </div>

            {/* ── Controls ── */}
            <div className="fc3d__nav">
                <button
                    className="fc3d__arrow"
                    onClick={() => go(-1)}
                    aria-label="Previous fund"
                    type="button"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>

                <div className="fc3d__dots" role="tablist">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`fc3d__dot ${i === index ? "is-on" : ""}`}
                            onClick={() => goTo(i)}
                            aria-label={`Go to fund ${i + 1}`}
                            aria-selected={i === index}
                            role="tab"
                        />
                    ))}
                </div>

                <button
                    className="fc3d__arrow"
                    onClick={() => go(1)}
                    aria-label="Next fund"
                    type="button"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </div>
        </div>
    );
}

const css = `
.fc3d__stage{
  position:relative; width:100%;
  height:clamp(420px, 64vw, 560px);
  perspective:1600px;
  transform-style:preserve-3d;
  display:flex; align-items:center; justify-content:center;
  touch-action:pan-y; cursor:grab; user-select:none;
}
.fc3d__stage:active{ cursor:grabbing; }
.fc3d__card{
  position:absolute; left:50%; top:50%;
  width:min(88%, 360px);
  transform-style:preserve-3d;
  will-change:transform, opacity;
}
.fc3d__card > *{ width:100%; }

.fc3d__nav{
  display:flex; align-items:center; justify-content:center; gap:18px;
  margin-top:clamp(18px, 3vw, 30px);
}
.fc3d__arrow{
  display:grid; place-items:center; width:44px; height:44px; border-radius:50%;
  cursor:pointer; color:var(--navy, #081B3A);
  background:rgba(37,99,235,0.08);
  border:1px solid rgba(37,99,235,0.2);
  transition:transform .25s ease, background .25s ease, color .25s ease;
}
.fc3d__arrow:hover{ background:var(--navy, #081B3A); color:#fff; transform:scale(1.08); }
.fc3d__dots{ display:flex; align-items:center; gap:8px; }
.fc3d__dot{
  width:8px; height:8px; border-radius:999px; cursor:pointer; padding:0; border:none;
  background:rgba(8,27,58,0.18);
  transition:width .35s cubic-bezier(.23,1,.32,1), background .35s ease;
}
.fc3d__dot.is-on{ width:28px; background:linear-gradient(90deg,#2563EB,#60A5FA); }

@media (prefers-reduced-motion: reduce){
  .fc3d__card{ transition:none !important; }
}
`;