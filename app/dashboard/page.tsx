"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/AppContext";
import { DecisionCard } from "@/components/decisions/DecisionCard";
import type { DecisionStatus } from "@/lib/types";

const FILTERS: { label: string; value: "all" | DecisionStatus }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Challenged", value: "challenged" },
  { label: "Under Review", value: "shadow_review_requested" },
  { label: "Reviewed", value: "shadow_review_complete" },
  { label: "Revised", value: "updated_after_review" },
  { label: "Archived", value: "archived" },
];

export default function DashboardPage() {
  const { decisions } = useApp();
  const [filter, setFilter] = useState<"all" | DecisionStatus>("all");

  const filtered =
    filter === "all"
      ? decisions.filter((d) => d.status !== "archived")
      : decisions.filter((d) => d.status === filter);

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Shadow Chamber</h1>
            <p className="text-slate-500 text-sm mt-1">
              Decisions under shadow review — governance choices mapped for hidden consequences.
            </p>
          </div>
          <Link
            href="/submit"
            className="shrink-0 px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm hover:bg-sky-500/20 transition-colors"
          >
            + Submit Decision
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === value
                  ? "bg-sky-400/10 text-sky-400 border border-sky-400/30"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Decision grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-slate-800/60 rounded-2xl bg-[#111827]/40">
            <p className="text-slate-400 font-medium mb-2">
              {filter === "all"
                ? "No decisions have entered the shadow chamber yet."
                : `No decisions with status: ${filter.replace(/_/g, " ")}.`}
            </p>
            <p className="text-slate-600 text-sm mb-6">
              Submit a governance choice, policy change, or strategic move to reveal what may be hidden around it.
            </p>
            <Link
              href="/submit"
              className="px-5 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm hover:bg-sky-500/20 transition-colors"
            >
              Submit First Decision
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((d) => (
              <DecisionCard key={d.decisionId} decision={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
