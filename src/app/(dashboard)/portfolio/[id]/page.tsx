import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import PortfolioDetailContent from "@/components/portfolio/PortfolioDetailContent";


export default function PortfolioDetailPage() {
    return (
        <div className="min-h-screen bg-[#EEF3FB]">
            <PortfolioDetailContent />
            {/* Loader2 kept in bundle so lucide chunk is shared */}
            <span className="hidden"><Loader2 /></span>
        </div>
    );
}
