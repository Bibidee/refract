"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/AppContext";
import type { DecisionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Decision Identity",
  "Proposed Action",
  "Rationale & Upside",
  "Known Risks",
  "Evidence Links",
  "Review Settings",
  "Preview Packet",
];

const DECISION_TYPES: { value: DecisionType; label: string }[] = [
  { value: "dao_vote", label: "DAO Vote" },
  { value: "protocol_upgrade", label: "Protocol Upgrade" },
  { value: "treasury_allocation", label: "Treasury Allocation" },
  { value: "policy_change", label: "Policy Change" },
  { value: "community_rule", label: "Community Rule" },
  { value: "partnership", label: "Partnership" },
  { value: "grant_decision", label: "Grant Decision" },
  { value: "moderation_action", label: "Moderation Action" },
  { value: "product_launch", label: "Product Launch" },
  { value: "nonprofit_decision", label: "Nonprofit Decision" },
  { value: "other", label: "Other" },
];

interface FormData {
  title: string;
  summary: string;
  decisionType: DecisionType;
  targetGroup: string;
  proposedAction: string;
  rationale: string;
  intendedBeneficiaries: string;
  knownRisks: string;
  sourceLinks: string;
  reviewDeadline: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const { submitDecision, walletAddress, connectWallet } = useApp();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [newDecisionId, setNewDecisionId] = useState("");
  const [form, setForm] = useState<FormData>({
    title: "",
    summary: "",
    decisionType: "dao_vote",
    targetGroup: "",
    proposedAction: "",
    rationale: "",
    intendedBeneficiaries: "",
    knownRisks: "",
    sourceLinks: "",
    reviewDeadline: "",
  });

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.summary.trim() && form.targetGroup.trim();
    if (step === 1) return form.proposedAction.trim();
    if (step === 2) return form.rationale.trim();
    return true;
  };

  const handleSubmit = async () => {
    if (!walletAddress) { await connectWallet(); return; }

    const links = form.sourceLinks
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    try {
      const id = await submitDecision({
        title: form.title,
        summary: form.summary,
        proposedAction: form.proposedAction,
        rationale: form.rationale,
        targetGroup: form.targetGroup,
        decisionType: form.decisionType,
        sourceLinks: links,
        reviewDeadline: form.reviewDeadline
          ? Math.floor(new Date(form.reviewDeadline).getTime() / 1000)
          : Math.floor(Date.now() / 1000) + 7 * 86400,
      });
      setNewDecisionId(id);
      setSubmitted(true);
    } catch {
      // txState already set to failed by AppContext
    }
  };

  if (submitted) {
    return (
      <div className="grid-bg min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-sky-400/40 bg-sky-400/10 flex items-center justify-center">
            <span className="text-sky-400 text-2xl">⬡</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">
              Decision Packet Sent to Shadow Review
            </h2>
            <p className="text-slate-500 text-sm">
              Your decision has been placed in the shadow chamber. Community members can now add shadow claims before you request GenLayer review.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push(`/decision/${newDecisionId}`)}
              className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-colors"
            >
              View Decision
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Shadow Chamber
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Submit Decision</h1>
          <p className="text-slate-500 text-sm">Place a decision into the shadow analysis chamber.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  i === step
                    ? "bg-sky-400/10 text-sky-400 border border-sky-400/30"
                    : i < step
                    ? "text-green-400 cursor-pointer"
                    : "text-slate-600 cursor-default"
                )}
              >
                <span>{i < step ? "✓" : i + 1}</span>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="mx-1 text-slate-800 text-xs">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="p-6 rounded-2xl border border-slate-800/60 bg-[#111827]/60 mb-6">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-slate-100 font-semibold">Decision Identity</h2>
              <Field label="Decision title *">
                <input className={inputCls} value={form.title} onChange={set("title")} placeholder="Redirect 60% of grants budget to core infrastructure" />
              </Field>
              <Field label="Decision type *">
                <select className={inputCls} value={form.decisionType} onChange={set("decisionType")}>
                  {DECISION_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Summary *">
                <textarea className={inputCls} rows={3} value={form.summary} onChange={set("summary")} placeholder="A concise description of what the decision is." />
              </Field>
              <Field label="Target community or organisation *">
                <input className={inputCls} value={form.targetGroup} onChange={set("targetGroup")} placeholder="DAO community, grant applicants, core contributors" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-slate-100 font-semibold">Proposed Action</h2>
              <Field label="What exactly will happen? *">
                <textarea className={inputCls} rows={5} value={form.proposedAction} onChange={set("proposedAction")} placeholder="Describe the specific change, action, or policy that will be implemented." />
              </Field>
              <Field label="Intended beneficiaries">
                <input className={inputCls} value={form.intendedBeneficiaries} onChange={set("intendedBeneficiaries")} placeholder="Who is this decision primarily designed to help?" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-slate-100 font-semibold">Rationale & Intended Upside</h2>
              <Field label="Why is this decision being made? *">
                <textarea className={inputCls} rows={4} value={form.rationale} onChange={set("rationale")} placeholder="Explain the reasoning, evidence, and expected benefits." />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-slate-100 font-semibold">Known Risks</h2>
              <p className="text-slate-500 text-sm">List the risks you already know about. This helps validators focus on what you may have missed.</p>
              <Field label="Known risks">
                <textarea className={inputCls} rows={4} value={form.knownRisks} onChange={set("knownRisks")} placeholder="Risks you are already aware of, and how you plan to handle them." />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-slate-100 font-semibold">Public Evidence Links</h2>
              <p className="text-slate-500 text-sm">Add publicly accessible URLs validators can reference. One URL per line. No login-gated links.</p>
              <Field label="Source links (one per line)">
                <textarea className={inputCls} rows={4} value={form.sourceLinks} onChange={set("sourceLinks")} placeholder={"https://forum.example.org/proposal/123\nhttps://github.com/example/issue/456"} />
              </Field>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-slate-100 font-semibold">Review Settings</h2>
              <Field label="Review deadline">
                <input type="date" className={inputCls} value={form.reviewDeadline} onChange={set("reviewDeadline")} />
              </Field>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-slate-100 font-semibold">Decision Packet Preview</h2>
              <p className="text-slate-500 text-sm">This is what GenLayer validators will assess.</p>
              <div className="space-y-3 text-sm">
                <PreviewRow label="Title" value={form.title} />
                <PreviewRow label="Type" value={form.decisionType.replace(/_/g, " ")} />
                <PreviewRow label="Target group" value={form.targetGroup} />
                <PreviewRow label="Summary" value={form.summary} />
                <PreviewRow label="Proposed action" value={form.proposedAction} />
                <PreviewRow label="Rationale" value={form.rationale} />
                {form.knownRisks && <PreviewRow label="Known risks" value={form.knownRisks} />}
                {form.sourceLinks && <PreviewRow label="Source links" value={form.sourceLinks} />}
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-sm disabled:opacity-30 transition-colors"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="px-5 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-sm disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-colors"
            >
              {walletAddress ? "Submit Decision" : "Connect Wallet & Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <span className="text-slate-600 shrink-0">{label}</span>
      <span className="text-slate-300 break-words">{value}</span>
    </div>
  );
}

const inputCls =
  "w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-sky-400/40 transition-colors";
