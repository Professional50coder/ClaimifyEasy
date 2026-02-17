import { Storage } from "@google-cloud/storage"

// Initialize GCP Storage client
// Requires GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to JSON key file
// Or use GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_CREDENTIALS env vars

let storageClient: Storage | null = null

function getStorageClient(): Storage {
  if (storageClient) {
    return storageClient
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
    : undefined

  storageClient = new Storage({
    projectId,
    credentials,
  })

  return storageClient
}

export async function uploadFileToGCS(
  file: Buffer | string,
  fileName: string,
  mimeType: string,
  bucketName: string = process.env.GCP_BUCKET_NAME || "claims-documents",
): Promise<{ url: string; path: string }> {
  try {
    const storage = getStorageClient()
    const bucket = storage.bucket(bucketName)

    // Create a timestamp-prefixed path to avoid collisions
    const timestamp = Date.now()
    const path = `documents/${timestamp}-${fileName}`

    const file_obj = bucket.file(path)

    await file_obj.save(file, {
      metadata: {
        contentType: mimeType,
      },
      public: false,
    })

    // Generate a signed URL that expires in 7 days
    const [url] = await file_obj.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return {
      url,
      path,
    }
  } catch (error) {
    console.error("[v0] GCS upload error:", error)
    throw new Error("Failed to upload file to cloud storage")
  }
}

export async function deleteFileFromGCS(
  filePath: string,
  bucketName: string = process.env.GCP_BUCKET_NAME || "claims-documents",
): Promise<void> {
  try {
    const storage = getStorageClient()
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(filePath)

    await file.delete()
  } catch (error) {
    console.error("[v0] GCS delete error:", error)
    throw new Error("Failed to delete file from cloud storage")
  }
}

export async function getFileFromGCS(
  filePath: string,
  bucketName: string = process.env.GCP_BUCKET_NAME || "claims-documents",
): Promise<Buffer> {
  try {
    const storage = getStorageClient()
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(filePath)

    const [contents] = await file.download()
    return contents
  } catch (error) {
    console.error("[v0] GCS read error:", error)
    throw new Error("Failed to read file from cloud storage")
  }
}
