import { NextResponse } from "next/server";
import { trackedProtocols } from "@/lib/protocols";
import type { ProtocolRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

async function safeFetch(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(9000), next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export async function GET() {
  try {
    const [protocols, feeResult, revenueResult] = await Promise.allSettled([
      safeFetch("https://api.llama.fi/protocols"),
      safeFetch("https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyFees"),
      safeFetch("https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyRevenue"),
    ]);
    if (protocols.status !== "fulfilled" || !Array.isArray(protocols.value)) throw new Error("Core protocol source unavailable");
    const fees = feeResult.status === "fulfilled" ? feeResult.value.protocols ?? [] : [];
    const revenue = revenueResult.status === "fulfilled" ? revenueResult.value.protocols ?? [] : [];
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const findMetric = (rows: Record<string, unknown>[], name: string, slug: string) => rows.find((row) => row.slug === slug || normalize(String(row.name ?? "")) === normalize(name));
    const data: ProtocolRecord[] = trackedProtocols.map(([name, slug], index) => {
      const protocol = protocols.value.find((row: Record<string, unknown>) => row.slug === slug || normalize(String(row.name ?? "")) === normalize(name));
      const fee = findMetric(fees, name, slug);
      const rev = findMetric(revenue, name, slug);
      return {
        rank: index + 1,
        name,
        slug,
        symbol: protocol?.symbol ? String(protocol.symbol) : null,
        category: protocol?.category ? String(protocol.category) : null,
        chains: Array.isArray(protocol?.chains) ? protocol.chains.map(String) : [],
        tvl: typeof protocol?.tvl === "number" ? protocol.tvl : null,
        change1d: typeof protocol?.change_1d === "number" ? protocol.change_1d : null,
        change7d: typeof protocol?.change_7d === "number" ? protocol.change_7d : null,
        fees24h: typeof fee?.dailyFees === "number" ? fee.dailyFees : null,
        fees7d: typeof fee?.total7d === "number" ? fee.total7d : null,
        fees30d: typeof fee?.total30d === "number" ? fee.total30d : null,
        revenue24h: typeof rev?.dailyRevenue === "number" ? rev.dailyRevenue : null,
        revenue7d: typeof rev?.total7d === "number" ? rev.total7d : null,
        revenue30d: typeof rev?.total30d === "number" ? rev.total30d : null,
        mcap: typeof protocol?.mcap === "number" ? protocol.mcap : null,
        users: null,
        transactions24h: null,
        updatedAt: new Date().toISOString(),
      };
    }).sort((a, b) => (b.tvl ?? -1) - (a.tvl ?? -1)).map((protocol, index) => ({ ...protocol, rank: index + 1 }));
    return NextResponse.json({
      data,
      provenance: { source: "DeFiLlama public API", type: "LIVE", updatedAt: new Date().toISOString() },
      partial: { fees: feeResult.status === "rejected", revenue: revenueResult.status === "rejected" },
    });
  } catch (error) {
    return NextResponse.json({ error: "LIVE SOURCE UNAVAILABLE", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 503 });
  }
}
