import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LONACI Pro - Predictions Loto Bonheur",
  description: "Predictions intelligentes pour le Loto Bonheur. 3 modeles IA, backtest, suivi des gains.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#0f1117] text-[#e8eaed] antialiased">{children}</body>
    </html>
  );
}
