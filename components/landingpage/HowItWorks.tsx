function Step({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center border border-lime-200/90 shadow-sm mb-6">
        <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
      </div>
      <h3 className="text-2xl mb-4 text-on-surface">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed">{description}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-32 md:py-44 lg:py-52 px-6 sm:px-8 bg-surface">
      <div>
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-5xl text-on-surface mb-6">How It Works</h2>
          <div className="w-24 h-1 primary-gradient mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 lg:gap-16 max-w-7xl mx-auto items-start">
          <Step
            icon="map"
            title="Explore Verified Locations"
            description="Access our nationwide database of premium retail spots within PTG's extensive gas station network."
          />
          <Step
            icon="psychology"
            title="Analyze with AI"
            description="Leverage ML models and our AI advisor to predict foot traffic, demographic fit, and revenue potential."
          />
          <Step
            icon="rocket_launch"
            title="Apply and Open"
            description="Streamline your application process through our digital platform and launch your store in record time."
          />
        </div>
      </div>
    </section>
  );
}
