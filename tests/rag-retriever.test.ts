import { describe, it, expect } from "vitest"
import { calculateSimilarity, getClaimsContext, getDocumentsContext, buildRAGContext } from "../lib/rag-retriever"
import { db } from "../lib/db"

describe("calculateSimilarity", () => {
  it("is 1 for identical text, 0 for disjoint or empty text", () => {
    expect(calculateSimilarity("dengue fever", "Dengue Fever")).toBe(1)
    expect(calculateSimilarity("dengue", "typhoid")).toBe(0)
    expect(calculateSimilarity("dengue", "")).toBe(0)
  })
  it("is Jaccard: 1 shared word of 3 distinct gives 1/3", () => {
    expect(calculateSimilarity("a b", "b c")).toBeCloseTo(1 / 3)
  })
})

describe("retrieval over the seeded store", () => {
  it("does not throw and returns matching claims for a diagnosis word", () => {
    const target = db.claims[0]
    const ctx = getClaimsContext(target.diagnosis)
    expect(ctx).toContain("Diagnosis:")
    expect(ctx).toContain(target.diagnosis.split(" ")[0])
  })

  it("does not throw when documents exist", () => {
    expect(db.docs.length).toBeGreaterThan(0)
    const name = db.docs[0].filename
    expect(() => getDocumentsContext(name)).not.toThrow()
    expect(getDocumentsContext(name)).toContain(`Document: ${name}`)
  })

  it("buildRAGContext falls back to a message when nothing matches", () => {
    expect(buildRAGContext("zzzzqqqq")).toBe("No specific claim or document data found for this query.")
  })
})
