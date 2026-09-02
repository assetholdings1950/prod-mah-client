import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import InvestmentFocusSection from "@/components/InvestmentFocusSection";
import FundsSection from "@/components/FundsSection";
import TimelineSection from "@/components/TimelineSection";
import CTASection from "@/components/CTASection";
import FaqSection from "@/components/FaqSection";
import TestimonialsSection from "@/components/Testimonals";
import AgentVerificationSection from "@/components/AgentVerificationSection";
import MobileAppSection from "@/components/mobile-app/MobileAppSection";

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <StatsSection />
        <InvestmentFocusSection />
        <FundsSection />
        <TimelineSection />
        <MobileAppSection />
        <CTASection />
        <AgentVerificationSection />
        <FaqSection />
        <TestimonialsSection />
      </main>
    </>
  );
}
