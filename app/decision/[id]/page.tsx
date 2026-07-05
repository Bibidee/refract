"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/AppContext";
import { DecisionNode } from "@/components/shadow/DecisionNode";
import { ShadowLevelBadge } from "@/components/shadow/ShadowLevelBadge";
import { ReadinessBadge } from "@/components/shadow/ReadinessBadge";
import { ShadowCard } from "@/components/shadow/ShadowCard";
import { TradeoffCard } from "@/components/shadow/TradeoffCard";
import { TimelineBand } from "@/components/shadow/TimelineBand";
import {
  cn,
  formatDate,
  formatDecisionType,
  formatStatus,
  formatAddress,
  statusColor,
  formatCategory,
} from "@/lib/utils";
import type { ShadowCategory, SeverityLevel } from "@/lib/types";

const SHADOW_CATEGORIES: ShadowCategory[] = [
  "stakeholder_harm", "coordination_drag", "reputational_effect",
  "incentive_distortion", "long_term_lock_in", "governance_precedent",
  "emotional_backlash", "trust_erosion", "operational_burden",
  "minority_group_impact", "cost_externalisation", "legal_or_compliance_risk",
  "strategic_misalignment", "implementation_ambiguity", "other",
];
const SEVERITIES: SeverityLevel[] = ["low", "medium", "high", "critical", "unclear"];

const TABS = ["Overview", "Shadow Claims", "Consensus Report", "Tradeoffs", "Revisions", "Contract Activity"];

export default function DecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    getDecision, getReport, getClaimsForDecision,
    addClaim, requestReview, reviseDecision, archiveDecision,
    walletAddress, connectWallet, txState, contractAddress,
  } = useApp();

  const decision = getDecision(id);
  const [tab, setTab] = useState("Overview");
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);

  const [claimForm, setClaimForm] = useState({
    shadowCategory: "stakeholder_harm" as ShadowCategory,
    affectedParty: "",
    claimSummary: "",
    supportingEvidence: "",
    severityClaimed: "medium" as SeverityLevel,
  });
  const [reviseForm, setReviseForm] = useState({
    revisedSummary: "",
    revisedAction: "",
    mitigationNotes: "",
  });

  if (!decision) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Decision not found.</p>
          <Link href="/dashboard" className="text-sky-400 text-sm hover:underline">Back to Shadow Chamber</Link>
        </div>
      </div>
    );
  }

  const report = decision.shadowReportId ? getReport(decision.shadowReportId) : null;
  const claims = getClaimsForDecision(id);
  const isReviewing = txState !== "idle";
  const canRequestReview = !isReviewing && ["submitted", "challenged", "updated_after_review"].includes(decision.status);

  const submitClaim = async () => {
    if (!walletAddress) { await connectWallet(); return; }
    try {
      await addClaim({
        decisionId: id,
        shadowCategory: claimForm.shadowCategory,
        affectedParty: claimForm.affectedParty,
        claimSummary: claimForm.claimSummary,
        supportingEvidence: claimForm.supportingEvidence.split("\n").map(l => l.trim()).filter(Boolean),
        severityClaimed: claimForm.severityClaimed,
      });
      setShowClaimModal(false);
      setClaimForm({ shadowCategory: "stakeholder_harm", affectedParty: "", claimSummary: "", supportingEvidence: "", severityClaimed: "medium" });
    } catch {
      // txState set to failed by AppContext
    }
  };

  const submitRevision = async () => {
    try {
      await reviseDecision({
        decisionId: id,
        revisedSummary: reviseForm.revisedSummary,
        revisedAction: reviseForm.revisedAction,
        mitigationNotes: reviseForm.mitigationNotes,
      });
      setShowReviseModal(false);
    } catch {
      // txState set to failed by AppContext
    }
  };

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
          ← Shadow Chamber
        </Link>

        {/* 3-column layout */}
        <div className="grid lg:grid-cols-[280px_1fr_240px] gap-6">
          {/* Left: Decision packet */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-slate-800/60 bg-[#111827]/80">
              <p className="text-xs text-slate-600 mb-3 uppercase tracking-wide">Decision Packet</p>
              <h2 className="text-slate-100 font-semibold text-sm mb-3 leading-snug">{decision.title}</h2>
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mb-4", statusColor(decision.status))}>
                {formatStatus(decision.status)}
              </span>
              <div className="space-y-3 text-xs">
                <PRow label="Type">{formatDecisionType(decision.decisionType)}</PRow>
                <PRow label="Author">{formatAddress(decision.author)}</PRow>
                <PRow label="Target">{decision.targetGroup}</PRow>
                <PRow label="Submitted">{formatDate(decision.createdAt)}</PRow>
                <PRow label="Deadline">{formatDate(decision.reviewDeadline)}</PRow>
                {decision.sourceLinks.length > 0 && (
                  <div>
                    <p className="text-slate-600 mb-1">Sources</p>
                    {decision.sourceLinks.map((l, i) => (
                      <p key={i} className="text-sky-400/80 truncate text-xs">{l}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800/60 bg-[#111827]/80">
              <p className="text-xs text-slate-600 mb-2">Shadow Claims</p>
              <p className="text-2xl font-bold text-slate-100">{claims.length}</p>
              <p className="text-xs text-slate-600 mt-1">community submissions</p>
            </div>
          </div>

          {/* Centre: Decision node + tabs */}
          <div className="space-y-6">
            {/* Decision Node */}
            <div className="flex justify-center py-4">
              <DecisionNode decision={decision} report={report} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    tab === t ? "bg-sky-400/10 text-sky-400 border border-sky-400/30" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {tab === "Overview" && (
                <div className="space-y-4">
                  <Section title="Summary">{decision.summary}</Section>
                  <Section title="Proposed Action">{decision.proposedAction}</Section>
                  <Section title="Rationale">{decision.rationale}</Section>
                </div>
              )}

              {tab === "Shadow Claims" && (
                <div className="space-y-4">
                  {claims.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border border-slate-800/60 bg-[#111827]/40">
                      <p className="text-slate-400 text-sm mb-1">No community shadows have been submitted yet.</p>
                      <p className="text-slate-600 text-xs">If you see an overlooked consequence, add it before review.</p>
                    </div>
                  ) : (
                    claims.map((c) => (
                      <div key={c.claimId} className="p-4 rounded-xl border border-slate-800/60 bg-[#111827]/60">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                            {formatCategory(c.shadowCategory)}
                          </span>
                          <span className={cn("text-xs font-semibold", severityTextColor(c.severityClaimed))}>
                            {c.severityClaimed}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mb-1">{c.affectedParty}</p>
                        <p className="text-slate-500 text-xs leading-relaxed">{c.claimSummary}</p>
                        <p className="text-slate-700 text-xs mt-2">{formatDate(c.createdAt)} · {formatAddress(c.submitter)}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "Consensus Report" && (
                <div className="space-y-5">
                  {!report ? (
                    <div className="text-center py-12 rounded-xl border border-slate-800/60 bg-[#111827]/40">
                      <p className="text-slate-400 text-sm mb-1">No shadow report yet.</p>
                      <p className="text-slate-600 text-xs">Request GenLayer review to generate a consensus impact map.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <ShadowLevelBadge level={report.overallShadowLevel} large />
                        <ReadinessBadge readiness={report.decisionReadiness} large />
                      </div>
                      <Section title="Summary">{report.summary}</Section>
                      <div>
                        <p className="text-xs text-slate-600 mb-3">Primary Shadows ({report.primaryShadows.length})</p>
                        <div className="space-y-3">
                          {report.primaryShadows.map((s, i) => (
                            <ShadowCard key={i} shadow={s} index={i} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-2">Blind Spots</p>
                        <div className="space-y-2">
                          {report.blindSpots.map((b, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                              <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
                              {b}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-2">Mitigation Suggestions</p>
                        <div className="space-y-2">
                          {report.mitigationSuggestions.map((m, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className="text-green-400 mt-0.5 shrink-0">→</span>
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-2">Questions Before Vote</p>
                        <div className="space-y-2">
                          {report.questionsBeforeVote.map((q, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                              <span className="text-sky-400 mt-0.5 shrink-0">?</span>
                              {q}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-violet-400/20 bg-violet-400/5">
                        <p className="text-xs text-violet-400/70 mb-1">Consensus Notes</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{report.consensusNotes}</p>
                        <p className="text-xs text-slate-600 mt-2">This output is non-deterministic. Validator interpretations may vary in wording.</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab === "Tradeoffs" && (
                <div className="space-y-4">
                  {!report ? (
                    <p className="text-slate-500 text-sm">Run shadow review to see tradeoff analysis.</p>
                  ) : (
                    <>
                      {report.tradeoffs.map((t, i) => <TradeoffCard key={i} tradeoff={t} index={i} />)}
                      <div>
                        <p className="text-xs text-slate-600 mb-3 mt-4">Timeline of Effects</p>
                        <TimelineBand shadows={report.primaryShadows} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab === "Revisions" && (
                <div className="space-y-4">
                  {!decision.revision ? (
                    <div className="text-center py-12 rounded-xl border border-slate-800/60 bg-[#111827]/40">
                      <p className="text-slate-400 text-sm mb-1">No revisions yet.</p>
                      <p className="text-slate-600 text-xs">After reviewing the shadow map, you can revise the decision here.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <p className="text-xs text-slate-600 uppercase tracking-wide">Original</p>
                        <Section title="Summary">{decision.summary}</Section>
                        <Section title="Proposed Action">{decision.proposedAction}</Section>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs text-slate-600 uppercase tracking-wide">Revised · {formatDate(decision.revision.revisedAt)}</p>
                        <Section title="Summary">{decision.revision.revisedSummary}</Section>
                        <Section title="Revised Action">{decision.revision.revisedAction}</Section>
                        <Section title="Mitigation Notes">{decision.revision.mitigationNotes}</Section>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "Contract Activity" && (
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg border border-slate-800/60 bg-slate-900/40 mb-4">
                    <p className="text-xs text-slate-600 mb-1">Contract address</p>
                    <p className="text-xs font-mono text-sky-400/80 break-all">{contractAddress}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800/60 bg-[#111827]/60">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Decision submitted</span>
                      <span className="text-slate-600">{formatDate(decision.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-mono">{formatAddress(decision.author)}</p>
                  </div>
                  {claims.map((c) => (
                    <div key={c.claimId} className="p-4 rounded-xl border border-slate-800/60 bg-[#111827]/60">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Shadow claim added</span>
                        <span className="text-slate-600">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-mono">{formatAddress(c.submitter)}</p>
                    </div>
                  ))}
                  {report && (
                    <div className="p-4 rounded-xl border border-green-400/20 bg-green-400/5">
                      <div className="flex justify-between items-center">
                        <span className="text-green-400/80">Shadow review complete</span>
                        <span className="text-slate-600">{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Status & actions */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-800/60 bg-[#111827]/80">
              <p className="text-xs text-slate-600 mb-3">Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => setShowClaimModal(true)}
                  disabled={decision.status === "archived"}
                  className="w-full px-4 py-2.5 rounded-lg border border-amber-400/30 bg-amber-400/5 text-amber-400 text-sm hover:bg-amber-400/10 disabled:opacity-30 transition-colors"
                >
                  Add Shadow Claim
                </button>

                <button
                  onClick={() => requestReview(id)}
                  disabled={!canRequestReview}
                  className="w-full px-4 py-2.5 rounded-lg border border-sky-400/30 bg-sky-400/5 text-sky-400 text-sm hover:bg-sky-400/10 disabled:opacity-30 transition-colors"
                >
                  {txState !== "idle" ? "Review in progress…" : "Generate Shadow Map"}
                </button>

                {report && (
                  <button
                    onClick={() => setShowReviseModal(true)}
                    className="w-full px-4 py-2.5 rounded-lg border border-green-400/30 bg-green-400/5 text-green-400 text-sm hover:bg-green-400/10 transition-colors"
                  >
                    Revise After Review
                  </button>
                )}

                <button
                  onClick={async () => { if (confirm("Archive this decision?")) await archiveDecision(id); }}
                  disabled={decision.status === "archived"}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700/60 text-slate-500 text-sm hover:text-slate-400 disabled:opacity-30 transition-colors"
                >
                  Archive Decision
                </button>
              </div>
            </div>

            {report && (
              <div className="p-4 rounded-xl border border-slate-800/60 bg-[#111827]/80 space-y-3">
                <p className="text-xs text-slate-600">Shadow Report</p>
                <ShadowLevelBadge level={report.overallShadowLevel} />
                <ReadinessBadge readiness={report.decisionReadiness} />
                <div>
                  <p className="text-xs text-slate-600 mb-1.5">Affected Groups</p>
                  <div className="flex flex-wrap gap-1">
                    {report.affectedGroups.map((g) => (
                      <span key={g} className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/40">{g}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shadow Claim Modal */}
      {showClaimModal && (
        <Modal title="Add Shadow Claim" onClose={() => setShowClaimModal(false)}>
          <p className="text-xs text-slate-500 mb-4">
            A shadow claim is not an accusation. It is a possible hidden consequence for validators to evaluate.
          </p>
          <div className="space-y-4">
            <ModalField label="Shadow category">
              <select className={inputCls} value={claimForm.shadowCategory}
                onChange={e => setClaimForm(f => ({ ...f, shadowCategory: e.target.value as ShadowCategory }))}>
                {SHADOW_CATEGORIES.map(c => <option key={c} value={c}>{formatCategory(c)}</option>)}
              </select>
            </ModalField>
            <ModalField label="Affected party">
              <input className={inputCls} value={claimForm.affectedParty}
                onChange={e => setClaimForm(f => ({ ...f, affectedParty: e.target.value }))}
                placeholder="Who is overlooked or harmed?" />
            </ModalField>
            <ModalField label="Claim summary">
              <textarea className={inputCls} rows={3} value={claimForm.claimSummary}
                onChange={e => setClaimForm(f => ({ ...f, claimSummary: e.target.value }))}
                placeholder="What hidden consequence do you suspect?" />
            </ModalField>
            <ModalField label="Supporting links (one per line)">
              <textarea className={inputCls} rows={2} value={claimForm.supportingEvidence}
                onChange={e => setClaimForm(f => ({ ...f, supportingEvidence: e.target.value }))}
                placeholder="https://example.org/evidence" />
            </ModalField>
            <ModalField label="Severity estimate">
              <select className={inputCls} value={claimForm.severityClaimed}
                onChange={e => setClaimForm(f => ({ ...f, severityClaimed: e.target.value as SeverityLevel }))}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </ModalField>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setShowClaimModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
            <button onClick={submitClaim} className="px-5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors">
              Submit Shadow Claim
            </button>
          </div>
        </Modal>
      )}

      {/* Revise Modal */}
      {showReviseModal && (
        <Modal title="Revise Decision After Review" onClose={() => setShowReviseModal(false)}>
          <p className="text-xs text-slate-500 mb-4">
            The original decision and shadow report will remain visible. This revision shows how the decision improved after review.
          </p>
          <div className="space-y-4">
            <ModalField label="Revised summary">
              <textarea className={inputCls} rows={3} value={reviseForm.revisedSummary}
                onChange={e => setReviseForm(f => ({ ...f, revisedSummary: e.target.value }))}
                placeholder="Updated description of the decision." />
            </ModalField>
            <ModalField label="Revised action">
              <textarea className={inputCls} rows={3} value={reviseForm.revisedAction}
                onChange={e => setReviseForm(f => ({ ...f, revisedAction: e.target.value }))}
                placeholder="What specifically changed from the original action?" />
            </ModalField>
            <ModalField label="Mitigation notes">
              <textarea className={inputCls} rows={3} value={reviseForm.mitigationNotes}
                onChange={e => setReviseForm(f => ({ ...f, mitigationNotes: e.target.value }))}
                placeholder="How did you address the shadow report's concerns?" />
            </ModalField>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setShowReviseModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
            <button onClick={submitRevision} className="px-5 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/20 transition-colors">
              Submit Revision
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-slate-800/60 bg-[#111827]/40">
      <p className="text-xs text-slate-600 mb-2">{title}</p>
      <p className="text-slate-300 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function PRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-slate-600 mb-0.5">{label}</p>
      <p className="text-slate-400">{children}</p>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#111827] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-100 font-semibold text-sm">{title}</h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 text-lg">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function severityTextColor(s: string) {
  const map: Record<string, string> = {
    low: "text-green-400",
    medium: "text-amber-400",
    high: "text-orange-400",
    critical: "text-red-400",
    unclear: "text-violet-400",
  };
  return map[s] ?? "text-slate-400";
}

const inputCls =
  "w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-sky-400/40 transition-colors";
