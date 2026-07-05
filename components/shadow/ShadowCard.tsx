import type { PrimaryShadow } from "@/lib/types";
import { cn, severityColor, formatCategory, formatTimeHorizon } from "@/lib/utils";

export function ShadowCard({ shadow, index }: { shadow: PrimaryShadow; index: number }) {
  const confidencePct = Math.round(shadow.confidence * 100);

  return (
    <div className="p-4 rounded-xl border border-slate-800/60 bg-[#111827]/60 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-600 font-mono">#{index + 1}</span>
            <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
              {formatCategory(shadow.category)}
            </span>
          </div>
          <h4 className="text-slate-100 font-medium text-sm">{shadow.title}</h4>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("text-xs font-semibold uppercase tracking-wide", severityColor(shadow.severity))}>
            {shadow.severity}
          </span>
        </div>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed">{shadow.description}</p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-600 mb-1">Affected groups</p>
          <div className="flex flex-wrap gap-1">
            {shadow.affectedGroups.map((g) => (
              <span key={g} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/40">
                {g}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-500">
            <span>Likelihood</span>
            <span className="text-slate-400">{shadow.likelihood.replace(/_/g, " ")}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Time horizon</span>
            <span className="text-slate-400">{formatTimeHorizon(shadow.timeHorizon)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Evidence</span>
            <span className="text-slate-400">{shadow.evidenceBasis.replace(/_/g, " ")}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Validator confidence</span>
          <span>{confidencePct}%</span>
        </div>
        <div className="h-1 rounded-full bg-slate-800">
          <div
            className="h-1 rounded-full bg-sky-400/70 transition-all"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
