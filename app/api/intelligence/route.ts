import { NextResponse } from "next/server";
import { getIncidents } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: getIncidents(), provenance: { source: "DeFiTainter", type: "HISTORICAL" } });
}
