import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import CheckoutPlanSummary from "@/components/checkoutpage/CheckoutPlanSummary";
import CheckoutPaymentForm from "@/components/checkoutpage/CheckoutPaymentForm";
import { CHECKOUT_PLANS, type CheckoutPlan } from "@/lib/checkoutPlans";

export const getStaticPaths: GetStaticPaths = () => ({
  paths: Object.keys(CHECKOUT_PLANS).map((id) => ({ params: { plan: id } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ plan: CheckoutPlan }> = ({ params }) => {
  const planId = params?.plan as string;
  const plan = CHECKOUT_PLANS[planId];
  if (!plan) return { notFound: true };
  return { props: { plan } };
};

export default function CheckoutPage({ plan }: { plan: CheckoutPlan }) {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <NavBar />
      <main className="max-w-6xl mx-auto px-8 pt-32 pb-20">
        <Link
          href="/pricingpage/pricingPage"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors no-underline mb-8"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Pricing</span>
        </Link>
        <div className="grid md:grid-cols-[2fr_3fr] gap-8 items-start">
          <CheckoutPlanSummary plan={plan} />
          <CheckoutPaymentForm plan={plan} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
