import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import PricingHeroSection from "@/components/pricingpage/PricingHeroSection";
import PricingCardsSection from "@/components/pricingpage/PricingCardsSection";
import PricingComparisonSection from "@/components/pricingpage/PricingComparisonSection";

export default function PricingPage() {
  return (
    <div className="bg-background text-on-surface antialiased">
      <NavBar />
      <main className="max-w-7xl mx-auto px-8 pt-40 pb-20">
        <PricingHeroSection />
        <PricingCardsSection />
        <PricingComparisonSection />
      </main>
      <Footer />
    </div>
  );
}
