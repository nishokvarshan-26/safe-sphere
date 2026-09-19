"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Provenance, Severity } from "@/lib/types";

const buttonVariants = cva(
  "inline-flex h-8 items-center justify-center gap-2 border px-3 font-mono text-[10px] font-semibold uppercase tracking-[.08em] transition-all disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "border-signal bg-signal text-ink hover:bg-[#c5ff70]",
        outline: "border-[#3a3f3a] bg-transparent text-bone hover:border-[#646b63] hover:bg-[#151815]",
        ghost: "border-transparent text-muted hover:bg-[#151815] hover:text-bone",
        danger: "border-danger/50 bg-danger/10 text-danger hover:bg-danger/20"
      },
      size: { sm: "h-7 px-2 text-[9px]", default: "h-8 px-3", lg: "h-10 px-4" }
    },
    defaultVariants: { variant: "outline", size: "default" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";

export function ProvenanceBadge({ type, className }: { type: Provenance; className?: string }) {
  const styles: Record<Provenance, string> = {
    LIVE: "border-signal/40 bg-signal/10 text-signal",
    HISTORICAL: "border-[#5d655e] bg-[#5d655e]/10 text-[#b8bdb6]",
    DERIVED: "border-amber/40 bg-amber/10 text-amber",
    SIMULATION: "border-[#8f78c9]/50 bg-[#8f78c9]/10 text-[#bba8ea]"
  };
  return <span className={cn("inline-flex h-5 items-center border px-1.5 font-mono text-[8px] font-semibold tracking-[.12em]", styles[type], className)}>{type}</span>;
}

export function StatusBadge({ status, label }: { status: Severity; label?: string }) {
  const styles: Record<Severity, string> = {
    healthy: "bg-signal/10 text-signal before:bg-signal",
    notice: "bg-[#9ea6a0]/10 text-[#b6bbb6] before:bg-[#9ea6a0]",
    warning: "bg-amber/10 text-amber before:bg-amber",
    critical: "bg-danger/10 text-danger before:bg-danger"
  };
  return <span className={cn("inline-flex h-5 items-center gap-1.5 px-2 font-mono text-[9px] font-semibold uppercase before:h-1 before:w-1", styles[status])}>{label ?? status}</span>;
}

export function Panel({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("panel min-w-0", className)}>{children}</section>;
}

export function PanelHeader({ title, meta, action }: { title: string; meta?: string; action?: React.ReactNode }) {
  return <div className="panel-head"><div className="flex items-center gap-2"><span className="eyebrow text-[#c9ccc5]">{title}</span>{meta && <span className="font-mono text-[9px] text-[#5f655f]">{meta}</span>}</div>{action}</div>;
}

export function Metric({ label, value, detail, type, tone }: { label: string; value: React.ReactNode; detail?: React.ReactNode; type?: Provenance; tone?: "green" | "amber" | "red" }) {
  return <div className="min-h-[82px] border border-line bg-panel px-3 py-2.5">
    <div className="flex items-start justify-between gap-2"><span className="eyebrow">{label}</span>{type && <ProvenanceBadge type={type} />}</div>
    <div className={cn("mt-2 font-mono text-xl tracking-[-.04em] text-bone", tone === "green" && "text-signal", tone === "amber" && "text-amber", tone === "red" && "text-danger")}>{value}</div>
    {detail && <div className="mt-1 truncate font-mono text-[9px] text-muted">{detail}</div>}
  </div>;
}

export function DataUnavailable({ label = "LIVE SOURCE UNAVAILABLE", compact = false }: { label?: string; compact?: boolean }) {
  return <div className={cn("flex items-center justify-center border border-dashed border-[#303530] bg-[#0a0c0b] text-center", compact ? "min-h-16 p-2" : "min-h-40 p-6")}>
    <div><div className="font-mono text-[10px] font-semibold tracking-[.14em] text-[#8e958e]">{label}</div>{!compact && <p className="mt-2 max-w-sm text-[11px] leading-5 text-muted">Monitoring remains available in historical and replay mode. Configure a source in Settings to enable this panel.</p>}</div>
  </div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-[#1a1e1b]", className)} />;
}

export function SourceFooter({ source, type, updated }: { source: string; type: Provenance; updated?: string }) {
  return <div className="flex min-h-7 flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-3 py-1 font-mono text-[8px] uppercase tracking-wider text-[#686e68]">
    <span>Source: <b className="font-medium text-[#9ba09a]">{source}</b></span>
    <span>Type: <b className="font-medium text-[#9ba09a]">{type}</b></span>
    {updated && <span>Updated: <b className="font-medium text-[#9ba09a]">{updated}</b></span>}
  </div>;
}
