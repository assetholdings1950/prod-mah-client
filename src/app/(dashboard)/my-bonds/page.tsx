import { Suspense } from "react";
import MyBondInvestments from "@/components/bonds/MyBondInvestments";

export default function MyBondsPage() {
    return <Suspense fallback={null}><MyBondInvestments /></Suspense>;
}
