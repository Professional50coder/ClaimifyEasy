import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

// Mock database of documents
const documents: Record<string, any[]> = {}

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return user's documents
    const userDocs = documents[user.id] || []
    return NextResponse.json(userDocs)
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
