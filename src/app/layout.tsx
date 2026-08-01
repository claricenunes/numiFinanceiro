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
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full light ${inter.variable} ${caveat.variable}`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
