import Link from "next/link";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Submit a Decision",
    body: "Place a governance choice, policy change, or strategic move into the shadow chamber. Describe the intent, rationale, and known risks.",
    color: "border-sky-400/30 bg-sky-400/5",
  },
  {
    step: "02",
    title: "Surface Shadow Claims",
    body: "Community members add suspected hidden consequences — overlooked stakeholders, incentive distortions, reputational risks. Claims are inputs, not verdicts.",
    color: "border-amber-400/30 bg-amber-400/5",
  },
  {
    step: "03",
    title: "GenLayer Validator Review",
    body: "GenLayer validators independently analyse the decision packet and reach consensus on a structured shadow map using the Equivalence Principle.",
    color: "border-violet-400/30 bg-violet-400/5",
  },
  {
    step: "04",
    title: "Read the Shadow Map",
    body: "The consensus report reveals affected groups, tradeoffs, blind spots, and mitigation suggestions — before the community votes or acts.",
    color: "border-green-400/30 bg-green-400/5",
  },
];

const USE_CASES = [
  "DAO treasury allocations",
  "Protocol upgrade decisions",
  "Community rule changes",
  "Grant committee reviews",
  "Partnership approvals",
  "Moderation policy changes",
  "Nonprofit board decisions",
  "Product council choices",
  "Strategy team pivots",
];

const SHADOW_CATEGORIES = [
  { label: "Stakeholder Harm", color: "text-red-400" },
  { label: "Governance Precedent", color: "text-violet-400" },
  { label: "Trust Erosion", color: "text-red-400" },
  { label: "Incentive Distortion", color: "text-amber-400" },
  { label: "Coordination Drag", color: "text-amber-400" },
  { label: "Long-Term Lock-In", color: "text-sky-400" },
  { label: "Minority Group Impact", color: "text-red-400" },
  { label: "Cost Externalisation", color: "text-amber-400" },
];

export default function LandingPage() {
  return (
    <div className="grid-bg min-h-screen">
      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-400/20 bg-sky-400/5 text-sky-400 text-xs mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          Powered by GenLayer Intelligent Contracts
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-50 leading-tight mb-6">
          Every decision<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
            casts a shadow.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed mb-4">
          Refract reveals the hidden consequences, affected groups, and tradeoffs behind governance choices before they become irreversible.
        </p>
        <p className="max-w-xl mx-auto text-slate-500 text-sm leading-relaxed mb-10">
          Submit a proposal, gather shadow claims, and let GenLayer validators produce a non-deterministic impact map across incentives, trust, coordination, reputation, and long-term effects.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-colors shadow-lg shadow-sky-500/20"
          >
            Enter Shadow Chamber
          </Link>
          <Link
            href="/submit"
            className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 text-sm transition-colors"
          >
            Submit a Decision
          </Link>
        </div>
      </section>

      {/* What are decision shadows */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-3">What are decision shadows?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
            A shadow is what a decision affects that the proposal does not acknowledge. Governance failures rarely come from bad intentions — they come from invisible second-order effects.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SHADOW_CATEGORIES.map(({ label, color }) => (
            <div
              key={label}
              className="p-4 rounded-xl border border-slate-800/60 bg-[#111827]/60 text-center"
            >
              <span className={`text-sm font-medium ${color}`}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-100 mb-10 text-center">How it works</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map(({ step, title, body, color }) => (
            <div key={step} className={`p-6 rounded-xl border ${color}`}>
              <div className="text-xs font-mono text-slate-600 mb-2">{step}</div>
              <h3 className="text-slate-100 font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 text-center">Built for governance at every scale</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {USE_CASES.map((uc) => (
            <span
              key={uc}
              className="px-4 py-2 rounded-full border border-slate-800/60 bg-[#111827]/60 text-slate-400 text-sm"
            >
              {uc}
            </span>
          ))}
        </div>
      </section>

      {/* Why GenLayer */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="p-8 rounded-2xl border border-slate-800/60 bg-[#111827]/60">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Why GenLayer?</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Normal smart contracts are deterministic — they can check quorums, thresholds, and deadlines. But governance decisions require judgment: who is affected, what second-order effects may emerge, which tradeoffs are hidden.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            GenLayer Intelligent Contracts use AI-validator consensus to interpret language, process unstructured decision data, and produce structured shadow maps through the Equivalence Principle — without requiring identical text from every validator.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            The result is a governance companion that makes hidden consequences visible before decisions become irreversible.
          </p>
        </div>
      </section>

      {/* Example shadow map preview */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 text-center">Example shadow map</h2>
        <div className="p-6 rounded-2xl border border-slate-800/60 bg-[#111827]/60 space-y-5">
          <div>
            <p className="text-xs text-slate-600 mb-1">Decision</p>
            <p className="text-slate-200 text-sm">Redirect 60% of community grants budget to core infrastructure for six months.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-600 mb-1">Overall shadow level</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border text-orange-400 border-orange-400/40 bg-orange-400/10">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Significant
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Decision readiness</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border text-amber-400 border-amber-400/40 bg-amber-400/10">
                Needs Mitigation Plan
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-2">Primary shadows identified</p>
            <div className="space-y-2">
              {[
                "Contributor diversity may decline as experimental builders lose entry points.",
                "The DAO may create a precedent where infrastructure always outranks community creativity.",
                "Non-core contributors may interpret the move as centralisation.",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-amber-400 mt-0.5">▪</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">See the shadow before you step into it.</h2>
        <p className="text-slate-500 mb-8 text-sm">Submit your first decision for shadow review.</p>
        <Link
          href="/submit"
          className="inline-flex px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-colors shadow-lg shadow-sky-500/20"
        >
          Surface Hidden Effects
        </Link>
      </section>
    </div>
  );
}
