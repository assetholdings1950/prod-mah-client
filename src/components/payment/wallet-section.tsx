"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Wallet, Plus, Edit2, Trash2, Star, Check, X, Loader2, AlertCircle,
} from "lucide-react";
import appClient from "@/lib/appClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { type IWalletDetail } from "@/interface/payment";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const EMPTY: WalletForm = { label: "", network: "", walletAddress: "", isPrimary: false };

type WalletForm = { label: string; network: string; walletAddress: string; isPrimary: boolean };

const COMMON_NETWORKS = ["Bitcoin (BTC)", "Ethereum (ERC-20)", "Tron (TRC-20)", "BNB Smart Chain (BEP-20)", "Solana", "Polygon"];

interface Props {
  clientId: string;
  userModel?: "Client" | "Agent" | "User";
}

export function WalletSection({ clientId: passedClientId, userModel = "Client" }: Props) {
  const { user } = useAuthStore();
  const clientId = (passedClientId && passedClientId.startsWith("CL-")) ? (user?._id || passedClientId) : (passedClientId || user?._id || "");

  const [wallets, setWallets] = useState<IWalletDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WalletForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<WalletForm>>({});

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appClient.get(API_ENDPOINTS.clients.wallets.getList(clientId));
      setWallets(res.data?.data ?? res.data?.wallets ?? []);
    } catch {
      toast.error("Failed to load wallets.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  function openAdd() { setForm(EMPTY); setErrors({}); setEditingId(null); setShowForm(true); }

  function openEdit(wallet: IWalletDetail) {
    setForm({
      label: wallet.label ?? "", network: wallet.network ?? "",
      walletAddress: wallet.walletAddress ?? "", isPrimary: wallet.isPrimary ?? false,
    });
    setErrors({});
    setEditingId(wallet._id);
    setShowForm(true);
  }

  function cancelForm() { setShowForm(false); setEditingId(null); setForm(EMPTY); setErrors({}); }

  function validate(): boolean {
    const e: Partial<WalletForm> = {};
    if (!form.walletAddress.trim()) e.walletAddress = "Required";
    if (!form.network.trim()) e.network = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await appClient.put(API_ENDPOINTS.clients.wallets.update, {
          _id: editingId, ...form, userId: clientId, userModel,
        });
        toast.success("Wallet updated.");
      } else {
        await appClient.post(API_ENDPOINTS.clients.wallets.add, {
          ...form, userId: clientId, userModel,
        });
        toast.success("Wallet added.");
      }
      cancelForm();
      fetchWallets();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await appClient.delete(API_ENDPOINTS.clients.wallets.delete(id));
      toast.success("Wallet removed.");
      setWallets(prev => prev.filter(w => w._id !== id));
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {wallets.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f5ff]">
            <Wallet className="h-6 w-6 text-[#1D4ED8]/40" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#071F55]">No wallets yet</p>
            <p className="mt-0.5 text-xs text-[#8da3c4]">Add a crypto wallet address to receive crypto withdrawals.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {wallets.map(wallet => (
          <div key={wallet._id} className="relative rounded-2xl border border-[#dce7f5] bg-white p-5 shadow-[0_2px_10px_rgba(7,31,85,0.04)]">
            {wallet.isPrimary && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
                <Star className="h-2.5 w-2.5 fill-current" /> Primary
              </span>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCell label="Label" value={wallet.label} />
              <InfoCell label="Network" value={wallet.network} />
              <InfoCell label="Wallet Address" value={wallet.walletAddress} mono />
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-[#f0f5ff] pt-3">
              <button
                onClick={() => openEdit(wallet)}
                className="flex items-center gap-1.5 rounded-lg border border-[#dce7f5] bg-[#f8fafd] px-3 py-1.5 text-xs font-semibold text-[#405981] transition-colors hover:border-[#1D4ED8]/30 hover:bg-[#f0f5ff] hover:text-[#1D4ED8]"
              >
                <Edit2 className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => handleDelete(wallet._id)}
                disabled={deletingId === wallet._id}
                className="flex items-center gap-1.5 rounded-lg border border-[#dce7f5] bg-[#f8fafd] px-3 py-1.5 text-xs font-semibold text-[#405981] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              >
                {deletingId === wallet._id
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Trash2 className="h-3 w-3" />}
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#1D4ED8]/20 bg-[#f0f5ff]/50 p-5">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#405981]">
            {editingId ? "Edit Wallet" : "Add Crypto Wallet"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Label" error={errors.label}>
              <input
                className={inputCls(false)}
                value={form.label}
                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. My Bitcoin Wallet"
              />
            </FormField>
            <FormField label="Network" required error={errors.network}>
              <div className="relative">
                <input
                  list="network-list"
                  className={inputCls(!!errors.network)}
                  value={form.network}
                  onChange={e => { setForm(p => ({ ...p, network: e.target.value })); setErrors(p => ({ ...p, network: "" })); }}
                  placeholder="e.g. Bitcoin, TRC-20"
                />
                <datalist id="network-list">
                  {COMMON_NETWORKS.map(n => <option key={n} value={n} />)}
                </datalist>
              </div>
            </FormField>
            <FormField label="Wallet Address" required error={errors.walletAddress}>
              <input
                className={inputCls(!!errors.walletAddress)}
                value={form.walletAddress}
                onChange={e => { setForm(p => ({ ...p, walletAddress: e.target.value })); setErrors(p => ({ ...p, walletAddress: "" })); }}
                placeholder="0x... or bc1..."
              />
            </FormField>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2.5">
            <div
              onClick={() => setForm(p => ({ ...p, isPrimary: !p.isPrimary }))}
              className={`relative h-5 w-5 flex-shrink-0 rounded border-2 transition-colors ${form.isPrimary ? "border-[#1D4ED8] bg-[#1D4ED8]" : "border-[#dce7f5] bg-white"}`}
            >
              {form.isPrimary && <Check className="absolute inset-0 m-auto h-3 w-3 text-white" />}
            </div>
            <span className="text-xs font-medium text-[#405981]">Set as primary wallet</span>
          </label>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_16px_rgba(29,78,216,0.2)] transition-colors hover:bg-[#1a44c2] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {editingId ? "Update" : "Add Wallet"}
            </button>
            <button
              onClick={cancelForm}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-[#405981] transition-colors hover:bg-[#dce7f5]"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={openAdd}
          className="flex w-fit items-center gap-2 rounded-xl border border-[#1D4ED8]/25 bg-[#f0f5ff] px-4 py-2.5 text-sm font-semibold text-[#1D4ED8] transition-colors hover:bg-[#e0ebff]"
        >
          <Plus className="h-4 w-4" /> Add Wallet
        </button>
      )}
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8da3c4]">{label}</p>
      <p className={`break-all text-sm text-[#071F55] ${mono ? "font-mono" : "font-medium"}`}>
        {value || <span className="italic text-[#c8d5e8]">—</span>}
      </p>
    </div>
  );
}

function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#071F55]">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#071F55] placeholder:text-[#9aacc9] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 transition-colors ${hasError ? "border-red-300 bg-red-50/40 focus:border-red-400" : "border-[#dce7f5] bg-white focus:border-[#1D4ED8]/50"}`;
}
