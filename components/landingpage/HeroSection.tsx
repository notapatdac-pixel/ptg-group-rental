import Link from "next/link";
import StatsBar from "./StatsBar";
import hero1 from "@/components/image/hero-ptg-style-1.png";
import hero2 from "@/components/image/hero-ptg-style-2.png";
import hero3 from "@/components/image/hero-ptg-style-3.png";
import hero4 from "@/components/image/hero-ptg-style-4.png";

const HERO_CAROUSEL_IMAGES = [
  { src: hero1.src, alt: "Modern green and white petrol retail station at sunset" },
  { src: hero2.src, alt: "Night scene with green-lit canopy and convenience store" },
  { src: hero3.src, alt: "Aerial view of fuel and retail hub, lime green accents" },
  { src: hero4.src, alt: "Dusk forecourt with emerald canopy and glass retail" },
];

export default function HeroSection() {
  return (
    <section>
      <div className="relative overflow-hidden min-h-[90vh] lg:min-h-[40rem]">
        <div className="hero-carousel-bg">
          {HERO_CAROUSEL_IMAGES.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className={`hero-carousel-bg-slide hero-carousel-bg-slide--${i}`}
            />
          ))}
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/15 via-black/10 to-black/25 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto pt-44 pb-44 md:pb-56 px-8">
          <div>
            <div className="z-10">
              <div className="hero-content-glass p-8 lg:p-10 max-w-5xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-on-secondary-container/10 rounded-full mb-8">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-xs font-bold tracking-widest uppercase text-on-secondary-container">
                    Thailand&apos;s Premier Retail Marketplace
                  </span>
                </div>
                <h1 className="text-6xl lg:text-7xl text-on-surface leading-[1.1] mb-8 drop-shadow-sm">
                  Find Your Next Store at{" "}
                  <span className="text-primary italic">PTG Gas Stations</span>
                </h1>
                <p className="text-xl text-on-surface leading-relaxed mb-10 max-w-xl">
                  Discover high-traffic retail locations, analyze success potential with AI, and grow your business where customers already are.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/explorepage/explorePage"
                    className="group inline-flex items-center justify-center primary-gradient text-white px-26 py-4 rounded-md text-base font-bold border-0 cursor-pointer transition-all hover:shadow-lg hover:shadow-lime-600/40 no-underline"
                  >
                    <span className="flex items-center gap-2">
                      Explore Locations
                      <span className="material-symbols-outlined text-lime-200 group-hover:text-lime-50 group-hover:translate-x-4 transition-all">
                        arrow_forward
                      </span>
                    </span>
                  </Link>
                  <Link
                    href="/createaccountpage/createAccountPage"
                    className="btn-lime-outline inline-flex items-center justify-center bg-white/90 px-8 py-4 rounded-md text-base font-bold border border-outline-variant transition-colors text-on-surface cursor-pointer backdrop-blur-sm no-underline"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <StatsBar />
      </div>
    </section>
  );
}
