import { CheckoutPlan } from "@/lib/checkoutPlans";

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined fill-icon text-primary text-xl flex-shrink-0">
        check_circle
      </span>
      <span className="text-on-surface text-sm">{text}</span>
    </div>
  );
}

export default function CheckoutPlanSummary({ plan }: { plan: CheckoutPlan }) {
  if (plan.mode === "card") {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="font-headline text-4xl text-on-surface mb-2">{plan.title}</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{plan.tagline}</p>
        <div className="flex items-end">
          <span className="font-headline text-7xl font-bold text-on-surface leading-none">
            {plan.price}
          </span>
          <span className="text-lg text-on-surface-variant self-end pb-2 ml-1">
            {plan.price_unit}
          </span>
        </div>
        <hr className="border-outline-variant/20 my-6" />
        <div className="flex flex-col gap-3">
          {plan.features.map((f) => (
            <FeatureItem key={f} text={f} />
          ))}
        </div>
        {plan.security_eyebrow && (
          <div className="flex items-center gap-4 bg-surface-container-low rounded-xl px-5 py-4 mt-6">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl flex-shrink-0">
              shield
            </span>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-0.5">
                {plan.security_eyebrow}
              </p>
              <p className="text-sm font-bold text-on-surface">{plan.security_text}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // split mode — Pro
  return (
    <div>
      <h1 className="font-headline text-5xl text-on-surface mb-3 leading-tight">{plan.title}</h1>
      <p className="text-on-surface-variant mb-6">{plan.tagline}</p>
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-lime-800 bg-lime-200/70 px-3 py-1 rounded-full">
            {plan.badge}
          </span>
          <span className="font-headline text-2xl font-bold text-primary">{plan.price} THB</span>
        </div>
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="font-headline text-xl text-on-surface">{plan.inner_plan_name}</h3>
          <span className="text-on-surface-variant text-sm">{plan.price_unit}</span>
        </div>
        <div className="flex flex-col gap-3">
          {plan.features.map((f) => (
            <FeatureItem key={f} text={f} />
          ))}
        </div>
        {plan.show_order_summary && (
          <div>
            <hr className="border-outline-variant/20 mb-4" />
            <div className="flex justify-between mb-2">
              <span className="text-on-surface-variant text-sm">{plan.vat_label}</span>
              <span className="text-on-surface text-sm">{plan.vat}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-on-surface-variant text-sm">Subtotal</span>
              <span className="text-on-surface text-sm">{plan.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface font-bold">Total</span>
              <span className="text-on-surface font-bold">{plan.total}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-start gap-3 bg-surface-container-low rounded-xl px-5 py-4">
        <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0">shield</span>
        <p className="text-on-surface-variant text-sm leading-relaxed">{plan.security_text}</p>
      </div>
    </div>
  );
}
