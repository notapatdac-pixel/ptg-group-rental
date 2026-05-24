"use client";

import { useEffect } from "react";
import { CheckoutPlan } from "@/lib/checkoutPlans";

const INPUT_CLS =
  "w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface placeholder-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm";
const LABEL_CLS = "text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 block";

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div className="flex flex-col">
      <label className={LABEL_CLS}>{label}</label>
      <input placeholder={placeholder} type={type} className={INPUT_CLS} />
    </div>
  );
}

const STRIPE_INIT_JS = (pk: string, planId: string) => `
(function () {
  function mountStripe() {
    if (typeof Stripe === 'undefined') { setTimeout(mountStripe, 100); return; }
    var mountEl = document.getElementById('ptg-stripe-card-element');
    if (!mountEl || mountEl.dataset.stripeMounted) return;
    mountEl.dataset.stripeMounted = '1';
    var stripe = Stripe('${pk}');
    var elements = stripe.elements();
    var card = elements.create('card', {
      style: {
        base: { fontSize: '14px', fontFamily: '"DM Sans", sans-serif', color: '#191c1c', '::placeholder': { color: '#9e9890' } },
        invalid: { color: '#ba1a1a' }
      }
    });
    card.mount('#ptg-stripe-card-element');
    card.on('change', function(event) {
      var errEl = document.getElementById('ptg-stripe-card-errors');
      if (event.error) { errEl.textContent = event.error.message; errEl.classList.remove('hidden'); }
      else { errEl.textContent = ''; errEl.classList.add('hidden'); }
    });
    document.querySelectorAll('[id^="ptg-pay-btn-"]').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        btn.disabled = true; btn.textContent = 'Processing…';
        try {
          var res = await fetch('/api/create-payment-intent', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: btn.id.replace('ptg-pay-btn-', '') })
          });
          var data = await res.json();
          var result = await stripe.confirmCardPayment(data.clientSecret, { payment_method: { card: card } });
          if (result.error) {
            var errEl = document.getElementById('ptg-stripe-card-errors');
            errEl.textContent = result.error.message; errEl.classList.remove('hidden');
            btn.disabled = false; btn.textContent = btn.dataset.label || 'Pay';
          } else { window.location.href = '/payment-success'; }
        } catch(e) { console.error('Payment error:', e); btn.disabled = false; btn.textContent = btn.dataset.label || 'Pay'; }
      });
    });
  }
  mountStripe();
})();
`;

export default function CheckoutPaymentForm({ plan }: { plan: CheckoutPlan }) {
  const stripePk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => {
      const initScript = document.createElement("script");
      initScript.textContent = STRIPE_INIT_JS(stripePk, plan.id);
      document.body.appendChild(initScript);
    };
    document.head.appendChild(script);
  }, [stripePk, plan.id]);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="font-headline text-3xl text-on-surface mb-8">Payment Details</h2>
      <div className="flex flex-col gap-5">
        <Field label="CARDHOLDER NAME" placeholder="Johnathan Analyst" />
        <div className="flex flex-col">
          <label className={LABEL_CLS}>CARD DETAILS</label>
          <div
            id="ptg-stripe-card-element"
            className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3.5 min-h-[46px]"
          />
          <div id="ptg-stripe-card-errors" role="alert" className="text-xs text-error mt-1.5 hidden" />
        </div>
        {plan.show_save_checkbox && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`ptg-save-payment-${plan.id}`}
              className="w-4 h-4 rounded border-outline-variant/40 accent-primary cursor-pointer"
            />
            <span className="text-on-surface-variant text-sm">
              Save payment information for faster checkout next time.
            </span>
          </div>
        )}
        <button
          id={`ptg-pay-btn-${plan.id}`}
          type="button"
          data-label={plan.pay_label}
          className="w-full primary-gradient text-on-primary font-bold py-4 rounded-xl text-base shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer border-0"
        >
          {plan.pay_label}
        </button>
        {plan.show_gateway_note && (
          <div className="flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-on-surface-variant/50 text-base">lock</span>
            <span className="text-on-surface-variant text-xs">{plan.gateway_text}</span>
          </div>
        )}
        {plan.show_legal_text && (
          <p className="text-on-surface-variant/70 text-xs text-center leading-relaxed">
            {plan.legal_text}
          </p>
        )}
        {plan.show_card_icons && (
          <div className="flex justify-center gap-3 pt-2">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl">credit_card</span>
            <span className="material-symbols-outlined text-red-400/50 text-4xl">credit_card</span>
            <span className="material-symbols-outlined text-blue-400/50 text-4xl">credit_card</span>
          </div>
        )}
        {plan.show_media_images && (
          <div className="grid grid-cols-2 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/image/checkout-payment-terminal.jpg"
              alt="Payment terminal"
              className="w-full h-40 object-cover rounded-xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/image/checkout-analytics-tablet.jpg"
              alt="Analytics dashboard"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
