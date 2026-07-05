"use client";

import { getClient, getClientReady } from "./client";
import { waitForTx } from "./txWaiter";
import { CONTRACT_ADDRESS } from "./config";
import type { Decision, ShadowClaim, ShadowReport } from "@/lib/types";

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function fetchDecisions(): Promise<Decision[]> {
  const client = getClient();
  const raw = await (client as any).readContract({
    address: CONTRACT_ADDRESS,
    functionName: "list_decisions",
    args: [],
  });
  const items: any[] = JSON.parse(raw as string);
  return items.map(contractDecisionToFrontend);
}

export async function fetchDecision(decisionId: string): Promise<Decision> {
  const client = getClient();
  const raw = await (client as any).readContract({
    address: CONTRACT_ADDRESS,
    functionName: "read_decision",
    args: [decisionId],
  });
  return contractDecisionToFrontend(JSON.parse(raw as string));
}

export async function fetchShadowClaims(decisionId: string): Promise<ShadowClaim[]> {
  const client = getClient();
  const raw = await (client as any).readContract({
    address: CONTRACT_ADDRESS,
    functionName: "list_shadow_claims",
    args: [decisionId],
  });
  const items: any[] = JSON.parse(raw as string);
  return items.map(contractClaimToFrontend);
}

export async function fetchShadowReport(reportId: string): Promise<ShadowReport> {
  const client = getClient();
  const raw = await (client as any).readContract({
    address: CONTRACT_ADDRESS,
    functionName: "read_shadow_report",
    args: [reportId],
  });
  return contractReportToFrontend(JSON.parse(raw as string));
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function submitDecision(params: {
  title: string;
  summary: string;
  proposedAction: string;
  rationale: string;
  targetGroup: string;
  decisionType: string;
  sourceLinks: string[];
  reviewDeadline: number;
}): Promise<string> {
  const client = await getClientReady();
  const hash = await (client as any).writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "submit_decision",
    args: [
      params.title,
      params.summary,
      params.proposedAction,
      params.rationale,
      params.targetGroup,
      params.decisionType,
      JSON.stringify(params.sourceLinks),
      BigInt(params.reviewDeadline),
    ],
  });
  await waitForTx(hash);
  return hash;
}

export async function addShadowClaim(params: {
  decisionId: string;
  shadowCategory: string;
  affectedParty: string;
  claimSummary: string;
  supportingEvidence: string[];
  severityClaimed: string;
}): Promise<string> {
  const client = await getClientReady();
  const hash = await (client as any).writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "add_shadow_claim",
    args: [
      params.decisionId,
      params.shadowCategory,
      params.affectedParty,
      params.claimSummary,
      JSON.stringify(params.supportingEvidence),
      params.severityClaimed,
    ],
  });
  await waitForTx(hash);
  return hash;
}

export async function requestShadowReview(decisionId: string): Promise<void> {
  const client = await getClientReady();
  const hash = await (client as any).writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "request_shadow_review",
    args: [decisionId],
  });
  await waitForTx(hash);
}

export async function updateDecisionAfterReview(params: {
  decisionId: string;
  revisedSummary: string;
  revisedAction: string;
  mitigationNotes: string;
}): Promise<void> {
  const client = await getClientReady();
  const hash = await (client as any).writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "update_decision_after_review",
    args: [
      params.decisionId,
      params.revisedSummary,
      params.revisedAction,
      params.mitigationNotes,
    ],
  });
  await waitForTx(hash);
}

export async function archiveDecision(decisionId: string): Promise<void> {
  const client = await getClientReady();
  const hash = await (client as any).writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "archive_decision",
    args: [decisionId],
  });
  await waitForTx(hash);
}

// ─── Shape converters ─────────────────────────────────────────────────────────

function contractDecisionToFrontend(d: any): Decision {
  let sourceLinks: string[] = [];
  try {
    sourceLinks = JSON.parse(d.source_links ?? "[]");
  } catch {}

  return {
    decisionId: d.decision_id,
    author: d.author,
    title: d.title,
    summary: d.summary,
    proposedAction: d.proposed_action ?? "",
    rationale: d.rationale ?? "",
    targetGroup: d.target_group ?? "",
    decisionType: d.decision_type,
    status: d.status,
    createdAt: Number(d.created_at),
    reviewDeadline: Number(d.review_deadline ?? 0),
    sourceLinks,
    shadowReportId: d.shadow_report_id ?? null,
    revision: d.revision
      ? {
          revisedSummary: d.revision.revised_summary,
          revisedAction: d.revision.revised_action,
          mitigationNotes: d.revision.mitigation_notes,
          revisedAt: Number(d.revision.revised_at),
        }
      : null,
  };
}

function contractClaimToFrontend(c: any): ShadowClaim {
  let evidence: string[] = [];
  try {
    evidence = JSON.parse(c.supporting_evidence ?? "[]");
  } catch {}

  return {
    claimId: c.claim_id,
    decisionId: c.decision_id,
    submitter: c.submitter,
    shadowCategory: c.shadow_category,
    affectedParty: c.affected_party,
    claimSummary: c.claim_summary,
    supportingEvidence: evidence,
    severityClaimed: c.severity_claimed,
    createdAt: Number(c.created_at),
  };
}

function contractReportToFrontend(r: any): ShadowReport {
  return {
    reportId: r.report_id,
    decisionId: r.decision_id,
    overallShadowLevel: r.overall_shadow_level,
    decisionReadiness: r.decision_readiness,
    summary: r.summary,
    primaryShadows: (r.primary_shadows ?? []).map((s: any) => ({
      category: s.category,
      title: s.title,
      description: s.description,
      affectedGroups: s.affected_groups ?? [],
      severity: s.severity,
      likelihood: s.likelihood,
      timeHorizon: s.time_horizon,
      evidenceBasis: s.evidence_basis,
      confidence: Number(s.confidence ?? 0),
    })),
    affectedGroups: r.affected_groups ?? [],
    blindSpots: r.blind_spots ?? [],
    tradeoffs: (r.tradeoffs ?? []).map((t: any) => ({
      benefit: t.benefit,
      cost: t.cost,
      whoBenefits: t.who_benefits ?? [],
      whoPays: t.who_pays ?? [],
    })),
    mitigationSuggestions: r.mitigation_suggestions ?? [],
    questionsBeforeVote: r.questions_before_vote ?? [],
    consensusNotes: r.consensus_notes ?? "",
    createdAt: Number(r.created_at),
  };
}
