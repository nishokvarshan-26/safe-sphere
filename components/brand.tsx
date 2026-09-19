import { cn } from "@/lib/utils";

export function SphereMark({ className }: { className?: string }) {
  return <span className={cn("relative inline-block h-5 w-5 rounded-full border border-current", className)} aria-hidden>
    <span className="absolute left-1/2 top-[-1px] h-[20px] w-[8px] -translate-x-1/2 rounded-[50%] border-x border-current opacity-70" />
    <span className="absolute left-[2px] right-[2px] top-1/2 border-t border-current opacity-70" />
  </span>;
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return <span className="inline-flex items-center gap-2.5"><SphereMark className="text-signal" /><span className="font-mono text-[12px] font-bold tracking-[.18em] text-bone">SAFE {compact ? "" : "SPHERE"}</span></span>;
}
