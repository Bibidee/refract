"use client";

import { useApp } from "@/lib/context/AppContext";
import { cn } from "@/lib/utils";

const STATE_LABELS = {
  idle: null,
  preparing: "Preparing transaction…",
  wallet_confirmation: "Waiting for wallet confirmation…",
  submitted: "Transaction submitted",
  waiting: "Waiting for GenLayer finality…",
  confirmed: "Confirmed",
  failed: "Transaction failed",
};

export function TxStatusBar() {
  const { txState, txMessage } = useApp();
  if (txState === "idle") return null;

  const label = txMessage || STATE_LABELS[txState] || txState;
  const isError = txState === "failed";
  const isSuccess = txState === "confirmed";

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border text-sm shadow-xl",
        isError
          ? "bg-red-950/90 border-red-500/40 text-red-300"
          : isSuccess
          ? "bg-green-950/90 border-green-500/40 text-green-300"
          : "bg-slate-900/95 border-slate-700/60 text-slate-200"
      )}
    >
      {!isError && !isSuccess && (
        <span className="inline-block w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      )}
      {isSuccess && <span className="text-green-400">✓</span>}
      {isError && <span className="text-red-400">✗</span>}
      <span>{label}</span>
    </div>
  );
}
