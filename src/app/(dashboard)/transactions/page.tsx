"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt } from "lucide-react";
import appClient from "@/lib/appClient";
import { useAuthStore } from "@/store/authStore";
import type { TransactionInterface } from "@/interface/transaction";
import type { TransactionType, TransactionStatus } from "@/interface/transaction";

import TransactionFilters from "@/components/transaction/TransactionFilters";
import TransactionTableRow from "@/components/transaction/TransactionTableRow";
import TransactionDetailModal from "@/components/transaction/TransactionDetailModal";
import { PaginationBar } from "@/components/wallet/PaginationBar";

const TABLE_HEADERS = ["Type", "Amount", "Description", "Date", "Status", "Processed By"];

function TransactionsPageContent() {
    const { user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    /* ── list ── */
    const [transactions, setTransactions] = useState<TransactionInterface[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    /* ── modal ── */
    const [selectedTx, setSelectedTx] = useState<TransactionInterface | null>(null);

    /* ── filters ── */
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<TransactionType | "all">(
        (searchParams.get("type") as TransactionType) ?? "all"
    );
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
        (searchParams.get("status") as TransactionStatus) ?? "all"
    );
    const [startDate, setStartDate] = useState(searchParams.get("startDate") ?? "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? "");
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ?? "createdAt");
    const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") ?? "desc");

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── search debounce ── */
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchInput]);

    /* ── URL sync ── */
    useEffect(() => {
        const p = new URLSearchParams();
        if (typeFilter !== "all") p.set("type", typeFilter);
        if (statusFilter !== "all") p.set("status", statusFilter);
        if (startDate) p.set("startDate", startDate);
        if (endDate) p.set("endDate", endDate);
        if (sortBy !== "createdAt") p.set("sortBy", sortBy);
        if (sortOrder !== "desc") p.set("sortOrder", sortOrder);
        const qs = p.toString();
        router.replace(`/transactions${qs ? `?${qs}` : ""}`, { scroll: false } as Parameters<typeof router.replace>[1]);
    }, [typeFilter, statusFilter, startDate, endDate, sortBy, sortOrder, router]);

    /* ── fetch ── */
    const fetchTransactions = useCallback(async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                clientId: user._id,
                page: String(page),
                limit: String(limit),
                search,
                sortBy,
                sortOrder,
            });
            if (typeFilter !== "all") params.set("type", typeFilter);
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);

            const res = await appClient.get(`/api/transactions/my?${params}`);
            const d = res.data?.transactions ?? res.data?.data ?? res.data;
            const docs = d?.docs ?? d?.data ?? (Array.isArray(d) ? d : []);
            setTransactions(docs);
            setTotalDocs(d?.totalDocs ?? docs.length);
            setTotalPages(d?.totalPages ?? 1);
        } catch {
            // silent — network errors handled by global interceptor
        } finally {
            setLoading(false);
        }
    }, [user?._id, page, limit, search, typeFilter, statusFilter, startDate, endDate, sortBy, sortOrder]);

    useEffect(() => { void fetchTransactions(); }, [fetchTransactions]);

    return (
        <div className="flex flex-col gap-6 min-h-full pb-20 px-4 py-5 sm:px-6 lg:px-8 max-w-[1560px] mx-auto">
            {/* heading */}
            <div>
                <h1 className="text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#071F55]">Transactions</h1>
                <p className="mt-1 text-[13px] font-medium text-[#5A78B8]">
                    A complete history of all activity on your account.
                </p>
            </div>

            <TransactionFilters
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                searchInput={searchInput}
                startDate={startDate}
                endDate={endDate}
                sortBy={sortBy}
                sortOrder={sortOrder}
                loading={loading}
                onTypeChange={(v) => { setTypeFilter(v); setPage(1); }}
                onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
                onSearchChange={setSearchInput}
                onStartDateChange={(v) => { setStartDate(v); setPage(1); }}
                onEndDateChange={(v) => { setEndDate(v); setPage(1); }}
                onSortByChange={(v) => { setSortBy(v); setPage(1); }}
                onSortOrderToggle={() => { setSortOrder(p => p === "desc" ? "asc" : "desc"); setPage(1); }}
                onRefresh={fetchTransactions}
            />

            {/* table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="overflow-auto max-h-[calc(100vh-280px)]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {TABLE_HEADERS.map((h) => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        {[90, 100, 200, 90, 80, 100].map((w, j) => (
                                            <td key={j} className="px-4 py-3.5">
                                                <div className="h-3.5 rounded bg-slate-100 animate-pulse" style={{ width: w }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <Receipt size={24} className="text-slate-400" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">No transactions found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters or date range.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx, idx) => (
                                    <TransactionTableRow
                                        key={tx._id ?? idx}
                                        transaction={tx}
                                        onClick={setSelectedTx}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 0 && (
                    <PaginationBar
                        page={page}
                        totalPages={totalPages}
                        total={totalDocs}
                        limit={limit}
                        loading={loading}
                        onPageChange={setPage}
                        onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    />
                )}
            </div>

            <TransactionDetailModal
                transaction={selectedTx}
                onClose={() => setSelectedTx(null)}
            />
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={null}>
            <TransactionsPageContent />
        </Suspense>
    );
}
