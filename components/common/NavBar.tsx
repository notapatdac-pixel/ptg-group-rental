"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { useLanguage } from "@/lib/languageContext";

interface NavBarProps {
  showSearch?: boolean;
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const dashDest = user.type === "landlord"
    ? "/landlord_backoffice/landlordOverviewPage"
    : "/retailer_backoffice/retailerDashboardPage";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-sm border-0"
      >
        <span className="text-sm font-bold text-white select-none">{user.initials}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] bg-white border border-outline-variant/20 rounded-2xl shadow-xl py-2 w-48 z-[60]">
          <div className="px-4 py-3 border-b border-outline-variant/20">
            <div className="text-xs font-bold text-on-surface">{user.name}</div>
            <div className="text-[10px] text-on-surface-variant">{user.email}</div>
          </div>
          <Link
            href={dashDest}
            onClick={() => setOpen(false)}
            className="no-underline text-on-surface w-full block"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container-low rounded-lg transition-colors">
              <span className="material-symbols-outlined text-base">grid_view</span>
              <span className="text-sm font-medium">Dashboard</span>
            </div>
          </Link>
          {user.type === "retailer" && (
            <Link
              href="/retailer_backoffice/retailerProfileSetupPage"
              onClick={() => setOpen(false)}
              className="no-underline text-on-surface w-full block"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined text-base">manage_accounts</span>
                <span className="text-sm font-medium">Edit Profile</span>
              </div>
            </Link>
          )}
          <button
            type="button"
            onClick={() => { setOpen(false); logout(); router.push("/loginpage/loginPage"); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container-low rounded-lg transition-colors text-error border-0 bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const { user } = useAuth();
  if (!user || user.type !== "retailer") return null;
  return (
    <div className="flex items-center bg-[#F5F2EB] rounded-full p-0.5 gap-0.5">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer border-0 ${
          lang === "en" ? "bg-white text-on-surface shadow-sm" : "bg-transparent text-on-surface-variant hover:text-on-surface"
        }`}
      >EN</button>
      <button
        type="button"
        onClick={() => setLang("th")}
        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer border-0 ${
          lang === "th" ? "bg-white text-on-surface shadow-sm" : "bg-transparent text-on-surface-variant hover:text-on-surface"
        }`}
      >TH</button>
    </div>
  );
}

export default function NavBar({ showSearch = false }: NavBarProps) {
  const { user } = useAuth();

  const logo = (
    <Link href="/" className="no-underline">
      <div className="flex items-center gap-2">
        <span className="text-4xl font-serif font-bold text-lime-500">PTG</span>
        <span className="font-headline text-lg tracking-tight text-on-surface">Retail Platform</span>
      </div>
    </Link>
  );

  const dashDest = user?.type === "landlord"
    ? "/landlord_backoffice/landlordOverviewPage"
    : "/retailer_backoffice/retailerDashboardPage";

  const links = (
    <div className="hidden md:flex gap-10 items-center">
      <Link href="/explorepage/explorePage" className="nav-link-lime font-sans">Explore Locations</Link>
      <Link href="/pricingpage/pricingPage" className="nav-link-lime font-sans">Pricing</Link>
      {user && (
        <Link href={dashDest} className="nav-link-lime font-sans">Dashboard</Link>
      )}
    </div>
  );

  const rightActions = user ? (
    <div className="flex items-center gap-3">
      <LanguageSwitcher />
      <ProfileMenu />
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <Link
        href="/loginpage/loginPage"
        className="btn-lime-ghost inline-flex items-center justify-center bg-transparent text-slate-600 font-sans text-sm px-4 py-2 border-0 cursor-pointer rounded-md transition-colors no-underline"
      >
        Sign In
      </Link>
      <Link
        href="/createaccountpage/createAccountPage"
        className="inline-flex items-center justify-center primary-gradient text-white px-6 py-2.5 rounded-md text-sm font-bold shadow-sm border-0 cursor-pointer transition-all hover:shadow-lime-500/40 hover:ring-2 hover:ring-lime-300 hover:ring-offset-2 hover:ring-offset-white/80 active:scale-95 no-underline"
      >
        Get Started
      </Link>
    </div>
  );

  if (!showSearch) {
    return (
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 overflow-visible">
        <div className="w-full flex justify-between items-center px-8 h-20">
          <div className="flex items-center gap-14">{logo}{links}</div>
          {rightActions}
        </div>
      </nav>
    );
  }

  const search = (
    <div className="pointer-events-auto relative group w-full max-w-2xl mx-auto transition-all duration-300 group-focus-within:max-w-5xl">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary">search</span>
      <input
        id="ptg-explore-search-input"
        placeholder="Search by province, station name, or district..."
        type="text"
        className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
      />
    </div>
  );

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-outline-variant/10 overflow-visible">
      <div className="w-full flex items-center px-8 h-20 gap-6">
        <div className="flex items-center gap-14 shrink-0">{logo}{links}</div>
        <div className="flex-1 flex justify-end pr-8">{search}</div>
        <div className="shrink-0">{rightActions}</div>
      </div>
    </nav>
  );
}
