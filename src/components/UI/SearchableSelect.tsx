"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";

interface Props {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    /** Optional per-option badge text, e.g. { "United States": "+1" } */
    optionMeta?: Record<string, string>;
    /** When true, shows an "Add '…'" option so the user can enter a custom value */
    allowCustom?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    emptyMessage?: string;
}

export function SearchableSelect({
    value,
    onChange,
    options,
    optionMeta,
    allowCustom = false,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    disabled = false,
    className = "",
    emptyMessage = "No results found.",
}: Props) {
    const [open, setOpen]   = useState(false);
    const [query, setQuery] = useState("");
    const ref      = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const trimmed  = query.trim();
    const filtered = trimmed
        ? options.filter(o => o.toLowerCase().includes(trimmed.toLowerCase()))
        : options;

    // Show "Add" row when allowCustom, user has typed something, and it's not an exact match
    const showAdd = allowCustom && trimmed.length > 0 &&
        !options.some(o => o.toLowerCase() === trimmed.toLowerCase());

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Auto-focus the search input when the dropdown opens.
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => inputRef.current?.focus(), 30);
        return () => clearTimeout(t);
    }, [open]);

    function select(v: string) {
        onChange(v);
        setOpen(false);
        setQuery("");
    }

    function addCustom() {
        if (trimmed) select(trimmed);
    }

    function clear(e: React.MouseEvent) {
        e.stopPropagation();
        onChange("");
    }

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Trigger button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (disabled) return;
                    if (!open) setQuery("");
                    setOpen(v => !v);
                }}
                className={[
                    "w-full rounded-lg border px-3.5 py-2.5 text-[14px] text-left flex items-center justify-between gap-2 transition-colors focus:outline-none",
                    open
                        ? "border-[#1e3a5f] ring-2 ring-[#1e3a5f]/10 bg-white"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                ].join(" ")}
            >
                <span className={`truncate ${value ? "text-[#0e1f3d]" : "text-slate-300"}`}>
                    {value || placeholder}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                    {value && !disabled && (
                        <span
                            role="button"
                            onClick={clear}
                            className="rounded-full p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    data-lenis-prevent
                    className="absolute z-50 mt-1.5 w-full min-w-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
                >
                    {/* Search box */}
                    <div className="p-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5">
                            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="flex-1 bg-transparent text-[13px] text-[#0e1f3d] placeholder:text-slate-300 outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options list */}
                    <div
                        data-lenis-prevent
                        role="listbox"
                        onWheel={event => event.stopPropagation()}
                        onTouchMove={event => event.stopPropagation()}
                        className="max-h-52 touch-pan-y overscroll-contain overflow-y-auto py-1 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
                    >
                        {/* Existing options */}
                        {filtered.map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => select(opt)}
                                className={[
                                    "w-full flex items-center gap-2 px-3.5 py-2 text-[13.5px] text-left transition-colors",
                                    opt === value
                                        ? "bg-[#f0f5ff] text-[#1e3a5f] font-semibold"
                                        : "text-[#0e1f3d] hover:bg-slate-50",
                                ].join(" ")}
                            >
                                <span className="flex-1 truncate">{opt}</span>
                                {optionMeta?.[opt] && (
                                    <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                                        {optionMeta[opt]}
                                    </span>
                                )}
                                {opt === value && <Check className="h-3.5 w-3.5 text-[#1e3a5f] shrink-0" />}
                            </button>
                        ))}

                        {/* Empty state */}
                        {filtered.length === 0 && !showAdd && (
                            <p className="px-4 py-3 text-[13px] text-slate-400 text-center">{emptyMessage}</p>
                        )}

                        {/* Add custom option */}
                        {showAdd && (
                            <>
                                {filtered.length > 0 && (
                                    <div className="mx-3 my-1 border-t border-slate-100" />
                                )}
                                <button
                                    type="button"
                                    onClick={addCustom}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-left text-[#1e3a5f] font-semibold hover:bg-[#f0f5ff] transition-colors"
                                >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f]/10">
                                        <Plus className="h-3 w-3 text-[#1e3a5f]" />
                                    </span>
                                    Add &ldquo;{trimmed}&rdquo;
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
