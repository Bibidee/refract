export type DecisionType =
  | "dao_vote"
  | "protocol_upgrade"
  | "treasury_allocation"
  | "policy_change"
  | "community_rule"
  | "partnership"
  | "grant_decision"
  | "moderation_action"
  | "product_launch"
  | "nonprofit_decision"
  | "other";

export type DecisionStatus =
  | "drafted"
  | "submitted"
  | "shadow_review_requested"
  | "shadow_review_complete"
  | "challenged"
  | "updated_after_review"
  | "archived";

export type ShadowCategory =
  | "stakeholder_harm"
  | "coordination_drag"
  | "reputational_effect"
  | "incentive_distortion"
  | "long_term_lock_in"
  | "governance_precedent"
  | "emotional_backlash"
  | "trust_erosion"
  | "operational_burden"
  | "minority_group_impact"
  | "cost_externalisation"
  | "legal_or_compliance_risk"
  | "strategic_misalignment"
  | "implementation_ambiguity"
  | "other";

export type SeverityLevel = "low" | "medium" | "high" | "critical" | "unclear";
export type ShadowLevel = "minimal" | "moderate" | "significant" | "severe" | "uncertain";
export type DecisionReadiness =
  | "ready_with_minor_notes"
  | "needs_clarification"
  | "needs_mitigation_plan"
  | "high_risk_without_revision"
  | "insufficient_information";

export type Likelihood = "unlikely" | "possible" | "likely" | "highly_likely" | "uncertain";
export type TimeHorizon = "immediate" | "short_term" | "medium_term" | "long_term" | "unknown";

export interface Decision {
  decisionId: string;
  author: string;
  title: string;
  summary: string;
  proposedAction: string;
  rationale: string;
  targetGroup: string;
  decisionType: DecisionType;
  status: DecisionStatus;
  createdAt: number;
  reviewDeadline: number;
  sourceLinks: string[];
  shadowReportId?: string | null;
  revision?: DecisionRevision | null;
}

export interface DecisionRevision {
  revisedSummary: string;
  revisedAction: string;
  mitigationNotes: string;
  revisedAt: number;
}

export interface ShadowClaim {
  claimId: string;
  decisionId: string;
  submitter: string;
  shadowCategory: ShadowCategory;
  affectedParty: string;
  claimSummary: string;
  supportingEvidence: string[];
  severityClaimed: SeverityLevel;
  createdAt: number;
}

export interface PrimaryShadow {
  category: ShadowCategory;
  title: string;
  description: string;
  affectedGroups: string[];
  severity: SeverityLevel;
  likelihood: Likelihood;
  timeHorizon: TimeHorizon;
  evidenceBasis: string;
  confidence: number;
}

export interface Tradeoff {
  benefit: string;
  cost: string;
  whoBenefits: string[];
  whoPays: string[];
}

export interface ShadowReport {
  reportId: string;
  decisionId: string;
  overallShadowLevel: ShadowLevel;
  decisionReadiness: DecisionReadiness;
  summary: string;
  primaryShadows: PrimaryShadow[];
  affectedGroups: string[];
  blindSpots: string[];
  tradeoffs: Tradeoff[];
  mitigationSuggestions: string[];
  questionsBeforeVote: string[];
  consensusNotes: string;
  createdAt: number;
}

export type TxState =
  | "idle"
  | "preparing"
  | "wallet_confirmation"
  | "submitted"
  | "waiting"
  | "confirmed"
  | "failed";
