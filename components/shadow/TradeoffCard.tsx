import type { Tradeoff } from "@/lib/types";

export function TradeoffCard({ tradeoff, index }: { tradeoff: Tradeoff; index: number }) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#111827]/60 overflow-hidden">
      <div className="grid grid-cols-2">
        <div className="p-4 border-r border-slate-800/60">
          <p className="text-xs text-green-400/70 font-medium mb-1.5">Benefit</p>
          <p className="text-slate-200 text-sm leading-relaxed">{tradeoff.benefit}</p>
          <div className="mt-3">
            <p className="text-xs text-slate-600 mb-1">Who benefits</p>
            <div className="flex flex-wrap gap-1">
              {tradeoff.whoBenefits.map((g) => (
                <span key={g} className="text-xs px-1.5 py-0.5 rounded bg-green-950/50 text-green-400/80 border border-green-400/20">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-red-400/70 font-medium mb-1.5">Cost</p>
          <p className="text-slate-200 text-sm leading-relaxed">{tradeoff.cost}</p>
          <div className="mt-3">
            <p className="text-xs text-slate-600 mb-1">Who pays</p>
            <div className="flex flex-wrap gap-1">
              {tradeoff.whoPays.map((g) => (
                <span key={g} className="text-xs px-1.5 py-0.5 rounded bg-red-950/50 text-red-400/80 border border-red-400/20">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
