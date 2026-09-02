"use client";

export default function Skeleton() {
    return (
        <div className="min-h-screen bg-[#EEF3FB]">
            <div className="bg-[#0B1628] px-6 py-8 sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="h-4 w-32 animate-pulse rounded-lg bg-white/10" />
                    <div className="mt-4 h-7 w-64 animate-pulse rounded-lg bg-white/15" />
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/10" />)}
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 space-y-5">
                <div className="h-48 animate-pulse rounded-2xl bg-white" />
                <div className="h-64 animate-pulse rounded-2xl bg-white" />
            </div>
        </div>
    );
}
