import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { TxStatusBar } from "@/components/ui/TxStatusBar";

export const metadata: Metadata = {
  title: "Refract — Decision Shadow Tracker",
  description:
    "Surface hidden consequences, affected groups, and tradeoffs behind governance choices before they become irreversible.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#090B10] text-[#F8FAFC] antialiased">
        <AppProvider>
          <Navbar />
          <main className="pt-14">{children}</main>
          <TxStatusBar />
        </AppProvider>
      </body>
    </html>
  );
}
