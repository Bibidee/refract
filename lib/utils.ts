import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ShadowLevel, DecisionReadiness, SeverityLevel, DecisionStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDecisionType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function shadowLevelColor(level: ShadowLevel) {
  const map: Record<ShadowLevel, string> = {
    minimal: "text-green-400 border-green-400/40 bg-green-400/10",
    moderate: "text-amber-400 border-amber-400/40 bg-amber-400/10",
    significant: "text-orange-400 border-orange-400/40 bg-orange-400/10",
    severe: "text-red-400 border-red-400/40 bg-red-400/10",
    uncertain: "text-violet-400 border-violet-400/40 bg-violet-400/10",
  };
  return map[level] ?? "text-slate-400 border-slate-400/40 bg-slate-400/10";
}

export function readinessColor(r: DecisionReadiness) {
  const map: Record<DecisionReadiness, string> = {
    ready_with_minor_notes: "text-green-400 border-green-400/40 bg-green-400/10",
    needs_clarification: "text-sky-400 border-sky-400/40 bg-sky-400/10",
    needs_mitigation_plan: "text-amber-400 border-amber-400/40 bg-amber-400/10",
    high_risk_without_revision: "text-red-400 border-red-400/40 bg-red-400/10",
    insufficient_information: "text-violet-400 border-violet-400/40 bg-violet-400/10",
  };
  return map[r] ?? "text-slate-400 border-slate-400/40";
}

export function severityColor(s: SeverityLevel) {
  const map: Record<SeverityLevel, string> = {
    low: "text-green-400",
    medium: "text-amber-400",
    high: "text-orange-400",
    critical: "text-red-400",
    unclear: "text-violet-400",
  };
  return map[s] ?? "text-slate-400";
}

export function statusColor(s: DecisionStatus) {
  const map: Record<DecisionStatus, string> = {
    drafted: "text-slate-400 bg-slate-400/10 border-slate-400/30",
    submitted: "text-sky-400 bg-sky-400/10 border-sky-400/30",
    shadow_review_requested: "text-violet-400 bg-violet-400/10 border-violet-400/30",
    shadow_review_complete: "text-green-400 bg-green-400/10 border-green-400/30",
    challenged: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    updated_after_review: "text-teal-400 bg-teal-400/10 border-teal-400/30",
    archived: "text-slate-500 bg-slate-500/10 border-slate-500/30",
  };
  return map[s] ?? "text-slate-400 bg-slate-400/10";
}

export function formatStatus(s: DecisionStatus) {
  const map: Record<DecisionStatus, string> = {
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

export function formatReadiness(r: DecisionReadiness) {
  const map: Record<DecisionReadiness, string> = {
    ready_with_minor_notes: "Ready with Minor Notes",
    needs_clarification: "Needs Clarification",
    needs_mitigation_plan: "Needs Mitigation Plan",
    high_risk_without_revision: "High Risk Without Revision",
    insufficient_information: "Insufficient Information",
  };
  return map[r] ?? r;
}

export function formatShadowLevel(l: ShadowLevel) {
  return l.charAt(0).toUpperCase() + l.slice(1);
}

export function formatCategory(c: string) {
  return c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function formatTimeHorizon(t: string) {
  const map: Record<string, string> = {
    immediate: "Immediate",
    short_term: "Short Term",
    medium_term: "Medium Term",
    long_term: "Long Term",
    unknown: "Unknown",
  };
  return map[t] ?? t;
}
