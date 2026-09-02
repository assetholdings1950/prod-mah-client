"use client";

import { useState } from "react";
import { Landmark, Wallet, ShieldCheck, Info } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { BankSection } from "@/components/payment/bank-section";
import { WalletSection } from "@/components/payment/wallet-section";

type Tab = "bank" | "wallet";

export default function PaymentMethodsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("bank");

  if (!user?._id) return null;

  return (
    <div className="min-h-screen bg-[#EEF3FB] p-6 sm:p-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#071F55] sm:text-[26px]">Payment Methods</h1>
          <p className="mt-1.5 text-sm text-[#405981]">
            Manage your bank accounts and crypto wallets for withdrawals.
          </p>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-[#dce7f5] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(7,31,85,0.04)] sm:flex-shrink-0">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1D4ED8]" />
          <p className="text-xs leading-relaxed text-[#405981]">
            Your payment details are <span className="font-bold text-[#1D4ED8]">encrypted and secure</span>
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#dce7f5] bg-white px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1D4ED8]" />
        <p className="text-xs text-[#405981]">
          You can add multiple bank accounts and crypto wallets. Mark one as <span className="font-semibold text-[#071F55]">Primary</span> to use it as the default for withdrawal requests.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mt-6 flex gap-1 rounded-xl border border-[#dce7f5] bg-white p-1 shadow-[0_2px_10px_rgba(7,31,85,0.04)] sm:w-fit">
        <TabButton
          active={activeTab === "bank"}
          onClick={() => setActiveTab("bank")}
          icon={<Landmark className="h-4 w-4" />}
          label="Bank Accounts"
        />
        <TabButton
          active={activeTab === "wallet"}
          onClick={() => setActiveTab("wallet")}
          icon={<Wallet className="h-4 w-4" />}
          label="Crypto Wallets"
        />
      </div>

      {/* Content panel */}
      <div className="mt-4 rounded-2xl border border-[#dce7f5] bg-white p-6 shadow-[0_2px_12px_rgba(7,31,85,0.04)]">
        {activeTab === "bank" && (
          <>
            <div className="mb-5 flex items-center gap-2 border-b border-[#f0f5ff] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f5ff]">
                <Landmark className="h-4 w-4 text-[#1D4ED8]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#071F55]">Bank Accounts</h2>
                <p className="text-xs text-[#8da3c4]">For fiat withdrawals via bank transfer</p>
              </div>
            </div>
            <BankSection clientId={user._id} />
          </>
        )}
        {activeTab === "wallet" && (
          <>
            <div className="mb-5 flex items-center gap-2 border-b border-[#f0f5ff] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f5ff]">
                <Wallet className="h-4 w-4 text-[#1D4ED8]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#071F55]">Crypto Wallets</h2>
                <p className="text-xs text-[#8da3c4]">For withdrawals in cryptocurrency</p>
              </div>
            </div>
            <WalletSection clientId={user._id} />
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "bg-[#1D4ED8] text-white shadow-[0_2px_8px_rgba(29,78,216,0.3)]"
          : "text-[#405981] hover:bg-[#f0f5ff] hover:text-[#071F55]",
      ].join(" ")}
    >
      {icon} {label}
    </button>
  );
}
