import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: { default: "Numi", template: "%s | Numi" },
  description: "Gestão financeira pessoal inteligente",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
  colorScheme: "light dark",
};

// Public pages (landing, login, register, ...) have no user profile to read
// a saved theme from, so they follow the OS/browser preference instead —
// previously `light` was hardcoded here unconditionally, which meant dark
// mode was never reachable at all before logging in. Authenticated pages
// under /app still resolve theme from the user's saved profile, via
// ThemeProvider in src/app/app/layout.tsx (unchanged) — this script only
// sets the *initial* class for the first paint; ThemeProvider takes over
// once the profile loads there.
//
// Runs synchronously in <head>, before first paint (see
// node_modules/next/dist/docs/.../preventing-flash-before-hydration.md,
// "Themes" section) — suppressHydrationWarning on <html> below because
// this script intentionally mutates the class before React hydrates.
const NO_FLASH_THEME_SCRIPT = `(function(){try{if(!window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("light")}}catch(e){document.documentElement.classList.add("light")}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${inter.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
