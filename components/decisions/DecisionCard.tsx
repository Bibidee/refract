import Link from "next/link";
import type { Decision } from "@/lib/types";
import {
  cn,
  formatDate,
  formatDecisionType,
  formatStatus,
  formatShadowLevel,
  shadowLevelColor,
  statusColor,
} from "@/lib/utils";
import { useApp } from "@/lib/context/AppContext";

export function DecisionCard({ decision }: { decision: Decision }) {
  const { getClaimsForDecision, getReport } = useApp();
  const claimCount = getClaimsForDecision(decision.decisionId).length;
  const report = decision.shadowReportId ? getReport(decision.shadowReportId) : null;

  return (
    <Link href={`/decision/${decision.decisionId}`} className="block group">
      <div className="relative p-5 rounded-xl border border-slate-800/60 bg-[#111827]/80 hover:border-slate-700/80 hover:bg-[#111827] transition-all duration-200">
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: "inset 0 0 30px rgba(56,189,248,0.04)" }}
        />

        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="flex-1 min-w-0 text-slate-100 font-medium text-sm leading-snug line-clamp-2 group-hover:text-sky-300 transition-colors">
            {decision.title}
          </h3>
          <span
            className={cn(
              "shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
              statusColor(decision.status)
            )}
          >
            {formatStatus(decision.status)}
          </span>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
          {decision.summary}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
            {formatDecisionType(decision.decisionType)}
          </span>

          {report && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                shadowLevelColor(report.overallShadowLevel)
              )}
            >
              <span className="w-1 h-1 rounded-full bg-current" />
              {formatShadowLevel(report.overallShadowLevel)} shadow
            </span>
          )}

          {claimCount > 0 && (
            <span className="text-xs text-slate-500">
              {claimCount} shadow claim{claimCount !== 1 ? "s" : ""}
            </span>
          )}

          <span className="text-xs text-slate-600 ml-auto">{formatDate(decision.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
