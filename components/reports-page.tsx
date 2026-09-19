"use client";

import { useMemo, useState } from "react";
import { Download, FileCode2, Printer } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { Button, Panel, PanelHeader, ProvenanceBadge, SourceFooter } from "@/components/ui/primitives";
import { downloadData, toCsv } from "@/lib/utils";

const reports = {
  euler: {
    title: "Euler Finance Incident Analysis",
    protocol: "Euler Finance", timestamp: "13 Mar 2023 08:50:59 UTC", alert: "Confirmed historical exploit transaction",
    evidence: "Attack transaction 0xc310a0affe2169d1f6feec1c63dbc7f7c62a887fa48795d327d4d2da2d6b111d at block 16,817,996.",
    dependencies: "Exploit contracts and related externally owned addresses from supplied reference file.",
    sources: "Three Etherscan CSV exports; Euler incident reference; public incident report citations.",
    metrics: "Estimated loss USD 197,000,000 (public incident estimate). No early-warning window validated.", type: "HISTORICAL",
  },
  oracle: {
    title: "TUSD/USD Oracle Signal Review", protocol: "Chainlink TUSD/USD", timestamp: "08–10 Nov 2022 UTC", alert: "Rolling deviation and update interval review",
    evidence: "35 supplied oracle rounds with eight-decimal answers and update timestamps.", dependencies: "Downstream consumers not supplied; exposure cannot be confirmed.",
    sources: "Chainlink TUSD/USD historical sample supplied in dataset pack.", metrics: "Five-round rolling mean/std, percentage change, z-score, and interval delta. Thresholds: |z| ≥ 1.5; stale interval > 6h.", type: "DERIVED",
  },
} as const;

export function ReportsPage() {
  const [selected, setSelected] = useState<keyof typeof reports>("euler");
  const report = reports[selected];
  const rows = useMemo(() => Object.entries(report).map(([field, value]) => ({ field, value })), [report]);
  const download = (format: "json" | "csv" | "html") => {
    if (format === "json") downloadData(`safe-sphere-${selected}-report.json`, JSON.stringify(report, null, 2), "application/json");
    if (format === "csv") downloadData(`safe-sphere-${selected}-report.csv`, toCsv(rows), "text/csv");
    if (format === "html") downloadData(`safe-sphere-${selected}-report.html`, `<!doctype html><html><head><meta charset="utf-8"><title>${report.title}</title><style>body{font-family:Arial;max-width:900px;margin:60px auto;color:#111}header{border-bottom:3px solid #111;padding-bottom:20px}small{letter-spacing:.15em}section{display:grid;grid-template-columns:220px 1fr;border-bottom:1px solid #ccc;padding:20px 0}b{text-transform:uppercase;font-size:11px;letter-spacing:.1em}p{margin:0;line-height:1.6}@media print{body{margin:30px}}</style></head><body><header><small>SAFE SPHERE / INCIDENT ANALYSIS</small><h1>${report.title}</h1></header>${rows.map((row) => `<section><b>${row.field}</b><p>${row.value}</p></section>`).join("")}</body></html>`, "text/html");
  };
  return <PageFrame eyebrow="Research output / 14" title="Research Reports" description="Generate evidence-based investigation summaries from the local historical corpus. HTML output is formatted for browser PDF printing." type="DERIVED" actions={<><Button size="sm" onClick={() => download("html")}><FileCode2 className="h-3 w-3" />PDF-ready HTML</Button><Button size="sm" onClick={() => window.print()}><Printer className="h-3 w-3" />Print</Button></>}>
    <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
      <Panel className="no-print"><PanelHeader title="Available reports" meta="02" /><div className="p-2">{Object.entries(reports).map(([id, item]) => <button key={id} onClick={() => setSelected(id as keyof typeof reports)} className={`mb-1 w-full border p-3 text-left ${selected === id ? "border-signal bg-signal/5" : "border-line hover:bg-[#141714]"}`}><div className="font-mono text-[9px] text-muted">{item.type}</div><div className="mt-2 text-[12px] font-semibold">{item.title}</div></button>)}</div><div className="border-t border-line p-2"><Button className="w-full" size="sm" onClick={() => download("csv")}><Download className="h-3 w-3" />CSV</Button><Button className="mt-1 w-full" size="sm" onClick={() => download("json")}><Download className="h-3 w-3" />JSON</Button></div></Panel>
      <article className="panel bg-[#111411] p-6 md:p-10"><header className="border-b-2 border-bone pb-7"><div className="flex justify-between"><span className="font-mono text-[9px] font-bold tracking-[.2em]">SAFE SPHERE / INCIDENT ANALYSIS</span><ProvenanceBadge type={report.type} /></div><h2 className="mt-12 text-3xl font-bold uppercase tracking-[-.04em] md:text-5xl">{report.title}</h2><p className="mt-3 font-mono text-[10px] text-muted">Generated from validated local sources</p></header><div>{rows.filter((row) => !["title", "type"].includes(row.field)).map(({ field, value }) => <section key={field} className="grid border-b border-line py-6 md:grid-cols-[180px_1fr]"><div className="eyebrow">{field}</div><div className="mt-3 font-mono text-[11px] leading-6 text-[#d0d3cc] md:mt-0">{value}</div></section>)}</div><footer className="mt-10 font-mono text-[8px] uppercase tracking-widest text-muted">Safe Sphere · Detect threats before they become exploits.</footer></article>
    </div>
  </PageFrame>;
}
