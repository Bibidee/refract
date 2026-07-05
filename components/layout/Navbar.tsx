"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/AppContext";
import { formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Shadow Chamber" },
  { href: "/submit", label: "Submit Decision" },
];

export function Navbar() {
  const pathname = usePathname();
  const { walletAddress, connectWallet, disconnectWallet } = useApp();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800/60 bg-[#090B10]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <RefractLogo />
          <span className="font-semibold text-slate-100 tracking-tight">Refract</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                pathname?.startsWith(l.href)
                  ? "text-sky-400 bg-sky-400/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div>
          {walletAddress ? (
            <button
              onClick={disconnectWallet}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/60 text-sm text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {formatAddress(walletAddress)}
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm hover:bg-sky-500/20 hover:border-sky-500/50 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function RefractLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="10" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="12" cy="12" r="6" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.7" />
      <circle cx="12" cy="12" r="2.5" fill="#38BDF8" />
      <path d="M12 2 L12 6" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M12 18 L12 22" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M2 12 L6 12" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M18 12 L22 12" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  );
}
