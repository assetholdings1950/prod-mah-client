"use client";
import React from "react";
import { Bell, Clock, ArrowRight } from "lucide-react";

export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            title: "Welcome to Merlion Asset Holdings",
            message: "Your account has been successfully created. Explore our investment plans today.",
            time: "2 hours ago",
            read: false,
        },
        {
            id: 2,
            title: "Security Update",
            message: "We noticed a new login from a Windows device. If this was you, you can ignore this message.",
            time: "1 day ago",
            read: true,
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A]">Notifications</h1>
                    <p className="mt-1 text-sm text-slate-500">Stay updated on your investments and account activity.</p>
                </div>
                <button className="text-sm font-semibold text-[#0B2E84] hover:underline">
                    Mark all as read
                </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
                            <Bell className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-[#0F172A]">All caught up</h3>
                        <p className="mt-2 text-sm text-slate-500">You don't have any new notifications at the moment.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map(n => (
                            <div key={n.id} className={`flex gap-4 p-5 transition-colors hover:bg-slate-50 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                <div className="mt-1 shrink-0">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${!n.read ? 'bg-[#0B2E84] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm ${!n.read ? 'font-bold text-[#0F172A]' : 'font-semibold text-slate-700'}`}>
                                        {n.title}
                                    </h4>
                                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                        {n.message}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        {n.time}
                                    </div>
                                </div>
                                {!n.read && (
                                    <div className="flex shrink-0 items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-[#0B2E84]" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
