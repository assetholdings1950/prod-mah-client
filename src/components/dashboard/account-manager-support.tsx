"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Mail, Phone, X } from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";

type Manager = {
    _id: string;
    agentId: string;
    fullName?: string | null;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string | null;
    profileImage?: string | null;
    status?: string;
    kycStatus?: string;
};

export function AccountManagerSupport() {
    const userId = useAuthStore((state) => state.user?._id);
    const [manager, setManager] = useState<Manager | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        const load = async () => {
            try {
                const response = await appClient.get(`/api/clients/${userId}`);
                const client = response.data?.data ?? response.data?.client ?? response.data;
                const assigned = client?.accountManager as Manager | null;
                if (!cancelled && assigned?.status === "active" && assigned?.kycStatus === "approved") setManager(assigned);
            } catch {
                // The investment API remains the authoritative guard if profile loading fails.
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [userId]);

    if (!manager) return null;
    const name = manager.fullName || `${manager.firstName || ""} ${manager.lastName || ""}`.trim();

    return (
        <div className="fixed bottom-5 right-5 z-30 sm:bottom-7 sm:right-7">
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }} transition={{ duration: 0.2 }} className="mb-3 w-[min(340px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-white/20 bg-[#0B1628] text-white shadow-[0_20px_70px_rgba(11,22,40,0.35)]">
                        <div className="relative bg-gradient-to-br from-[#123d82] to-[#0b6a78] p-5">
                            <button onClick={() => setOpen(false)} aria-label="Close Account Manager support" className="absolute right-3 top-3 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
                            <div className="flex items-center gap-3 pr-7">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                                    {manager.profileImage ? <img src={manager.profileImage} alt="" className="h-full w-full object-cover" /> : <Headphones className="h-6 w-6" />}
                                </div>
                                <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100/70">Your Account Manager</p><p className="mt-0.5 truncate text-base font-bold">{name}</p><p className="text-[11px] text-white/55">{manager.agentId}</p></div>
                            </div>
                        </div>
                        <div className="p-5"><p className="text-xs leading-5 text-white/65">Need help choosing a plan or completing a step? Contact your manager directly.</p><div className="mt-4 grid grid-cols-2 gap-2">{manager.email && <a href={`mailto:${manager.email}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-[#0B2E84]"><Mail className="h-4 w-4" /> Email</a>}{manager.phoneNumber && <a href={`tel:${manager.phoneNumber}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-white"><Phone className="h-4 w-4" /> Call</a>}</div></div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setOpen((value) => !value)} aria-label="Contact your Account Manager" className="ml-auto flex h-14 items-center gap-2.5 rounded-2xl bg-[#0B2E84] px-4 text-white shadow-[0_12px_35px_rgba(11,46,132,0.35)] ring-1 ring-white/20">
                <span className="relative"><Headphones className="h-5 w-5" /><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0B2E84]" /></span><span className="hidden text-xs font-bold sm:block">Account Manager</span>
            </motion.button>
        </div>
    );
}
