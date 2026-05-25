import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import NavBar from "@/components/common/NavBar";

const NAV_ITEMS = [
  { label: "Overview", icon: "dashboard", href: "/retailer_backoffice/retailerDashboardPage" },
  { label: "Performance", icon: "bar_chart", href: "/retailer_backoffice/performancePage" },
  { label: "ML Predictions", icon: "model_training", href: "/retailer_backoffice/mlPredictionsPage" },
  { label: "My Applications", icon: "folder_open", href: "/retailer_backoffice/myApplicationsPage" },
  { label: "AI Advisor", icon: "smart_toy", href: "/retailer_backoffice/aiAdvisorPage" },
];

export default function RetailerBackofficeLayout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col">
      <NavBar />

      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 bottom-0 w-[188px] bg-white border-r border-outline-variant/10 flex flex-col z-40">
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
          <div className="py-4 border-t border-outline-variant/10">
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
        <main className="flex-1 ml-[188px] p-8 min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
