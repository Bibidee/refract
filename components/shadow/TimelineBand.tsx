import type { PrimaryShadow } from "@/lib/types";
import { cn, severityColor } from "@/lib/utils";

const HORIZONS = [
  { key: "immediate", label: "Immediate", color: "border-red-400/40 bg-red-400/5" },
  { key: "short_term", label: "Short Term", color: "border-amber-400/40 bg-amber-400/5" },
  { key: "medium_term", label: "Medium Term", color: "border-sky-400/40 bg-sky-400/5" },
  { key: "long_term", label: "Long Term", color: "border-violet-400/40 bg-violet-400/5" },
];

export function TimelineBand({ shadows }: { shadows: PrimaryShadow[] }) {
  return (
    <div className="space-y-3">
      {HORIZONS.map(({ key, label, color }) => {
        const items = shadows.filter((s) => s.timeHorizon === key);
        return (
          <div key={key} className={cn("rounded-xl border p-4", color)}>
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">{label}</p>
            {items.length === 0 ? (
              <p className="text-xs text-slate-700">No shadows in this window</p>
            ) : (
              <div className="space-y-1.5">
                {items.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={cn("text-xs font-semibold mt-0.5", severityColor(s.severity))}>▪</span>
                    <span className="text-xs text-slate-300">{s.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
