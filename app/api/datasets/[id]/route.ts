import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getDatasetPath, parseCsv } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const filePath = getDatasetPath(id);
  if (!filePath || !fs.existsSync(filePath)) return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  const extension = path.extname(filePath).toLowerCase();
  const download = request.nextUrl.searchParams.get("download") === "1";
  if (download || extension !== ".csv") {
    const buffer = fs.readFileSync(filePath);
    const contentType = extension === ".xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : extension === ".txt" ? "text/plain" : "text/csv";
    return new NextResponse(buffer, { headers: { "Content-Type": contentType, "Content-Disposition": `attachment; filename="${path.basename(filePath)}"` } });
  }
  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  return NextResponse.json({ data: rows, columns: Object.keys(rows[0] ?? {}), provenance: { type: "HISTORICAL", source: "Supplied Safe Sphere dataset pack" } });
}
