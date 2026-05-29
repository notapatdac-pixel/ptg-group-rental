import type { AppProps } from "next/app";
import "@/style/globals.css";
import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from "@/lib/languageContext";
import { StoreFilterProvider } from "@/lib/storeFilterContext";
import { StationFilterProvider } from "@/lib/stationFilterContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <StoreFilterProvider>
          <StationFilterProvider>
            <Component {...pageProps} />
          </StationFilterProvider>
        </StoreFilterProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
