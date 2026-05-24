import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: (string | FooterLink)[];
}) {
  return (
    <div>
      <h4 className="font-headline text-lg mb-8">{title}</h4>
      <ul className="space-y-4">
        {links.map((item, i) => {
          const label = typeof item === "string" ? item : item.label;
          const href = typeof item === "string" ? "#" : item.href;
          return (
            <li key={i}>
              <Link
                href={href}
                className="text-slate-400 hover:text-lime-400 text-sm transition-colors underline-offset-4 hover:underline"
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-12 px-6">
      <div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-28">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <span className="text-4xl font-serif font-bold text-lime-500">PTG</span>
              <span className="font-headline text-lg tracking-tight">Retail Platform</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Thailand&apos;s leading intelligent marketplace connecting businesses
              with high-potential energy station retail hubs.
            </p>
          </div>
          <FooterColumn
            title="Platform"
            links={[
              { label: "Explore", href: "/explorepage/explorePage" },
              { label: "Pricing", href: "/pricingpage/pricingPage" },
              "AI Advisor",
              "Market Analytics",
            ]}
          />
          <FooterColumn
            title="Company"
            links={["About Us", "Careers", "Newsroom", "Investor Relations"]}
          />
          <FooterColumn
            title="Legal"
            links={["Terms", "Privacy", "Cookie Policy", "Whistleblowing"]}
          />
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 text-xs">
            © 2024 PTG Energy Public Company Limited. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-500 hover:text-lime-400 transition-colors">
              <span className="material-symbols-outlined text-xl">language</span>
            </Link>
            <Link href="#" className="text-slate-500 hover:text-lime-400 transition-colors">
              <span className="material-symbols-outlined text-xl">contact_support</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
