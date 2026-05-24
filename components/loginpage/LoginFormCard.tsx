"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";

const LABEL_CLS = "text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5 block";
const INPUT_CLS =
  "w-full bg-surface-container-low border-0 border-b-2 border-surface-container-highest px-1 py-3 text-on-surface text-sm focus:ring-0 focus:border-primary transition-all outline-none placeholder:text-surface-dim";

const RETAILER_DEST = "/retailer_backoffice/retailerDashboardPage";
const LANDLORD_DEST = "/landlord_backoffice/landlordOverviewPage";

export default function LoginFormCard() {
  const [tab, setTab] = useState<"retailer" | "landlord">("retailer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const activeCls =
    "flex-1 py-2.5 px-6 text-sm font-medium rounded-full bg-white text-on-surface shadow-sm transition-all cursor-pointer border-0";
  const inactiveCls =
    "flex-1 py-2.5 px-6 text-sm font-medium rounded-full text-on-surface-variant transition-all cursor-pointer border-0 bg-transparent";

  function handleLogin() {
    setError("");
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? "Invalid email or password.");
      return;
    }
    router.push(tab === "landlord" ? LANDLORD_DEST : RETAILER_DEST);
  }

  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm w-full max-w-xl mx-auto">
      <h1 className="font-headline text-3xl text-on-surface text-center mb-6">Sign In</h1>

      {/* Tab toggle */}
      <div className="flex bg-surface-container rounded-full p-1 mb-6">
        <button type="button" onClick={() => setTab("retailer")} className={tab === "retailer" ? activeCls : inactiveCls}>Retailer</button>
        <button type="button" onClick={() => setTab("landlord")} className={tab === "landlord" ? activeCls : inactiveCls}>Landlord</button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <label className={LABEL_CLS}>{tab === "retailer" ? "EMAIL ADDRESS" : "CODE"}</label>
          <input
            placeholder="name@company.com"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className={INPUT_CLS}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1.5">
            <label className={LABEL_CLS}>PASSWORD</label>
            <Link href="#" className="text-[10px] uppercase font-bold tracking-widest text-primary hover:text-primary/70 transition-colors no-underline">Forgot?</Link>
          </div>
          <input
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className={INPUT_CLS}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <p className="text-xs text-red-600 font-semibold">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          className="w-full primary-gradient text-on-primary font-bold py-4 rounded-full text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer border-0 mt-2"
        >
          SIGN IN
        </button>

        {/* Mock hint — matches reference repo style */}
        <p className="text-[10px] text-on-surface-variant/50 font-mono text-center -mt-2">
          {tab === "retailer"
            ? "Test: retailer@ptg.test / retailer123"
            : "Test: landlord@ptg.test / landlord123"}
        </p>
      </div>

      {tab === "retailer" && (
        <div className="flex items-center gap-1.5 justify-center mt-4">
          <span className="text-sm text-on-surface-variant">Don&apos;t have an account?</span>
          <Link href="/createaccountpage/createAccountPage" className="text-sm text-primary font-semibold hover:underline no-underline">
            Apply for access
          </Link>
        </div>
      )}
    </div>
  );
}
