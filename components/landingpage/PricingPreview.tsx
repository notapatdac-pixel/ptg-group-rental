"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authContext";

function PlanCard({
  title,
  price,
  currencySuffix,
  subtitle,
  description,
  items,
  buttonText,
  href,
  featured = false,
  disabled = false,
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
  disabled?: boolean;
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
      <p className={`text-xs font-bold uppercase tracking-widest ${featured ? "text-primary" : "text-on-surface-variant"} mb-4`}>
        {title}
      </p>
      <div className="flex flex-col items-start mb-10">
        <div className="flex gap-1 items-baseline">
          <span className="font-headline text-5xl text-on-surface">{price}</span>
          <span className="text-on-surface-variant font-label text-sm uppercase tracking-wider">{currencySuffix}</span>
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
      {disabled ? (
        <span className="w-full py-4 px-6 rounded-md font-bold text-xs tracking-widest uppercase inline-flex items-center justify-center bg-outline-variant/20 border border-outline-variant/20 text-on-surface-variant cursor-not-allowed select-none">
          Already Signed In
        </span>
      ) : (
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
      )}
    </div>
  );
}

export default function PricingPreview() {
  const { user } = useAuth();

  return (
    <section className="py-32 px-8 bg-surface mb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl text-on-surface mb-6">Choose Your Growth Path</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Transparent plans designed for every stage of your retail business journey.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          <PlanCard
            title="Free"
            price="0"
            currencySuffix="THB"
            subtitle=""
            description="Start exploring retail opportunities."
            items={["Browse all listings", "Apply for 2 spaces"]}
            buttonText="Get started free"
            href="/createaccountpage/createAccountPage"
            disabled={!!user}
          />
          <PlanCard
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
          <PlanCard
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
      </div>
    </section>
  );
}
