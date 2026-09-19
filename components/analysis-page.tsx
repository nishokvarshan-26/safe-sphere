"use client";

import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { PageFrame } from "@/components/page-frame";
import { TerminalTooltip } from "@/components/charts";
import { useApi } from "@/hooks/use-api";
import type { OracleRound } from "@/lib/types";
import { DataUnavailable, Metric, Panel, PanelHeader, ProvenanceBadge, SourceFooter } from "@/components/ui/primitives";

interface OracleResponse { data: OracleRound[] }
const correlationLabels = ["PRICE", "CHANGE", "INTERVAL", "Z-SCORE"];

function pearson(a: number[], b: number[]) {
  const pairs = a.map((value, index) => [value, b[index]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length < 2) return 0;
  const meanA = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
  const meanB = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;
  const numerator = pairs.reduce((sum, pair) => sum + (pair[0] - meanA) * (pair[1] - meanB), 0);
  const denominator = Math.sqrt(pairs.reduce((sum, pair) => sum + (pair[0] - meanA) ** 2, 0) * pairs.reduce((sum, pair) => sum + (pair[1] - meanB) ** 2, 0));
  return denominator ? numerator / denominator : 0;
}

export function AnalysisPage() {
  const result = useApi<OracleResponse>("/api/oracle");
  const rounds = result.data?.data ?? [];
  const vectors = [rounds.map((row) => row.price), rounds.map((row) => row.change ?? 0), rounds.map((row) => row.interval ?? 0), rounds.map((row) => row.zScore ?? 0)];
  const matrix = vectors.map((vectorA) => vectors.map((vectorB) => pearson(vectorA, vectorB)));
  const chart = rounds.map((round) => ({ label: String(round.aggregatorRoundId), price: round.price, change: round.change ?? 0, z: round.zScore ?? 0, interval: round.interval ? round.interval / 3600 : 0 }));
  const anomalyCount = rounds.filter((round) => round.status !== "normal").length;
  return <PageFrame eyebrow="Research workbench / 07" title="Advanced Analysis" description="A transparent research view over available oracle features. Liquidity, admin, and address correlations remain blank when no source is present." type="DERIVED">
    <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-6"><Metric label="Observations" value={rounds.length || "—"} type="HISTORICAL" /><Metric label="Derived anomalies" value={anomalyCount} type="DERIVED" tone={anomalyCount ? "amber" : "green"} /><Metric label="Detection confidence" value="—" detail="No labeled validation set" /><Metric label="False positive rate" value="—" detail="Requires labeled outcomes" /><Metric label="Model endpoint" value="READY" detail="FastAPI Isolation Forest" type="DERIVED" /><Metric label="Window" value="05" detail="Rounds / rolling" type="DERIVED" /></div>
    <div className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_.75fr]">
      <Panel><PanelHeader title="Anomaly timeline" meta="NORMAL VS OBSERVED" action={<ProvenanceBadge type="DERIVED" />} /><div className="h-[330px] p-3"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chart}><CartesianGrid stroke="#202420" vertical={false} /><XAxis dataKey="label" stroke="#555b55" fontSize={8} tickLine={false} axisLine={false} /><YAxis yAxisId="price" domain={[.985,1.015]} stroke="#555b55" fontSize={8} tickLine={false} axisLine={false} /><YAxis yAxisId="z" orientation="right" domain={[-3,3]} stroke="#555b55" fontSize={8} tickLine={false} axisLine={false} /><Tooltip content={<TerminalTooltip />} /><Line yAxisId="price" dataKey="price" name="Price" stroke="#b6ff4a" dot={false} /><Bar yAxisId="z" dataKey="z" name="Z-score" fill="#e6a94066" /></ComposedChart></ResponsiveContainer></div><SourceFooter source="Chainlink sample + rolling statistics" type="DERIVED" /></Panel>
      <Panel><PanelHeader title="Signal correlation" meta="PEARSON R" action={<ProvenanceBadge type="DERIVED" />} /><div className="p-3"><div className="grid grid-cols-[60px_repeat(4,1fr)] gap-1"> <div />{correlationLabels.map((label) => <div key={label} className="truncate py-2 text-center font-mono text-[7px] text-muted">{label}</div>)}{matrix.map((row, rowIndex) => <div className="contents" key={correlationLabels[rowIndex]}><div className="flex items-center font-mono text-[7px] text-muted">{correlationLabels[rowIndex]}</div>{row.map((value, colIndex) => <div key={colIndex} className="flex aspect-square items-center justify-center border border-line font-mono text-[9px]" style={{ background: value >= 0 ? `rgba(182,255,74,${Math.abs(value) * .22})` : `rgba(238,91,79,${Math.abs(value) * .25})` }}>{value.toFixed(2)}</div>)}</div>)}</div></div><SourceFooter source="Safe Sphere Pearson calculation" type="DERIVED" /></Panel>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Panel><PanelHeader title="Oracle deviation" /><div className="p-4"><div className="font-mono text-3xl text-amber">{Math.max(...rounds.map((round) => Math.abs(round.zScore ?? 0)), 0).toFixed(2)}σ</div><p className="mt-3 text-[11px] leading-5 text-muted">Maximum absolute rolling z-score in supplied rounds.</p></div><SourceFooter source="Safe Sphere" type="DERIVED" /></Panel>
      {[["Liquidity outflows", "No pool event source"], ["Admin events", "No privileged event source"], ["Address activity", "No address set selected"]].map(([title, note]) => <Panel key={title}><PanelHeader title={title} /><div className="p-3"><DataUnavailable label={note.toUpperCase()} compact /></div><SourceFooter source="Unavailable" type="LIVE" /></Panel>)}
    </div>
    <div className="mt-3 grid gap-3 lg:grid-cols-2"><Panel><PanelHeader title="Transaction bursts" /><div className="p-3"><DataUnavailable label="NO TRANSACTION SERIES CONNECTED" /></div></Panel><Panel><PanelHeader title="Risk trend" /><div className="p-4 text-[11px] leading-5 text-muted">A composite risk trend is intentionally not produced from a single historical oracle series. Add protocol-specific liquidity, admin, transaction, and dependency signals to enable this model.</div><SourceFooter source="Safe Sphere policy" type="DERIVED" /></Panel></div>
  </PageFrame>;
}
