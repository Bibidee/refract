# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from datetime import datetime, timezone
import json


class DecisionShadowTracker(gl.Contract):
    # All complex records serialised as JSON strings — GenVM requires
    # storage types to be primitives or valid GenVM generics (DynArray/TreeMap).
    decisions: TreeMap[str, str]           # decision_id  -> JSON string
    shadow_claims: TreeMap[str, str]       # claim_id     -> JSON string
    shadow_reports: TreeMap[str, str]      # report_id    -> JSON string
    decision_ids: DynArray[str]            # insertion-ordered list of decision IDs
    decision_claim_ids: TreeMap[str, str]  # decision_id  -> JSON array of claim IDs
    owner: str

    def __init__(self) -> None:
        self.owner = str(gl.message.sender_address)

    # ─── Helpers ─────────────────────────────────────────────────────

    def _sender(self) -> str:
        return str(gl.message.sender_address)

    def _next_id(self, prefix: str) -> str:
        raw = f"{prefix}:{self._sender()}:{int(datetime.now(timezone.utc).timestamp())}"
        return str(abs(hash(raw)))

    def _get_claim_ids(self, decision_id: str) -> list:
        raw = self.decision_claim_ids.get(decision_id, "[]")
        return json.loads(raw)

    def _set_claim_ids(self, decision_id: str, ids: list) -> None:
        self.decision_claim_ids[decision_id] = json.dumps(ids)

    # ─── View functions ───────────────────────────────────────────────

    @gl.public.view
    def read_decision(self, decision_id: str) -> str:
        result = self.decisions.get(decision_id, "")
        assert result != "", f"Decision {decision_id} not found"
        return result

    @gl.public.view
    def read_shadow_report(self, report_id: str) -> str:
        result = self.shadow_reports.get(report_id, "")
        assert result != "", f"Report {report_id} not found"
        return result

    @gl.public.view
    def list_decisions(self) -> str:
        items = []
        for did in self.decision_ids:
            raw = self.decisions.get(did, "")
            if raw == "":
                continue
            d = json.loads(raw)
            items.append({
                "decision_id": d["decision_id"],
                "title": d["title"],
                "author": d["author"],
                "decision_type": d["decision_type"],
                "status": d["status"],
                "created_at": d["created_at"],
                "shadow_report_id": d.get("shadow_report_id"),
            })
        return json.dumps(items)

    @gl.public.view
    def list_shadow_claims(self, decision_id: str) -> str:
        claim_ids = self._get_claim_ids(decision_id)
        result = []
        for cid in claim_ids:
            raw = self.shadow_claims.get(cid, "")
            if raw != "":
                result.append(json.loads(raw))
        return json.dumps(result)

    # ─── Write functions ──────────────────────────────────────────────

    @gl.public.write
    def submit_decision(
        self,
        title: str,
        summary: str,
        proposed_action: str,
        rationale: str,
        target_group: str,
        decision_type: str,
        source_links: str,   # JSON-encoded list of URLs
        review_deadline: u64,
    ) -> str:
        allowed_types = [
            "dao_vote", "protocol_upgrade", "treasury_allocation",
            "policy_change", "community_rule", "partnership",
            "grant_decision", "moderation_action", "product_launch",
            "nonprofit_decision", "other",
        ]
        assert title.strip() != "", "Title cannot be empty"
        assert len(summary.strip()) > 10, "Summary must be meaningful"
        assert decision_type in allowed_types, f"Invalid decision_type: {decision_type}"

        decision_id = self._next_id("decision")
        now = int(datetime.now(timezone.utc).timestamp())

        record = {
            "decision_id": decision_id,
            "author": self._sender(),
            "title": title,
            "summary": summary,
            "proposed_action": proposed_action,
            "rationale": rationale,
            "target_group": target_group,
            "decision_type": decision_type,
            "status": "submitted",
            "created_at": now,
            "review_deadline": review_deadline,
            "source_links": source_links,
            "shadow_report_id": None,
            "revision": None,
        }

        self.decisions[decision_id] = json.dumps(record)
        self.decision_ids.append(decision_id)
        self._set_claim_ids(decision_id, [])
        return decision_id

    @gl.public.write
    def add_shadow_claim(
        self,
        decision_id: str,
        shadow_category: str,
        affected_party: str,
        claim_summary: str,
        supporting_evidence: str,   # JSON-encoded list of URLs
        severity_claimed: str,
    ) -> str:
        allowed_categories = [
            "stakeholder_harm", "coordination_drag", "reputational_effect",
            "incentive_distortion", "long_term_lock_in", "governance_precedent",
            "emotional_backlash", "trust_erosion", "operational_burden",
            "minority_group_impact", "cost_externalisation",
            "legal_or_compliance_risk", "strategic_misalignment",
            "implementation_ambiguity", "other",
        ]
        allowed_severities = ["low", "medium", "high", "critical", "unclear"]

        raw_decision = self.decisions.get(decision_id, "")
        assert raw_decision != "", "Decision not found"
        decision = json.loads(raw_decision)
        assert decision["status"] != "archived", "Cannot add claims to an archived decision"
        assert shadow_category in allowed_categories, f"Invalid category: {shadow_category}"
        assert severity_claimed in allowed_severities, f"Invalid severity: {severity_claimed}"

        claim_id = self._next_id("claim")
        now = int(datetime.now(timezone.utc).timestamp())

        claim = {
            "claim_id": claim_id,
            "decision_id": decision_id,
            "submitter": self._sender(),
            "shadow_category": shadow_category,
            "affected_party": affected_party,
            "claim_summary": claim_summary,
            "supporting_evidence": supporting_evidence,
            "severity_claimed": severity_claimed,
            "created_at": now,
        }

        self.shadow_claims[claim_id] = json.dumps(claim)

        ids = self._get_claim_ids(decision_id)
        ids.append(claim_id)
        self._set_claim_ids(decision_id, ids)

        if decision["status"] == "submitted":
            decision["status"] = "challenged"
            self.decisions[decision_id] = json.dumps(decision)

        return claim_id

    @gl.public.write
    def request_shadow_review(self, decision_id: str) -> None:
        raw_decision = self.decisions.get(decision_id, "")
        assert raw_decision != "", "Decision not found"
        decision = json.loads(raw_decision)
        assert decision["status"] in ["submitted", "challenged", "updated_after_review"], \
            "Decision must be submitted, challenged, or updated_after_review"

        # Collect community shadow claims
        claim_ids = self._get_claim_ids(decision_id)
        claims_data = []
        for cid in claim_ids:
            raw = self.shadow_claims.get(cid, "")
            if raw != "":
                c = json.loads(raw)
                claims_data.append({
                    "category": c["shadow_category"],
                    "affected_party": c["affected_party"],
                    "summary": c["claim_summary"],
                    "severity_claimed": c["severity_claimed"],
                })

        # Build packet to pass into the nondet block (copy all needed data
        # to local variables — do not access self.* inside nondet)
        packet = {
            "decision": {
                "title": decision["title"],
                "summary": decision["summary"],
                "proposed_action": decision["proposed_action"],
                "rationale": decision["rationale"],
                "target_group": decision["target_group"],
                "decision_type": decision["decision_type"],
                "source_links": decision["source_links"],
            },
            "community_shadow_claims": claims_data,
        }
        packet_json = json.dumps(packet)

        def analyze() -> str:
            prompt = f"""You are a decision shadow analyst. Analyse this governance decision and surface hidden side effects.
Do NOT recommend pass/fail. Be concise — all string values must be under 120 characters.

Decision packet:
{packet_json}

Return ONLY valid JSON, no markdown or code fences. Use exactly this structure:
{{
  "overall_shadow_level": "minimal|moderate|significant|severe|uncertain",
  "decision_readiness": "ready_with_minor_notes|needs_clarification|needs_mitigation_plan|high_risk_without_revision|insufficient_information",
  "summary": "one sentence, max 120 chars",
  "primary_shadows": [
    {{
      "category": "stakeholder_harm|coordination_drag|reputational_effect|incentive_distortion|long_term_lock_in|governance_precedent|emotional_backlash|trust_erosion|operational_burden|minority_group_impact|cost_externalisation|legal_or_compliance_risk|strategic_misalignment|implementation_ambiguity|other",
      "title": "max 60 chars",
      "description": "max 120 chars",
      "affected_groups": ["max 3 groups"],
      "severity": "low|medium|high|critical|unclear",
      "likelihood": "unlikely|possible|likely|highly_likely|uncertain",
      "time_horizon": "immediate|short_term|medium_term|long_term|unknown",
      "evidence_basis": "proposal_text|source_link|community_claim|inference",
      "confidence": 0.75
    }}
  ],
  "affected_groups": ["max 5 groups, each under 60 chars"],
  "blind_spots": ["max 3 items, each under 100 chars"],
  "tradeoffs": [
    {{
      "benefit": "max 80 chars",
      "cost": "max 80 chars",
      "who_benefits": ["max 2 groups"],
      "who_pays": ["max 2 groups"]
    }}
  ],
  "mitigation_suggestions": ["max 3 items, each under 100 chars"],
  "questions_before_vote": ["max 3 items, each under 100 chars"],
  "consensus_notes": "max 120 chars"
}}
Return at most 5 primary_shadows and 3 tradeoffs. Keep every string short."""
            res = gl.nondet.exec_prompt(prompt)
            backticks = "``" + "`"
            res = res.replace(backticks + "json", "").replace(backticks, "").strip()
            parsed = json.loads(res)
            return json.dumps(parsed)

        # Both leader and validators independently run analyze().
        # Equivalence principle compares verdict fields — not exact wording.
        report_json = gl.eq_principle.prompt_comparative(
            analyze,
            "Compare only the verdict fields, not descriptions or wording. "
            "1. overall_shadow_level must be the SAME value or one adjacent step "
            "(minimal<->moderate<->significant<->severe; uncertain matches any). "
            "2. decision_readiness must be the SAME value or one adjacent step "
            "(ready_with_minor_notes<->needs_clarification<->needs_mitigation_plan"
            "<->high_risk_without_revision; insufficient_information matches any). "
            "3. At least half of the primary_shadows categories must overlap "
            "(e.g. if one has 4 categories, at least 2 must appear in the other). "
            "Descriptions, titles, affected_groups wording, tradeoff text, and "
            "other free-text fields may differ freely. "
            "If verdicts and category overlap meet these thresholds, they are equivalent.",
        )

        # All storage writes happen OUTSIDE the nondet block
        report_id = self._next_id("report")
        now = int(datetime.now(timezone.utc).timestamp())

        # Strip markdown fences if present
        backticks = "``" + "`"
        report_json = report_json.replace(backticks + "json", "").replace(backticks, "").strip()
        report = json.loads(report_json)
        report["report_id"] = report_id
        report["decision_id"] = decision_id
        report["created_at"] = now

        self.shadow_reports[report_id] = json.dumps(report)

        decision["shadow_report_id"] = report_id
        decision["status"] = "shadow_review_complete"
        self.decisions[decision_id] = json.dumps(decision)

    @gl.public.write
    def update_decision_after_review(
        self,
        decision_id: str,
        revised_summary: str,
        revised_action: str,
        mitigation_notes: str,
    ) -> None:
        raw_decision = self.decisions.get(decision_id, "")
        assert raw_decision != "", "Decision not found"
        decision = json.loads(raw_decision)
        assert self._sender() == decision["author"], "Only the author can revise"

        decision["revision"] = {
            "revised_summary": revised_summary,
            "revised_action": revised_action,
            "mitigation_notes": mitigation_notes,
            "revised_at": int(datetime.now(timezone.utc).timestamp()),
        }
        decision["status"] = "updated_after_review"
        self.decisions[decision_id] = json.dumps(decision)

    @gl.public.write
    def archive_decision(self, decision_id: str) -> None:
        raw_decision = self.decisions.get(decision_id, "")
        assert raw_decision != "", "Decision not found"
        decision = json.loads(raw_decision)
        sender = self._sender()
        assert sender == decision["author"] or sender == self.owner, \
            "Only the author or contract owner can archive"
        decision["status"] = "archived"
        self.decisions[decision_id] = json.dumps(decision)
