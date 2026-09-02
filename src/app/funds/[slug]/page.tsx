import { Suspense } from "react";
import FundDetailPageClient from "./FundDetailPageClient";

export const metadata = { title: "Fund Details - Merlion Asset Holdings" };

export default async function FundDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ id?: string }>;
}) {
    const { slug } = await params;
    const { id } = await searchParams;

    return (
        <Suspense>
            <FundDetailPageClient slug={slug} id={id} />
        </Suspense>
    );
}
