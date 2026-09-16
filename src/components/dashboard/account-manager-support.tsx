"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Phone, Send, X, Loader2, MessageSquare, Check, CheckCheck } from "lucide-react";
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

type ChatMessage = {
    _id: string;
    client: string;
    agent: string;
    sender: "client" | "agent";
    senderName?: string;
    message: string;
    read?: boolean;
    createdAt: string;
};

export function AccountManagerSupport() {
    const userId = useAuthStore((state) => state.user?._id);
    const [manager, setManager] = useState<Manager | null>(null);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    // Fetch client profile to find assigned account manager
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        const load = async () => {
            try {
                const response = await appClient.get(`/api/clients/${userId}`);
                const client = response.data?.data ?? response.data?.client ?? response.data;
                const assigned = client?.accountManager as Manager | null;
                if (!cancelled && assigned?.status === "active" && assigned?.kycStatus === "approved") {
                    setManager(assigned);
                }
            } catch {
                // Ignore load errors
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    // Fetch chat messages periodically when drawer is open
    useEffect(() => {
        if (!open || !userId || !manager) return;

        let cancelled = false;
        const fetchMessages = async (showLoading = false) => {
            if (showLoading) setLoadingMessages(true);
            try {
                const res = await appClient.get(`/api/chat/messages`, {
                    params: { clientId: userId, agentId: manager._id, reader: "client" },
                });
                if (!cancelled && res.data?.status && Array.isArray(res.data?.data)) {
                    setMessages(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load chat messages:", err);
            } finally {
                if (!cancelled && showLoading) setLoadingMessages(false);
            }
        };

        void fetchMessages(true);
        const interval = setInterval(() => fetchMessages(false), 3000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [open, userId, manager]);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom when messages update
    useEffect(() => {
        if (open && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, open]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = input.trim();
        if (!text || !userId || !manager || sending) return;

        setSending(true);
        try {
            const res = await appClient.post(`/api/chat/messages`, {
                clientId: userId,
                agentId: manager._id,
                message: text,
                sender: "client",
            });

            if (res.data?.status && res.data?.data) {
                setMessages((prev) => [...prev, res.data.data]);
                setInput("");
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setSending(false);
        }
    };

    if (!manager) return null;
    const managerName = manager.fullName || `${manager.firstName || ""} ${manager.lastName || ""}`.trim();

    return (
        <div className="fixed bottom-5 right-5 z-30 sm:bottom-7 sm:right-7">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className="mb-3 flex h-[500px] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0B1628] text-white shadow-[0_25px_70px_rgba(11,22,40,0.5)]"
                    >
                        {/* Header */}
                        <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0F2B5B] via-[#0B2E84] to-[#0B5278] p-4">
                            <div className="flex items-center gap-3 pr-6">
                                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-inner">
                                    {manager.profileImage ? (
                                        <img src={manager.profileImage} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <Headphones className="h-5 w-5 text-cyan-200" />
                                    )}
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0F2B5B]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200/80">
                                        Account Manager
                                    </p>
                                    <p className="truncate text-sm font-bold text-white">{managerName}</p>
                                    <p className="text-[11px] text-white/60">ID: #{manager.agentId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {manager.phoneNumber && (
                                    <a
                                        href={`tel:${manager.phoneNumber}`}
                                        title="Call Manager"
                                        className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </a>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    aria-label="Close Chat"
                                    className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages Body */}
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B1628]/95 scrollbar-thin scrollbar-thumb-white/10">
                            {loadingMessages && messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-white/40">
                                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center p-4 text-white/50 space-y-2">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                                        <MessageSquare className="h-6 w-6 text-cyan-400/80" />
                                    </div>
                                    <p className="text-xs font-semibold text-white/80">Direct Account Support</p>
                                    <p className="text-[11px] text-white/50 leading-relaxed max-w-[240px]">
                                        Need assistance with your portfolio or account? Send a message to contact <strong className="text-cyan-200">{managerName}</strong>.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isClient = msg.sender === "client";
                                    const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });

                                    return (
                                        <div
                                            key={msg._id}
                                            className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}
                                        >
                                            <span className="mb-1 text-[10px] text-white/40 px-1 font-medium">
                                                {isClient ? "You" : msg.senderName || managerName}
                                            </span>
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                                                    isClient
                                                        ? "rounded-tr-none bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                                        : "rounded-tl-none bg-white/10 border border-white/10 text-white/95 backdrop-blur-sm"
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                                <div
                                                    className={`mt-1 flex items-center justify-end gap-1.5 text-[9px] ${
                                                        isClient ? "text-cyan-100/70" : "text-white/40"
                                                    }`}
                                                >
                                                    <span>{formattedTime}</span>
                                                    {isClient && (
                                                        msg.read ? (
                                                            <span className="flex items-center gap-0.5 text-cyan-200 font-extrabold" title="Read by Account Manager">
                                                                <CheckCheck className="h-3 w-3 inline" />
                                                                <span>Seen</span>
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-0.5 text-cyan-100/60 font-medium" title="Delivered">
                                                                <Check className="h-3 w-3 inline" />
                                                                <span>Delivered</span>
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-2 border-t border-white/10 bg-[#0B1424] p-3"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || sending}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition-all"
                            >
                                {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setOpen((val) => !val)}
                aria-label="Contact your Account Manager"
                className="ml-auto flex h-14 items-center gap-2.5 rounded-2xl bg-[#0B2E84] px-4 text-white shadow-[0_12px_35px_rgba(11,46,132,0.35)] ring-1 ring-white/20"
            >
                <span className="relative">
                    <Headphones className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0B2E84]" />
                </span>
                <span className="hidden text-xs font-bold sm:block">Account Manager Chat</span>
            </motion.button>
        </div>
    );
}
