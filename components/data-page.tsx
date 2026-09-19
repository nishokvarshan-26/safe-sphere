"use client";

import { useMemo, useState } from "react";
import { Database, Download, Eye, Search, X } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { useApi } from "@/hooks/use-api";
import { Button, DataUnavailable, Panel, PanelHeader, ProvenanceBadge, Skeleton, SourceFooter } from "@/components/ui/primitives";
import { formatNumber } from "@/lib/utils";

interface Dataset { id: string; file: string; bytes: number; rows: number | null; columns: number | null; title: string; source: string; type: "HISTORICAL"; dateRange: string }
interface CatalogResponse { data: Dataset[] }
interface PreviewResponse { data: Record<string, string>[]; columns: string[] }

export function DataPage() {
  const catalog = useApi<CatalogResponse>("/api/datasets");
  const [selected, setSelected] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const openPreview = async (dataset: Dataset) => { setSelected(dataset); setPreview(null); setPreviewLoading(true); setSearch(""); setPage(1); try { const response = await fetch(`/api/datasets/${dataset.id}`); if (response.ok && dataset.file.endsWith(".csv")) setPreview(await response.json()); } finally { setPreviewLoading(false); } };
  const rows = useMemo(() => (preview?.data ?? []).filter((row) => Object.values(row).some((value) => value.toLowerCase().includes(search.toLowerCase()))).sort((a, b) => sortColumn ? a[sortColumn].localeCompare(b[sortColumn], undefined, { numeric: true }) * (sortAsc ? 1 : -1) : 0), [preview, search, sortColumn, sortAsc]);
  const shown = rows.slice((page - 1) * 10, page * 10);
  return <PageFrame eyebrow="Research storage / 15" title="Data & Export Center" description="Inspect and download every supplied source file. Raw values remain unchanged; derived tables are explicitly identified." type="HISTORICAL">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{catalog.loading ? Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-52" />) : catalog.data?.data.map((dataset) => <Panel key={dataset.id} className="flex min-h-52 flex-col"><div className="flex flex-1 flex-col p-4"><div className="flex items-start justify-between"><Database className="h-5 w-5 text-[#7b827b]" /><ProvenanceBadge type={dataset.type} /></div><h2 className="mt-7 text-[13px] font-semibold leading-5">{dataset.title}</h2><div className="mt-4 grid grid-cols-2 gap-3 font-mono text-[9px]"><div><div className="eyebrow">Rows</div><div className="mt-1">{dataset.rows ?? "—"}</div></div><div><div className="eyebrow">Columns</div><div className="mt-1">{dataset.columns ?? "—"}</div></div><div><div className="eyebrow">Range</div><div className="mt-1">{dataset.dateRange}</div></div><div><div className="eyebrow">Size</div><div className="mt-1">{formatNumber(dataset.bytes, false)} B</div></div></div></div><div className="flex border-t border-line"><button onClick={() => openPreview(dataset)} className="flex h-9 flex-1 items-center justify-center gap-2 border-r border-line font-mono text-[9px] hover:bg-[#161a16]"><Eye className="h-3 w-3" />PREVIEW</button><a href={`/api/datasets/${dataset.id}?download=1`} className="flex h-9 flex-1 items-center justify-center gap-2 font-mono text-[9px] hover:bg-[#161a16]"><Download className="h-3 w-3" />DOWNLOAD</a></div></Panel>)}</div>
    {selected && <Panel className="mt-3"><PanelHeader title={`Dataset viewer / ${selected.title}`} meta={selected.file} action={<button onClick={() => setSelected(null)}><X className="h-3.5 w-3.5 text-muted hover:text-bone" /></button>} />{selected.file.endsWith(".csv") ? <>{previewLoading ? <div className="space-y-px p-3">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-9" />)}</div> : <><div className="flex gap-2 border-b border-line p-2"><label className="flex h-8 flex-1 items-center border border-line bg-[#090b0a] px-2"><Search className="mr-2 h-3 w-3 text-muted" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="flex-1 bg-transparent font-mono text-[10px] outline-none" placeholder="Filter all columns…" /></label><a href={`/api/datasets/${selected.id}?download=1`}><Button size="sm"><Download className="h-3 w-3" />Raw CSV</Button></a></div><div className="overflow-x-auto"><table className="data-table min-w-max"><thead><tr>{preview?.columns.map((column) => <th key={column}><button onClick={() => { if (sortColumn === column) setSortAsc(!sortAsc); else { setSortColumn(column); setSortAsc(true); } }}>{column} {sortColumn === column ? sortAsc ? "↑" : "↓" : ""}</button></th>)}</tr></thead><tbody>{shown.map((row, index) => <tr key={index}>{preview?.columns.map((column) => <td key={column} className="max-w-[300px] truncate" title={row[column]}>{row[column] || "—"}</td>)}</tr>)}</tbody></table></div><div className="flex items-center border-t border-line p-2 font-mono text-[9px] text-muted"><span>{rows.length} filtered rows</span><div className="ml-auto flex gap-1"><Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button><span className="flex h-7 items-center px-2">{page} / {Math.max(1, Math.ceil(rows.length / 10))}</span><Button size="sm" disabled={page >= Math.ceil(rows.length / 10)} onClick={() => setPage(page + 1)}>Next</Button></div></div></>}</> : <div className="p-3"><DataUnavailable label="BINARY / TEXT PREVIEW NOT AVAILABLE" /><div className="mt-3 text-center"><a href={`/api/datasets/${selected.id}?download=1`}><Button size="sm"><Download className="h-3 w-3" />Download source file</Button></a></div></div>}<SourceFooter source={selected.source} type="HISTORICAL" /></Panel>}
  </PageFrame>;
}
