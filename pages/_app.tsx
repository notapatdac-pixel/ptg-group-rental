import type { AppProps } from "next/app";
import "@/style/globals.css";
import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from "@/lib/languageContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </AuthProvider>
  );
}
