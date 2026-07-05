import { cn, shadowLevelColor, formatShadowLevel } from "@/lib/utils";
import type { ShadowLevel } from "@/lib/types";

export function ShadowLevelBadge({ level, large }: { level: ShadowLevel; large?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold border rounded-full",
        shadowLevelColor(level),
        large ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {formatShadowLevel(level)} Shadow
    </span>
  );
}
