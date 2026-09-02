"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Landmark, Plus, Edit2, Trash2, Star, Check, X, Loader2, AlertCircle,
} from "lucide-react";
import appClient from "@/lib/appClient";
import { API_ENDPOINTS } from "@/lib/config/apiConfig";
import { type IBankDetail } from "@/interface/payment";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const EMPTY: BankForm = {
  bankName: "", branchName: "", accountName: "",
  accountNumber: "", ifscCode: "", swiftCode: "", isPrimary: false,
};

type BankForm = {
  bankName: string; branchName: string; accountName: string;
  accountNumber: string; ifscCode: string; swiftCode: string; isPrimary: boolean;
};

interface Props {
  clientId: string;
  userModel?: "Client" | "Agent" | "User";
}

export function BankSection({ clientId: passedClientId, userModel = "Client" }: Props) {
  const { user } = useAuthStore();
  const clientId = (passedClientId && passedClientId.startsWith("CL-")) ? (user?._id || passedClientId) : (passedClientId || user?._id || "");

  const [banks, setBanks] = useState<IBankDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BankForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<BankForm>>({});

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appClient.get(API_ENDPOINTS.clients.bankDetails.getList(clientId));
      setBanks(res.data?.data ?? res.data?.bankDetails ?? []);
    } catch {
      toast.error("Failed to load bank details.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  function openAdd() { setForm(EMPTY); setErrors({}); setEditingId(null); setShowForm(true); }

  function openEdit(bank: IBankDetail) {
    setForm({
      bankName: bank.bankName ?? "", branchName: bank.branchName ?? "",
      accountName: bank.accountName ?? "", accountNumber: bank.accountNumber ?? "",
      ifscCode: bank.ifscCode ?? "", swiftCode: bank.swiftCode ?? "",
      isPrimary: bank.isPrimary ?? false,
    });
    setErrors({});
    setEditingId(bank._id);
    setShowForm(true);
  }

  function cancelForm() { setShowForm(false); setEditingId(null); setForm(EMPTY); setErrors({}); }

  function validate(): boolean {
    const e: Partial<BankForm> = {};
    if (!form.bankName.trim()) e.bankName = "Required";
    if (!form.accountNumber.trim()) e.accountNumber = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await appClient.put(API_ENDPOINTS.clients.bankDetails.update, {
          _id: editingId, ...form, userId: clientId, userModel,
        });
        toast.success("Bank account updated.");
      } else {
        await appClient.post(API_ENDPOINTS.clients.bankDetails.add, {
          ...form, userId: clientId, userModel,
        });
        toast.success("Bank account added.");
      }
      cancelForm();
      fetchBanks();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await appClient.delete(API_ENDPOINTS.clients.bankDetails.delete(id));
      toast.success("Bank account removed.");
      setBanks(prev => prev.filter(b => b._id !== id));
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
      {banks.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f5ff]">
            <Landmark className="h-6 w-6 text-[#1D4ED8]/40" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#071F55]">No bank accounts yet</p>
            <p className="mt-0.5 text-xs text-[#8da3c4]">Add a bank account to receive withdrawals.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {banks.map(bank => (
          <div key={bank._id} className="relative rounded-2xl border border-[#dce7f5] bg-white p-5 shadow-[0_2px_10px_rgba(7,31,85,0.04)]">
            {bank.isPrimary && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
                <Star className="h-2.5 w-2.5 fill-current" /> Primary
              </span>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
              <InfoCell label="Bank" value={bank.bankName} />
              <InfoCell label="Branch" value={bank.branchName} />
              <InfoCell label="Account Name" value={bank.accountName} />
              <InfoCell label="Account No." value={bank.accountNumber} mono />
              <InfoCell label="IFSC" value={bank.ifscCode} mono />
              <InfoCell label="SWIFT" value={bank.swiftCode} mono />
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-[#f0f5ff] pt-3">
              <button
                onClick={() => openEdit(bank)}
                className="flex items-center gap-1.5 rounded-lg border border-[#dce7f5] bg-[#f8fafd] px-3 py-1.5 text-xs font-semibold text-[#405981] transition-colors hover:border-[#1D4ED8]/30 hover:bg-[#f0f5ff] hover:text-[#1D4ED8]"
              >
                <Edit2 className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => handleDelete(bank._id)}
                disabled={deletingId === bank._id}
                className="flex items-center gap-1.5 rounded-lg border border-[#dce7f5] bg-[#f8fafd] px-3 py-1.5 text-xs font-semibold text-[#405981] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              >
                {deletingId === bank._id
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
            {editingId ? "Edit Bank Account" : "Add Bank Account"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Bank Name" required error={errors.bankName}>
              <input
                className={inputCls(!!errors.bankName)}
                value={form.bankName}
                onChange={e => { setForm(p => ({ ...p, bankName: e.target.value })); setErrors(p => ({ ...p, bankName: "" })); }}
                placeholder="e.g. DBS Bank Singapore"
              />
            </FormField>
            <FormField label="Branch Name" error={errors.branchName}>
              <input
                className={inputCls(false)}
                value={form.branchName}
                onChange={e => setForm(p => ({ ...p, branchName: e.target.value }))}
                placeholder="Branch name"
              />
            </FormField>
            <FormField label="Account Holder Name" error={errors.accountName}>
              <input
                className={inputCls(false)}
                value={form.accountName}
                onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))}
                placeholder="Name as on account"
              />
            </FormField>
            <FormField label="Account Number" required error={errors.accountNumber}>
              <input
                className={inputCls(!!errors.accountNumber)}
                value={form.accountNumber}
                onChange={e => { setForm(p => ({ ...p, accountNumber: e.target.value })); setErrors(p => ({ ...p, accountNumber: "" })); }}
                placeholder="Account number"
              />
            </FormField>
            <FormField label="IFSC Code" error={errors.ifscCode}>
              <input
                className={inputCls(false)}
                value={form.ifscCode}
                onChange={e => setForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                placeholder="IFSC code"
                maxLength={11}
              />
            </FormField>
            <FormField label="SWIFT / BIC Code" error={errors.swiftCode}>
              <input
                className={inputCls(false)}
                value={form.swiftCode}
                onChange={e => setForm(p => ({ ...p, swiftCode: e.target.value.toUpperCase() }))}
                placeholder="SWIFT code"
                maxLength={11}
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
            <span className="text-xs font-medium text-[#405981]">Set as primary bank account</span>
          </label>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_16px_rgba(29,78,216,0.2)] transition-colors hover:bg-[#1a44c2] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {editingId ? "Update" : "Add Bank"}
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
          <Plus className="h-4 w-4" /> Add Bank Account
        </button>
      )}
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8da3c4]">{label}</p>
      <p className={`text-sm text-[#071F55] ${mono ? "font-mono" : "font-medium"}`}>
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
