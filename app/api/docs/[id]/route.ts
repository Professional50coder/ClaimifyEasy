import type { NextRequest } from "next/server"
import { getDocById } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const doc = getDocById(params.id)
  if (!doc) {
    return new Response("Not found", { status: 404 })
  }
  return new Response(doc.data, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${doc.filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
