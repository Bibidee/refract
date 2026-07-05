import type { Decision, ShadowReport } from "@/lib/types";
import {
  cn,
  formatDecisionType,
  statusColor,
  shadowLevelColor,
  formatShadowLevel,
} from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  stakeholder_harm: "#EF4444",
  coordination_drag: "#F59E0B",
  reputational_effect: "#8B5CF6",
  incentive_distortion: "#F59E0B",
  long_term_lock_in: "#38BDF8",
  governance_precedent: "#8B5CF6",
  emotional_backlash: "#EF4444",
  trust_erosion: "#EF4444",
  operational_burden: "#F59E0B",
  minority_group_impact: "#EF4444",
  cost_externalisation: "#F59E0B",
  legal_or_compliance_risk: "#8B5CF6",
  strategic_misalignment: "#38BDF8",
  implementation_ambiguity: "#94A3B8",
  other: "#94A3B8",
};

interface DecisionNodeProps {
  decision: Decision;
  report?: ShadowReport | null;
}

export function DecisionNode({ decision, report }: DecisionNodeProps) {
  const shadowCategories = report
    ? Array.from(new Set(report.primaryShadows.map((s) => s.category))).slice(0, 6)
    : [];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer radar rings */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-slate-700/30"
            style={{ width: `${i * 30 + 100}px`, height: `${i * 30 + 100}px` }}
          />
        ))}

        {/* Shadow arc indicators */}
        {shadowCategories.map((cat, idx) => {
          const angle = (idx / shadowCategories.length) * 360;
          const rad = (angle * Math.PI) / 180;
          const r = 90;
          const x = 128 + r * Math.cos(rad);
          const y = 128 + r * Math.sin(rad);
          const color = CATEGORY_COLORS[cat] ?? "#94A3B8";
          return (
            <div
              key={cat}
              className="absolute w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                left: `${x - 5}px`,
                top: `${y - 5}px`,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          );
        })}

        {/* Glowing severity ring */}
        {report && (
          <div
            className="absolute rounded-full"
            style={{
              width: "140px",
              height: "140px",
              border: `1px solid ${severityRingColor(report.overallShadowLevel)}`,
              boxShadow: `0 0 20px ${severityRingColor(report.overallShadowLevel)}30`,
            }}
          />
        )}

        {/* Centre node */}
        <div className="relative z-10 w-28 h-28 rounded-full border border-slate-700/80 bg-[#111827] flex flex-col items-center justify-center p-3 text-center">
          <p className="text-slate-100 text-xs font-medium leading-tight line-clamp-3">{decision.title}</p>
        </div>
      </div>

      {/* Status + type beneath */}
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
            statusColor(decision.status)
          )}
        >
          {formatStatus(decision.status)}
        </span>
        <span className="text-xs text-slate-600">{formatDecisionType(decision.decisionType)}</span>
      </div>

      {report && (
        <div className="mt-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
              shadowLevelColor(report.overallShadowLevel)
            )}
          >
            <span className="w-1 h-1 rounded-full bg-current" />
            {formatShadowLevel(report.overallShadowLevel)} Shadow
          </span>
        </div>
      )}
    </div>
  );
}

function severityRingColor(level: string) {
  const map: Record<string, string> = {
    minimal: "#22C55E",
    moderate: "#F59E0B",
    significant: "#F97316",
    severe: "#EF4444",
    uncertain: "#8B5CF6",
  };
  return map[level] ?? "#38BDF8";
}

function formatStatus(s: string) {
  const map: Record<string, string> = {
    drafted: "Drafted",
    submitted: "Submitted",
    shadow_review_requested: "Review Requested",
    shadow_review_complete: "Review Complete",
    challenged: "Challenged",
    updated_after_review: "Revised",
    archived: "Archived",
  };
  return map[s] ?? s;
}
