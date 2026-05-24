export interface CheckoutPlan {
  id: string;
  mode: "card" | "split";
  title: string;
  tagline: string;
  badge: string | null;
  inner_plan_name: string | null;
  price: string;
  price_unit: string;
  features: string[];
  show_order_summary: boolean;
  subtotal: string | null;
  vat_label: string | null;
  vat: string | null;
  total: string | null;
  security_eyebrow: string | null;
  security_text: string;
  pay_label: string;
  show_save_checkbox: boolean;
  show_legal_text: boolean;
  legal_text: string | null;
  show_card_icons: boolean;
  show_gateway_note: boolean;
  gateway_text: string | null;
  show_media_images: boolean;
}

export const CHECKOUT_PLANS: Record<string, CheckoutPlan> = {
  growth: {
    id: "growth",
    mode: "card",
    title: "Growth Plan",
    tagline: "Scale your retail operations with data-driven insights.",
    badge: null,
    inner_plan_name: null,
    price: "1,000",
    price_unit: "THB/mo",
    features: [
      "ML revenue predictions",
      "Advanced AI advisory",
      "Full retailer dashboard",
      "Priority Support",
      "Traffic analytics",
    ],
    show_order_summary: false,
    subtotal: null,
    vat_label: null,
    vat: null,
    total: null,
    security_eyebrow: "ENTERPRISE GRADE",
    security_text: "Secure Intelligence Guarantee",
    pay_label: "Pay 1,000 THB",
    show_save_checkbox: false,
    show_legal_text: false,
    legal_text: null,
    show_card_icons: false,
    show_gateway_note: true,
    gateway_text: "Secure encrypted transaction via PTG Gateway",
    show_media_images: true,
  },
  pro: {
    id: "pro",
    mode: "split",
    title: "Complete your upgrade",
    tagline:
      "Get full access to the Pro Plan and unlock advanced retail intelligence tools.",
    badge: "PROFESSIONAL",
    inner_plan_name: "Pro Plan",
    price: "499",
    price_unit: "/ month",
    features: [
      "AI recommendations",
      "Traffic analytics",
      "Priority Support",
      "Real-time alerts",
    ],
    show_order_summary: true,
    subtotal: "499.00 THB",
    vat_label: "VAT (0%)",
    vat: "0.00 THB",
    total: "499.00 THB",
    security_eyebrow: null,
    security_text:
      "Your transaction is secured with 256-bit SSL encryption and monitored for potential fraud.",
    pay_label: "Pay 499 THB",
    show_save_checkbox: true,
    show_legal_text: true,
    legal_text:
      'By clicking "Pay 499 THB", you agree to our Terms of Service and Subscription Policy.',
    show_card_icons: true,
    show_gateway_note: false,
    gateway_text: null,
    show_media_images: false,
  },
};
