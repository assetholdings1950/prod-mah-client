import { Suspense } from "react";
import FundsPageClient from "./FundsPageClient";

export const metadata = { title: "Investment Funds — Merlion Asset Holdings" };

export default function FundsPage() {
    return (
        <Suspense>
            <FundsPageClient />
        </Suspense>
    );
}
