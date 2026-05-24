import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", href: "/retailer_backoffice/retailerDashboardPage" },
  { label: "Performance", icon: "bar_chart", href: "/retailer_backoffice/performancePage" },
  { label: "ML Predictions", icon: "model_training", href: "/retailer_backoffice/mlPredictionsPage" },
  { label: "Submit Store Data", icon: "upload", href: "/retailer_backoffice/submitStoreDataPage" },
  { label: "My Applications", icon: "folder_open", href: "/retailer_backoffice/myApplicationsPage" },
  { label: "AI Advisor", icon: "smart_toy", href: "/retailer_backoffice/aiAdvisorPage" },
];

export default function RetailerBackofficeLayout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-16 flex items-center px-6 gap-4">
        <Link href="/retailer_backoffice/retailerDashboardPage" className="no-underline flex items-center gap-1.5 mr-6">
          <span className="text-xl font-serif font-bold text-primary">PTG</span>
          <span className="font-semibold text-on-surface text-sm">Retailer</span>
        </Link>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              placeholder="Search stores..."
              className="w-full bg-[#F5F2EB] rounded-full py-2 pl-10 pr-4 text-sm border-none outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/explorepage/explorePage" className="text-xs text-on-surface-variant font-medium no-underline hover:text-primary">EXPLORE LOCATIONS</Link>
          <Link href="/pricingpage/pricingPage" className="text-xs text-on-surface-variant font-medium no-underline hover:text-primary">PRICING</Link>
          <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:brightness-105 border-0 cursor-pointer">
            Add Stores
          </button>
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low border-0 bg-transparent cursor-pointer">
            <span className="material-symbols-outlined text-on-surface text-xl">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-sm font-bold">S</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-[188px] bg-white border-r border-gray-100 flex flex-col z-40">
          <nav className="flex-1 py-4">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`no-underline flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "text-primary border-l-[3px] border-primary bg-primary/5"
                      : "text-on-surface-variant border-l-[3px] border-transparent hover:bg-[#F5F2EB] hover:text-on-surface"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${active ? "text-primary" : "text-on-surface-variant"}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="py-4 border-t border-gray-100">
            <Link
              href="/loginpage/loginPage"
              className="no-underline flex items-center gap-3 px-5 py-3 text-sm font-medium text-on-surface-variant hover:text-error hover:bg-red-50 transition-colors border-l-[3px] border-transparent"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-[188px] p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
