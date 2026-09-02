"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
    /** 0–1 — how much of the element must be visible to trigger. */
    threshold?: number;
    /** rootMargin passed to the observer (e.g. "-60px"). */
    rootMargin?: string;
    /** If true, reveal only the first time it enters (no re-hide on scroll out). */
    once?: boolean;
}

/**
 * Returns a ref to attach to an element and a boolean `visible` flag that
 * flips true when the element scrolls into view. Drives CSS-based reveals.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options: ScrollRevealOptions = {}
): [React.RefObject<T | null>, boolean] {
    const { threshold = 0.15, rootMargin = "0px 0px -10% 0px", once = true } = options;
    const ref = useRef<T>(null);
    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect reduced-motion: show immediately, skip observing.
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    if (once) obs.disconnect();
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold, rootMargin, once]);

    return [ref, visible];
}