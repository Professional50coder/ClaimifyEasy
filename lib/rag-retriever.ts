import { db } from "./db"

// Simple cosine similarity calculation for vector-like search
function calculateSimilarity(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/)
  const textWords = text.toLowerCase().split(/\s+/)

  const querySet = new Set(queryWords)
  const textSet = new Set(textWords)

  const intersection = [...querySet].filter((word) => textSet.has(word)).length
  const union = new Set([...querySet, ...textSet]).size

  return union === 0 ? 0 : intersection / union
}

// Extract relevant context from claims based on query
export function getClaimsContext(query: string, limit: number = 3): string {
  if (!db.claims || db.claims.length === 0) {
    return ""
  }

  // Score claims by relevance to query
  const scoredClaims = db.claims
    .map((claim) => ({
      claim,
      score:
        calculateSimilarity(query, claim.diagnosis) +
        calculateSimilarity(query, claim.status) +
        calculateSimilarity(query, claim.hospital) * 0.5,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (scoredClaims.length === 0) {
    return ""
  }

  // Format claims as context
  const context = scoredClaims
    .map((item) => {
      const claim = item.claim
      return `Claim ${claim.id}:
- Diagnosis: ${claim.diagnosis}
- Hospital: ${claim.hospital}
- Amount: ₹${claim.amount.toLocaleString("en-IN")}
- Status: ${claim.status}
- Submitted: ${new Date(claim.createdAt).toLocaleDateString("en-IN")}`
    })
    .join("\n\n")

  return context
}

// Extract relevant context from documents based on query
export function getDocumentsContext(query: string, limit: number = 2): string {
  if (!db.docs || db.docs.length === 0) {
    return ""
  }

  // Score documents by relevance to query
  const scoredDocs = db.docs
    .map((doc) => ({
      doc,
      score: calculateSimilarity(query, doc.name) + calculateSimilarity(query, doc.summary || ""),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (scoredDocs.length === 0) {
    return ""
  }

  // Format documents as context
  const context = scoredDocs
    .map((item) => {
      const doc = item.doc
      return `Document: ${doc.name}
- Type: ${doc.type}
- Size: ${(doc.size / 1024).toFixed(2)} KB
- Summary: ${doc.summary || "No summary available"}
- Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString("en-IN")}`
    })
    .join("\n\n")

  return context
}

// Build comprehensive RAG context for the chat
export function buildRAGContext(query: string): string {
  const claimsContext = getClaimsContext(query)
  const docsContext = getDocumentsContext(query)

  const contextParts: string[] = []

  if (claimsContext) {
    contextParts.push(`RELEVANT CLAIMS DATA:\n${claimsContext}`)
  }

  if (docsContext) {
    contextParts.push(`RELEVANT DOCUMENTS:\n${docsContext}`)
  }

  if (contextParts.length === 0) {
    return "No specific claim or document data found for this query."
  }

  return contextParts.join("\n\n---\n\n")
}

// Get user-specific context (claims they can access)
export function getUserClaimsContext(userId: string, query: string): string {
  if (!db.claims || db.claims.length === 0) {
    return ""
  }

  // Filter claims for user (basic filtering by user role patterns)
  const userClaims = db.claims.filter((claim) => {
    // In a real app, would check proper ownership/permissions
    return true // For demo, all users can see claim summaries
  })

  if (userClaims.length === 0) {
    return ""
  }

  const scoredClaims = userClaims
    .map((claim) => ({
      claim,
      score:
        calculateSimilarity(query, claim.diagnosis) +
        calculateSimilarity(query, claim.status) +
        calculateSimilarity(query, claim.hospital) * 0.5,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (scoredClaims.length === 0) {
    return ""
  }

  const context = scoredClaims
    .map((item) => {
      const claim = item.claim
      return `Claim Status: ${claim.status}
- Diagnosis: ${claim.diagnosis}
- Hospital: ${claim.hospital}
- Amount Claimed: ₹${claim.amount.toLocaleString("en-IN")}
- Days in System: ${Math.floor((Date.now() - claim.createdAt) / (1000 * 60 * 60 * 24))}`
    })
    .join("\n\n")

  return `RECENT RELEVANT CLAIM INFORMATION:\n${context}`
}
