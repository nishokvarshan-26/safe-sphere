"use client";

import type { TooltipProps } from "recharts";

export function TerminalTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return <div className="border border-[#424842] bg-[#0a0c0b] px-3 py-2 shadow-xl">
    <div className="mb-1.5 font-mono text-[8px] uppercase text-muted">{String(label ?? "Observation")}</div>
    {payload.map((item) => <div key={String(item.dataKey)} className="flex min-w-36 items-center justify-between gap-6 font-mono text-[10px]"><span style={{ color: item.color }}>{item.name}</span><b>{typeof item.value === "number" ? item.value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(item.value)}</b></div>)}
  </div>;
}
