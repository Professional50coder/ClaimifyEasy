import { describe, it, expect } from "vitest"
import { db, createClaim, transitionClaimStatus, findUserByEmail } from "../lib/db"
import type { User } from "../lib/types"

const patient = findUserByEmail("patient@example.com") as User
const hospital = findUserByEmail("hospital@example.com") as User
const insurer = findUserByEmail("insurer@example.com") as User
const admin = findUserByEmail("admin@example.com") as User

let n = 0
function newClaim() {
  // unique diagnosis per call so duplicate detection never interferes
  const r = createClaim({ patientId: patient.id, diagnosis: `Test condition ${++n}`, amount: 1000 })
  if (!("claim" in r) || !r.claim) throw new Error("setup failed")
  return r.claim
}

describe("createClaim", () => {
  it("creates a submitted, unverified claim and writes an audit entry", () => {
    const before = db.audit.length
    const c = newClaim()
    expect(c.status).toBe("submitted")
    expect(c.hospitalVerified).toBe(false)
    expect(db.audit.length).toBe(before + 1)
    expect(db.audit[db.audit.length - 1].action).toBe("CLAIM_SUBMITTED")
  })

  it("rejects non-positive amounts and a missing diagnosis without throwing", () => {
    expect(createClaim({ patientId: patient.id, diagnosis: "X", amount: 0 })).toHaveProperty("error")
    expect(createClaim({ patientId: patient.id, diagnosis: "X", amount: -5 })).toHaveProperty("error")
    expect(createClaim({ patientId: patient.id, diagnosis: undefined as any, amount: 10 })).toHaveProperty("error")
  })

  it("flags a duplicate (same patient + diagnosis, case-insensitive, within 30 days)", () => {
    const c = newClaim()
    const dup = createClaim({ patientId: patient.id, diagnosis: `  ${c.diagnosis.toUpperCase()} `, amount: 500 })
    expect(dup).toHaveProperty("error")
  })
})

describe("transitionClaimStatus", () => {
  it("runs the happy path submitted -> under_review -> approved -> settled", () => {
    const c = newClaim()
    expect(transitionClaimStatus({ claimId: c.id, actor: hospital, action: "verify" })).toHaveProperty("claim")
    expect(c.status).toBe("under_review")
    expect(transitionClaimStatus({ claimId: c.id, actor: insurer, action: "approve" })).toHaveProperty("claim")
    expect(c.status).toBe("approved")
    expect(transitionClaimStatus({ claimId: c.id, actor: admin, action: "settle" })).toHaveProperty("claim")
    expect(c.status).toBe("settled")
  })

  it("enforces roles", () => {
    const c = newClaim()
    expect(transitionClaimStatus({ claimId: c.id, actor: patient, action: "verify" })).toHaveProperty("error")
    expect(transitionClaimStatus({ claimId: c.id, actor: insurer, action: "verify" })).toHaveProperty("error")
    transitionClaimStatus({ claimId: c.id, actor: hospital, action: "verify" })
    expect(transitionClaimStatus({ claimId: c.id, actor: hospital, action: "approve" })).toHaveProperty("error")
    expect(transitionClaimStatus({ claimId: c.id, actor: insurer, action: "settle" })).toHaveProperty("error")
  })

  it("refuses approval before hospital verification", () => {
    const c = newClaim()
    expect(transitionClaimStatus({ claimId: c.id, actor: insurer, action: "approve" })).toEqual({
      error: "Hospital verification required before approval",
    })
    expect(c.status).toBe("submitted")
  })

  it("refuses settlement before approval", () => {
    const c = newClaim()
    transitionClaimStatus({ claimId: c.id, actor: hospital, action: "verify" })
    expect(transitionClaimStatus({ claimId: c.id, actor: admin, action: "settle" })).toHaveProperty("error")
  })

  it("does not let a rejected or settled claim be re-verified, re-approved or rejected", () => {
    const rejected = newClaim()
    transitionClaimStatus({ claimId: rejected.id, actor: insurer, action: "reject" })
    expect(rejected.status).toBe("rejected")
    transitionClaimStatus({ claimId: rejected.id, actor: hospital, action: "verify" })
    expect(rejected.status).toBe("rejected")

    const settled = newClaim()
    transitionClaimStatus({ claimId: settled.id, actor: hospital, action: "verify" })
    transitionClaimStatus({ claimId: settled.id, actor: insurer, action: "approve" })
    transitionClaimStatus({ claimId: settled.id, actor: admin, action: "settle" })
    expect(transitionClaimStatus({ claimId: settled.id, actor: insurer, action: "reject" })).toHaveProperty("error")
    expect(settled.status).toBe("settled")
  })

  it("reports an unknown claim", () => {
    expect(transitionClaimStatus({ claimId: "nope", actor: admin, action: "settle" })).toEqual({
      error: "Claim not found",
    })
  })
})
