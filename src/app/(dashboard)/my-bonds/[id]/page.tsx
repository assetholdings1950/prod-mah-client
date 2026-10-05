import BondInvestmentDetail from "@/components/bonds/BondInvestmentDetail";

export default async function MyBondDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BondInvestmentDetail id={id} />;
}
