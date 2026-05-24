"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authContext";

export default function BottomCta() {
  const { user } = useAuth();

  return (
    <section>
      <div className="max-w-full primary-gradient p-12 lg:p-40 relative overflow-hidden text-center text-white">
        <div className="relative z-10">
          {user ? (
            <>
              <h2 className="text-5xl lg:text-6xl mb-8 leading-tight">
                Keep exploring, keep growing.
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto font-body">
                Discover new high-traffic locations and expand your retail presence across Thailand&apos;s premier energy and retail network.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-5xl lg:text-6xl mb-8 leading-tight">
                Ready to find your next store?
              </h2>
              <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto font-body">
                Join 3,890+ retailers scaling their businesses across PTG&apos;s premium
                nationwide energy and retail network.
              </p>
              <Link
                href="/createaccountpage/createAccountPage"
                className="btn-lime-white-cta inline-flex items-center justify-center bg-white text-on-surface px-10 py-5 rounded-md text-lg font-bold shadow-xl border-0 cursor-pointer transition-all active:scale-95 no-underline"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-48 -mb-48" />
      </div>
    </section>
  );
}
