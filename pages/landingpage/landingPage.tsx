import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/landingpage/HeroSection";
import HowItWorks from "@/components/landingpage/HowItWorks";
import FeaturedOpportunities from "@/components/landingpage/FeaturedOpportunities";
import PricingPreview from "@/components/landingpage/PricingPreview";
import BottomCta from "@/components/landingpage/BottomCta";

export default function LandingPage() {
  return (
    <div className="bg-background text-on-surface antialiased">
      <NavBar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturedOpportunities />
        <PricingPreview />
        <BottomCta />
      </main>
      <Footer />
    </div>
  );
}
