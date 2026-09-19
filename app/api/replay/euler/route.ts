import { NextResponse } from "next/server";
import { getEulerReplay } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ...getEulerReplay(), provenance: { source: "Etherscan exports + public incident references", type: "HISTORICAL" } });
}
