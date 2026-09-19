import { NextResponse } from "next/server";
import { getDatasetCatalog } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: getDatasetCatalog() });
}
