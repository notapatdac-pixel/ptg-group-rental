function Plan({
  title,
  price,
  subtitle,
  items,
  buttonText,
  featured = false,
}: {
  title: string;
  price: string;
  subtitle: string;
  items: string[];
  buttonText: string;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "p-8 rounded-2xl border-2 border-primary ring-4 ring-primary/5 flex flex-col h-full bg-surface-container-lowest relative scale-105 z-10"
          : "p-8 rounded-2xl border border-outline-variant/20 flex flex-col h-full bg-surface-container-lowest"
      }
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
          Most Popular
        </div>
      )}
      <p
        className={`text-xs font-bold uppercase tracking-widest ${
          featured ? "text-primary" : "text-on-surface-variant"
        } mb-4`}
      >
        {title}
      </p>
      <p className="text-4xl font-headline text-on-surface mb-8">
        {price}
        <span className="text-lg font-sans text-on-surface-variant"> {subtitle}</span>
      </p>
      <ul className="space-y-4 mb-12 flex-grow">
        {items.map((item, i) => (
          <li key={i}>
            <div className={`flex items-center gap-3 text-sm ${featured ? "text-on-surface" : "text-on-surface-variant"}`}>
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              {item}
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={
          "inline-flex items-center justify-center w-full py-4 rounded-md cursor-pointer font-bold " +
          (featured
            ? "primary-gradient text-white border-0 shadow-lg transition-all hover:shadow-lime-500/40 hover:ring-2 hover:ring-lime-300 active:scale-95"
            : title === "Starter"
            ? "btn-lime-outline bg-white border border-primary text-primary transition-colors"
            : "btn-lime-outline bg-white border border-outline text-on-surface transition-colors")
        }
      >
        {buttonText}
      </button>
    </div>
  );
}

export default function PricingPreview() {
  return (
    <section className="py-32 px-8 bg-surface mb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl text-on-surface mb-6">Choose Your Growth Path</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Transparent plans designed for every stage of your retail business journey.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Plan
            title="Starter"
            price="0"
            subtitle="THB /mo"
            items={["Search all locations", "Basic site details", "Digital applications"]}
            buttonText="Start for Free"
          />
          <Plan
            title="Professional"
            price="499"
            subtitle="THB /mo"
            items={[
              "Everything in Starter",
              "AI Recommendations",
              "Advanced Traffic Heatmaps",
              "Competitor proximity report",
            ]}
            buttonText="Upgrade to Pro"
            featured
          />
          <Plan
            title="Enterprise"
            price="1,000"
            subtitle="THB /mo"
            items={[
              "Everything in Pro",
              "ML Revenue Predictions",
              "Multi-site portfolio analysis",
              "API Access",
            ]}
            buttonText="Contact Sales"
          />
        </div>
      </div>
    </section>
  );
}
