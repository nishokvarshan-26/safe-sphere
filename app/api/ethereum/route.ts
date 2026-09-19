import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function rpc(url: string, method: string, params: unknown[]) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`RPC ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message);
  return payload.result;
}

export async function GET() {
  const configured = process.env.ALCHEMY_RPC_URL;
  const url = configured || "https://eth.llamarpc.com";
  try {
    const latestHex = await rpc(url, "eth_blockNumber", []);
    const latest = Number.parseInt(latestHex, 16);
    const blocks = await Promise.all(Array.from({ length: 7 }, (_, index) => rpc(url, "eth_getBlockByNumber", [`0x${(latest - index).toString(16)}`, false])));
    return NextResponse.json({
      data: blocks.map((block) => ({
        number: Number.parseInt(block.number, 16),
        timestamp: new Date(Number.parseInt(block.timestamp, 16) * 1000).toISOString(),
        transactionCount: block.transactions.length,
        gasUsed: Number.parseInt(block.gasUsed, 16),
        gasLimit: Number.parseInt(block.gasLimit, 16),
        hash: block.hash,
      })),
      provenance: { source: configured ? "Configured Ethereum RPC" : "LlamaNodes public Ethereum RPC", type: "LIVE", updatedAt: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json({ error: "LIVE SOURCE UNAVAILABLE", detail: error instanceof Error ? error.message : "Unknown RPC error" }, { status: 503 });
  }
}
