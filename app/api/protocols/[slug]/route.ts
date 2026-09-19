import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function safeFetch(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(9000), next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const [protocol, fees, revenue] = await Promise.allSettled([
      safeFetch(`https://api.llama.fi/protocol/${encodeURIComponent(slug)}`),
      safeFetch(`https://api.llama.fi/summary/fees/${encodeURIComponent(slug)}?dataType=dailyFees`),
      safeFetch(`https://api.llama.fi/summary/fees/${encodeURIComponent(slug)}?dataType=dailyRevenue`),
    ]);
    if (protocol.status !== "fulfilled") throw new Error("Protocol endpoint unavailable");
    return NextResponse.json({
      data: protocol.value,
      fees: fees.status === "fulfilled" ? fees.value : null,
      revenue: revenue.status === "fulfilled" ? revenue.value : null,
      provenance: { source: "DeFiLlama public API", type: "LIVE", updatedAt: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json({ error: "LIVE SOURCE UNAVAILABLE", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 503 });
  }
}
