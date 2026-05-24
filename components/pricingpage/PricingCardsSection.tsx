import Link from "next/link";

function PricingPlanCard({
  title,
  price,
  currencySuffix,
  subtitle,
  description,
  items,
  buttonText,
  href,
  featured = false,
}: {
  title: string;
  price: string;
  currencySuffix: string;
  subtitle: string;
  description: string;
  items: string[];
  buttonText: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "p-8 rounded-2xl border-2 border-primary flex flex-col relative h-full bg-surface-container-lowest scale-105 z-10"
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
      <div className="flex flex-col items-start mb-10">
        <div className="flex gap-1 items-baseline">
          <span className="font-headline text-5xl text-on-surface">{price}</span>
          <span className="text-on-surface-variant font-label text-sm uppercase tracking-wider">
            {currencySuffix}
          </span>
        </div>
        <p className="text-on-surface-variant text-[10px] uppercase">{subtitle}</p>
      </div>
      <p className="text-on-surface-variant text-sm h-10 mb-2">{description}</p>
      <ul className="space-y-4 mb-12 flex-grow">
        {items.map((item, i) => (
          <li key={i}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-sm">{item}</span>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={
          "w-full py-4 px-6 rounded-md font-bold text-xs tracking-widest uppercase transition-all cursor-pointer no-underline inline-flex items-center justify-center" +
          (featured
            ? " primary-gradient text-on-primary shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95"
            : " bg-white border border-outline-variant/20 text-primary transition-colors hover:opacity-95")
        }
      >
        {buttonText}
      </Link>
    </div>
  );
}

export default function PricingCardsSection() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-stretch max-w-7xl mx-auto">
        <PricingPlanCard
          title="Free"
          price="0"
          currencySuffix="THB"
          subtitle=""
          description="Start exploring retail opportunities."
          items={["Browse all listings", "Apply for 2 spaces"]}
          buttonText="Get started free"
          href="/createaccountpage/createAccountPage"
        />
        <PricingPlanCard
          title="Pro"
          price="499"
          currencySuffix="THB"
          subtitle="/month"
          description="Unlock AI insights to find the best locations."
          items={["Everything in Free", "AI recommendations", "Traffic analytics"]}
          buttonText="Start Pro"
          href="/checkoutpage/pro"
          featured
        />
        <PricingPlanCard
          title="Growth"
          price="1,000"
          currencySuffix="THB"
          subtitle="/month"
          description="Full platform with ML predictions and analytics."
          items={["Everything in Pro", "ML predictions", "Retailer dashboard"]}
          buttonText="Start Growth"
          href="/checkoutpage/growth"
        />
      </div>
    </section>
  );
}
