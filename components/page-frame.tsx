"use client";

import { RefreshCw } from "lucide-react";
import { Button, ProvenanceBadge } from "@/components/ui/primitives";
import type { Provenance } from "@/lib/types";

export function PageFrame({ eyebrow, title, description, type, actions, children }: { eyebrow: string; title: string; description: string; type?: Provenance; actions?: React.ReactNode; children: React.ReactNode }) {
  return <div className="p-3 md:p-5">
    <div className="mb-5 flex flex-col justify-between gap-4 border-b border-line pb-4 md:flex-row md:items-end">
      <div><div className="mb-2 flex items-center gap-2"><span className="eyebrow">{eyebrow}</span>{type && <ProvenanceBadge type={type} />}</div><h1 className="text-[clamp(24px,3vw,38px)] font-bold uppercase leading-none tracking-[-.045em]">{title}</h1><p className="mt-2 max-w-2xl text-[11px] leading-5 text-muted">{description}</p></div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
    {children}
  </div>;
}

export function RefreshButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return <Button onClick={onClick} size="sm"><RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />Refresh</Button>;
}
