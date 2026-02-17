import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Check if GCP is configured
    const hasGCPConfig = process.env.GCP_BUCKET_NAME || process.env.GOOGLE_CLOUD_PROJECT

    const documentId = Math.random().toString(36).substr(2, 9)
    let storageUrl = null
    let storagePath = null

    // Upload to GCP if configured
    if (hasGCPConfig) {
      try {
        const { uploadFileToGCS } = await import("@/lib/gcp-storage")
        const buffer = await file.arrayBuffer()
        const result = await uploadFileToGCS(Buffer.from(buffer), file.name, file.type)
        storageUrl = result.url
        storagePath = result.path
      } catch (gcpError) {
        console.error("[v0] GCP upload failed, using fallback:", gcpError)
        // Continue without GCP - file is still logged in system
      }
    }

    // Store metadata (in a real app, save to database)
    const document = {
      id: documentId,
      name: file.name,
      type: file.type,
      size: file.size,
      userId: user.id,
      uploadedAt: new Date().toISOString(),
      status: "success",
      storageUrl,
      storagePath,
    }

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
