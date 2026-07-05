"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Decision, ShadowClaim, ShadowReport, TxState } from "@/lib/types";
import {
  fetchDecisions,
  fetchShadowClaims,
  fetchShadowReport,
  submitDecision as contractSubmitDecision,
  addShadowClaim as contractAddShadowClaim,
  requestShadowReview as contractRequestReview,
  updateDecisionAfterReview as contractReviseDecision,
  archiveDecision as contractArchiveDecision,
} from "@/lib/genlayer/contract";
import {
  connectInjectedWallet,
} from "@/lib/wallet/injected";
import { setClientFromAddress, clearClient } from "@/lib/genlayer/client";
import { CONTRACT_ADDRESS } from "@/lib/genlayer/config";

interface AppState {
  decisions: Decision[];
  claims: ShadowClaim[];
  reports: ShadowReport[];
  walletAddress: string | null;
  txState: TxState;
  txMessage: string;
  contractAddress: string;
  chainLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getDecision: (id: string) => Decision | undefined;
  getReport: (id: string) => ShadowReport | undefined;
  getClaimsForDecision: (id: string) => ShadowClaim[];
  refreshDecisions: () => Promise<void>;
  refreshDecision: (id: string) => Promise<void>;
  submitDecision: (params: SubmitDecisionParams) => Promise<string>;
  addClaim: (params: AddClaimParams) => Promise<void>;
  requestReview: (decisionId: string) => Promise<void>;
  reviseDecision: (params: ReviseParams) => Promise<void>;
  archiveDecision: (id: string) => Promise<void>;
  setTxState: (s: TxState, msg?: string) => void;
}

export interface SubmitDecisionParams {
  title: string;
  summary: string;
  proposedAction: string;
  rationale: string;
  targetGroup: string;
  decisionType: string;
  sourceLinks: string[];
  reviewDeadline: number;
}

export interface AddClaimParams {
  decisionId: string;
  shadowCategory: string;
  affectedParty: string;
  claimSummary: string;
  supportingEvidence: string[];
  severityClaimed: string;
}

export interface ReviseParams {
  decisionId: string;
  revisedSummary: string;
  revisedAction: string;
  mitigationNotes: string;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [claims, setClaims] = useState<ShadowClaim[]>([]);
  const [reports, setReports] = useState<ShadowReport[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [txState, setTxStateRaw] = useState<TxState>("idle");
  const [txMessage, setTxMessage] = useState("");
  const [chainLoading, setChainLoading] = useState(true);

  const setTxState = useCallback((s: TxState, msg = "") => {
    setTxStateRaw(s);
    setTxMessage(msg);
  }, []);

  // Restore wallet session on mount without prompting the user
  useEffect(() => {
    const restore = async () => {
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
          if (accounts && accounts.length > 0) {
            setClientFromAddress(accounts[0] as `0x${string}`);
            setWalletAddress(accounts[0]);
            localStorage.setItem("refract_wallet", accounts[0]);
            return;
          }
        }
        // Fallback: restore from localStorage (e.g. demo address)
        const saved = localStorage.getItem("refract_wallet");
        if (saved) {
          setClientFromAddress(saved as `0x${string}`);
          setWalletAddress(saved);
        }
      } catch {
        // Silent — user will connect manually
      }
    };
    restore();
  }, []);

  // Load decisions from chain on mount
  const refreshDecisions = useCallback(async () => {
    try {
      const chainDecisions = await fetchDecisions();
      if (chainDecisions.length > 0) {
        setDecisions(chainDecisions);
      }
    } catch (e) {
      console.warn("[Refract] Could not load decisions from chain.", e);
    } finally {
      setChainLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDecisions();
  }, [refreshDecisions]);

  // Reload a single decision + its claims + report from chain
  const refreshDecision = useCallback(async (id: string) => {
    try {
      const { fetchDecision } = await import("@/lib/genlayer/contract");
      const updated = await fetchDecision(id);
      setDecisions((prev) => prev.map((d) => (d.decisionId === id ? updated : d)));

      const updatedClaims = await fetchShadowClaims(id);
      setClaims((prev) => [
        ...prev.filter((c) => c.decisionId !== id),
        ...updatedClaims,
      ]);

      if (updated.shadowReportId) {
        const report = await fetchShadowReport(updated.shadowReportId);
        setReports((prev) => {
          const without = prev.filter((r) => r.reportId !== report.reportId);
          return [...without, report];
        });
      }
    } catch (e) {
      console.warn("[Refract] refreshDecision failed:", e);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const address = await connectInjectedWallet();
      setClientFromAddress(address);
      setWalletAddress(address);
      localStorage.setItem("refract_wallet", address);
    } catch {
      // Demo fallback — no real wallet
      const demo = "0xDemo000000000000000000000000000000000001" as `0x${string}`;
      setClientFromAddress(demo);
      setWalletAddress(demo);
      localStorage.setItem("refract_wallet", demo);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    clearClient();
    setWalletAddress(null);
    localStorage.removeItem("refract_wallet");
  }, []);

  const getDecision = useCallback(
    (id: string) => decisions.find((d) => d.decisionId === id),
    [decisions]
  );

  const getReport = useCallback(
    (id: string) => reports.find((r) => r.reportId === id),
    [reports]
  );

  const getClaimsForDecision = useCallback(
    (id: string) => claims.filter((c) => c.decisionId === id),
    [claims]
  );

  const submitDecision = useCallback(
    async (params: SubmitDecisionParams): Promise<string> => {
      setTxState("preparing", "Building decision packet…");
      try {
        // Snapshot existing IDs before submission so we can diff after
        const beforeIds = new Set(
          (await fetchDecisions()).map((d) => d.decisionId)
        );
        setTxState("wallet_confirmation", "Confirm in your wallet");
        await contractSubmitDecision(params);
        setTxState("waiting", "Waiting for GenLayer finality…");
        await refreshDecisions();
        setTxState("confirmed", "Decision submitted");
        setTimeout(() => setTxState("idle"), 3000);
        // Find the newly created decision by diffing against the pre-submit snapshot
        const fresh = await fetchDecisions();
        const newDecision = fresh.find((d) => !beforeIds.has(d.decisionId));
        return newDecision?.decisionId ?? fresh[fresh.length - 1]?.decisionId ?? "";
      } catch (e) {
        setTxState("failed", (e as Error).message);
        setTimeout(() => setTxState("idle"), 4000);
        throw e;
      }
    },
    [refreshDecisions, setTxState]
  );

  const addClaim = useCallback(
    async (params: AddClaimParams) => {
      setTxState("preparing", "Preparing shadow claim…");
      try {
        setTxState("wallet_confirmation", "Confirm in your wallet");
        await contractAddShadowClaim(params);
        setTxState("waiting", "Waiting for GenLayer finality…");
        await refreshDecision(params.decisionId);
        setTxState("confirmed", "Shadow claim submitted");
        setTimeout(() => setTxState("idle"), 3000);
      } catch (e) {
        setTxState("failed", (e as Error).message);
        setTimeout(() => setTxState("idle"), 4000);
        throw e;
      }
    },
    [refreshDecision, setTxState]
  );

  const requestReview = useCallback(
    async (decisionId: string) => {
      setTxState("preparing", "Building decision packet for validators…");
      try {
        setTxState("wallet_confirmation", "Confirm in your wallet");
        await contractRequestReview(decisionId);
        setTxState("waiting", "GenLayer validators are analysing the decision…");
        await refreshDecision(decisionId);
        setTxState("confirmed", "Shadow review complete");
        setTimeout(() => setTxState("idle"), 3000);
      } catch (e) {
        setTxState("failed", (e as Error).message);
        setTimeout(() => setTxState("idle"), 4000);
        throw e;
      }
    },
    [refreshDecision, setTxState]
  );

  const reviseDecision = useCallback(
    async (params: ReviseParams) => {
      setTxState("preparing", "Submitting revision…");
      try {
        setTxState("wallet_confirmation", "Confirm in your wallet");
        await contractReviseDecision(params);
        setTxState("waiting", "Waiting for GenLayer finality…");
        await refreshDecision(params.decisionId);
        setTxState("confirmed", "Decision revised");
        setTimeout(() => setTxState("idle"), 3000);
      } catch (e) {
        setTxState("failed", (e as Error).message);
        setTimeout(() => setTxState("idle"), 4000);
        throw e;
      }
    },
    [refreshDecision, setTxState]
  );

  const archiveDecision = useCallback(
    async (id: string) => {
      setTxState("preparing", "Archiving decision…");
      try {
        setTxState("wallet_confirmation", "Confirm in your wallet");
        await contractArchiveDecision(id);
        setTxState("waiting", "Waiting for GenLayer finality…");
        await refreshDecision(id);
        setTxState("confirmed", "Decision archived");
        setTimeout(() => setTxState("idle"), 3000);
      } catch (e) {
        setTxState("failed", (e as Error).message);
        setTimeout(() => setTxState("idle"), 4000);
        throw e;
      }
    },
    [refreshDecision, setTxState]
  );

  return (
    <AppContext.Provider
      value={{
        decisions,
        claims,
        reports,
        walletAddress,
        txState,
        txMessage,
        contractAddress: CONTRACT_ADDRESS,
        chainLoading,
        connectWallet,
        disconnectWallet,
        getDecision,
        getReport,
        getClaimsForDecision,
        refreshDecisions,
        refreshDecision,
        submitDecision,
        addClaim,
        requestReview,
        reviseDecision,
        archiveDecision,
        setTxState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
