import BondDetail from "@/components/bonds/BondDetail";

export default async function BondDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <BondDetail identifier={slug} />;
}
