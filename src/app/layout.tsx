import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="pt-BR" className={`h-full light ${inter.variable}`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
