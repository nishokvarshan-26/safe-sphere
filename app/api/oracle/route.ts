import { NextResponse } from "next/server";
import { getOracleRounds } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    data: getOracleRounds(),
    provenance: { source: "Chainlink TUSD/USD supplied sample", type: "HISTORICAL", calculation: "Safe Sphere rolling window (5 rounds)", derivedType: "DERIVED" },
  });
}
