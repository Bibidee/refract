import { cn, readinessColor, formatReadiness } from "@/lib/utils";
import type { DecisionReadiness } from "@/lib/types";

export function ReadinessBadge({ readiness, large }: { readiness: DecisionReadiness; large?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full",
        readinessColor(readiness),
        large ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"
      )}
    >
      {formatReadiness(readiness)}
    </span>
  );
}
