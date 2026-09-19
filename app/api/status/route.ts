import { NextResponse } from "next/server";
import { getDatasetCatalog } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  let datasets = 0;
  try { datasets = getDatasetCatalog().length; } catch { datasets = 0; }
  return NextResponse.json({
    data: [
      { id: "datasets", name: "Historical dataset pack", status: datasets === 8 ? "operational" : "error", detail: `${datasets}/8 files available`, required: false },
      { id: "defillama", name: "DeFiLlama public API", status: "public", detail: "Checked by protocol views", required: false },
      { id: "rpc", name: "Ethereum RPC", status: process.env.ALCHEMY_RPC_URL ? "configured" : "public-fallback", detail: process.env.ALCHEMY_RPC_URL ? "Private endpoint configured" : "LlamaNodes public fallback", required: false },
      { id: "etherscan", name: "Etherscan API", status: process.env.ETHERSCAN_API_KEY ? "configured" : "unavailable", detail: process.env.ETHERSCAN_API_KEY ? "API key present" : "ETHERSCAN_API_KEY not set", required: true },
      { id: "alchemy", name: "Alchemy WebSocket", status: process.env.ALCHEMY_RPC_URL?.startsWith("wss") ? "configured" : "unavailable", detail: "Required for push-based live events", required: true },
      { id: "tenderly", name: "Tenderly simulation", status: process.env.TENDERLY_ACCESS_KEY && process.env.TENDERLY_PROJECT_SLUG ? "configured" : "unavailable", detail: "Tenderly-ready; credentials not exposed", required: true },
      { id: "supabase", name: "Supabase / PostgreSQL", status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "local-only", detail: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Project URL configured" : "Watchlist uses browser storage", required: true },
      { id: "analysis", name: "FastAPI analysis service", status: process.env.ANALYSIS_API_URL ? "configured" : "local-module", detail: "Run backend/main.py for Isolation Forest endpoint", required: false },
    ],
    checkedAt: new Date().toISOString(),
  });
}
