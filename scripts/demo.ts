// Offline demo: runs the claim lifecycle, the coverage estimate and the chat retriever
// against the in-memory store. No API keys, no network.
// Run: pnpm demo
import { db, createClaim, transitionClaimStatus, findUserByEmail } from "../lib/db"
import { calculateBasicCoverage } from "../lib/coverage-calc"
import { getClaimsContext } from "../lib/rag-retriever"
import type { User } from "../lib/types"

const who = (email: string) => findUserByEmail(email) as User
const [patient, hospital, insurer, admin] = [
  who("patient@example.com"),
  who("hospital@example.com"),
  who("insurer@example.com"),
  who("admin@example.com"),
]

console.log("== 1. Claim lifecycle (patient -> hospital -> insurer -> admin) ==")
const created = createClaim({ patientId: patient.id, diagnosis: "Appendicitis (demo)", amount: 85000 })
if (!("claim" in created) || !created.claim) throw new Error(String((created as any).error))
const claim = created.claim
console.log(`submit            -> ${claim.status}`)

const attempt = (label: string, actor: User, action: Parameters<typeof transitionClaimStatus>[0]["action"]) => {
  const r = transitionClaimStatus({ claimId: claim.id, actor, action })
  console.log(`${label.padEnd(17)} -> ${"error" in r ? "REFUSED: " + r.error : claim.status}`)
}
attempt("insurer approve", insurer, "approve") // before hospital verification
attempt("hospital verify", hospital, "verify")
attempt("admin settle", admin, "settle") // before approval
attempt("insurer approve", insurer, "approve")
attempt("admin settle", admin, "settle")
attempt("insurer reject", insurer, "reject") // after settlement

const dup = createClaim({ patientId: patient.id, diagnosis: "appendicitis (DEMO)", amount: 1000 })
console.log(`duplicate submit  -> ${"error" in dup ? "REFUSED: " + dup.error : "accepted"}`)

console.log("\naudit trail for this claim:")
for (const a of db.audit.filter((x) => x.claimId === claim.id)) {
  const actor = db.users.find((u) => u.id === a.actorId)
  console.log(`  ${a.action.padEnd(16)} by ${actor?.role}`)
}

console.log("\n== 2. Coverage estimate (rule-based, illustrative rates) ==")
const input = {
  diagnosis: "Appendicitis",
  treatmentType: "surgery",
  estimatedCost: 85000,
  policyType: "standard",
  policyDetails: { deductible: 5000, maxLimit: 500000, coinsurance: 20 },
}
console.log("input :", JSON.stringify(input))
console.log("output:", JSON.stringify(calculateBasicCoverage(input), null, 2))

console.log("\n== 3. Chat retrieval context (word-overlap, best match) ==")
console.log('query : "appendicitis (demo)"  (best match shown; seeded claims are random each run)')
console.log(getClaimsContext("appendicitis (demo)", 1).replace(/Claim [0-9a-f-]{36}/, "Claim <uuid>").replace(/- Submitted: .*/, "- Submitted: <today>"))
