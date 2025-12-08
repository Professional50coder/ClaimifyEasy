import type { AuditLog, Claim, ClaimStatus, DocFile, Notification, User, SmartContract, ContractStatus } from "./types"

type DB = {
  users: User[]
  claims: Claim[]
  docs: DocFile[]
  notifications: Notification[]
  audit: AuditLog[]
  contracts: SmartContract[]
}

declare global {
  // eslint-disable-next-line no-var
  var __MEM_DB__: DB | undefined
}

function now() {
  return Date.now()
}

// Browser-safe UUID generator for Next.js runtime
function randomId(): string {
  const anyCrypto: any = (globalThis as any).crypto
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID()
  if (anyCrypto?.getRandomValues) {
    const buf = new Uint8Array(16)
    anyCrypto.getRandomValues(buf)
    // RFC4122 v4
    buf[6] = (buf[6] & 0x0f) | 0x40
    buf[8] = (buf[8] & 0x3f) | 0x80
    const hex = [...buf].map((b) => b.toString(16).padStart(2, "0"))
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`
  }
  return `id_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function seed(): DB {
  // Indian user profiles (keep same emails/passwords for easy login)
  const users: User[] = [
    { id: "u_patient", email: "patient@example.com", password: "password", name: "Amit Sharma", role: "patient" },
    {
      id: "u_hospital",
      email: "hospital@example.com",
      password: "password",
      name: "Apollo Hospitals Mumbai",
      role: "hospital",
    },
    {
      id: "u_insurer",
      email: "insurer@example.com",
      password: "password",
      name: "HDFC ERGO General Insurance",
      role: "insurer",
    },
    { id: "u_admin", email: "admin@example.com", password: "password", name: "BharatCare Admin", role: "admin" },
  ]

  const dbInit: DB = { users, claims: [], docs: [], notifications: [], audit: [], contracts: [] }

  // Helpers for realistic Indian sample data
  const diagnoses = [
    "Dengue Fever",
    "Typhoid",
    "Viral Fever",
    "Appendicitis",
    "Gallstones",
    "Hypertension",
    "Diabetes Complication",
    "Fracture (Radius/Ulna)",
    "ACL Tear",
    "Migraine",
    "Chikungunya",
    "Asthma Exacerbation",
    "Kidney Stone",
    "Covid-19",
  ]
  const hospitals = [
    "Fortis Escorts, New Delhi",
    "AIIMS, New Delhi",
    "Kokilaben Dhirubhai Ambani Hospital, Mumbai",
    "Ruby Hall Clinic, Pune",
    "Manipal Hospital, Bengaluru",
    "CMC, Vellore",
    "Narayana Health, Bengaluru",
  ]
  const rupee = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1))
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
  const STATUSES: ClaimStatus[] = ["submitted", "under_review", "approved", "settled", "rejected"]

  // Generate 60 claims over last ~180 days for charts
  const nowMs = Date.now()
  for (let i = 0; i < 60; i++) {
    const createdAt = nowMs - rupee(0, 180) * 24 * 60 * 60 * 1000
    const diagnosis = pick(diagnoses)
    const amount = rupee(5000, 250000) // ₹5,000 - ₹2,50,000
    const status = pick(STATUSES)
    const id = randomId()

    const claim: Claim = {
      id,
      patientId: "u_patient",
      diagnosis,
      amount,
      notes: `Treatment at ${pick(hospitals)}.`,
      documents: [],
      status,
      hospitalVerified: status !== "submitted", // many verified except newly submitted
      insurerDecision:
        status === "approved" || status === "settled" ? "approved" : status === "rejected" ? "rejected" : undefined,
      createdAt,
      updatedAt: createdAt + rupee(1, 10) * 60 * 60 * 1000,
    }
    dbInit.claims.push(claim)

    if (i % 3 === 0) {
      const docId = randomId()
      const text = `Hospital bill and prescription for claim ${id.slice(0, 6)}`
      dbInit.docs.push({
        id: docId,
        filename: `bill-${id.slice(0, 6)}.txt`,
        mimeType: "text/plain",
        data: new TextEncoder().encode(text),
        createdAt: createdAt + 60_000,
        claimId: id,
        uploadedBy: "u_patient",
      })
      claim.documents.push(docId)
    }
  }

  // Notify stakeholders about a few example events
  const sampleIds = dbInit.claims.slice(0, 3).map((c) => c.id)
  for (const cid of sampleIds) {
    dbInit.notifications.push({
      id: randomId(),
      userId: "u_patient",
      message: `Update on claim ${cid.slice(0, 6)} — status changed.`,
      createdAt: now(),
      read: false,
    })
  }

  // Seed a handful of smart contracts for approved claims
  const approved = dbInit.claims.filter((c) => c.status === "approved" || c.status === "settled")
  const randomHex = (len: number) =>
    Array.from({ length: len }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")
  for (let i = 0; i < Math.min(5, approved.length); i++) {
    const c = approved[i]
    dbInit.contracts.push({
      id: `sc_${Math.random().toString(36).slice(2)}`,
      claimId: c.id,
      policyId: `POL${rupee(100000, 999999)}`,
      insurerId: "u_insurer",
      hospitalId: "u_hospital",
      createdBy: "u_insurer",
      insurerWallet: `0x${randomHex(40)}`,
      hospitalWallet: `0x${randomHex(40)}`,
      amount: c.amount,
      date: c.createdAt,
      address: `0x${randomHex(40)}`,
      status: i % 3 === 0 ? "active" : i % 4 === 0 ? "completed" : "pending",
      hash: `0x${randomHex(64)}`,
      lastTxId: `0x${randomHex(64)}`,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })
  }

  return dbInit
}

export const db: DB = globalThis.__MEM_DB__ ?? (globalThis.__MEM_DB__ = seed())

export function findUserByEmail(email: string) {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}
export function findUserById(id: string) {
  return db.users.find((u) => u.id === id)
}

export function addAudit(actorId: string, action: string, claimId?: string, metadata?: Record<string, unknown>) {
  db.audit.push({ id: randomId(), actorId, action, claimId, metadata, createdAt: now() })
}

export function notify(userId: string, message: string) {
  db.notifications.push({ id: randomId(), userId, message, createdAt: now(), read: false })
}

export function getUserNotifications(userId: string) {
  return db.notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt)
}

export function markAllNotificationsRead(userId: string) {
  db.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true
  })
}

export function listClaimsForRole(user: User): Claim[] {
  const all = [...db.claims].sort((a, b) => b.createdAt - a.createdAt)
  if (user.role === "admin") return all
  if (user.role === "insurer") return all.filter((c) => c.status === "under_review" || c.status === "submitted")
  if (user.role === "hospital")
    return all.filter((c) => c.status === "submitted" || (c.status === "under_review" && !c.hospitalVerified))
  // patient
  return all.filter((c) => c.patientId === user.id)
}

export function kpis() {
  const total = db.claims.length
  const approved = db.claims.filter((c) => c.status === "approved" || c.status === "settled").length
  const rejected = db.claims.filter((c) => c.status === "rejected").length
  const underReview = db.claims.filter((c) => c.status === "under_review").length
  const submitted = db.claims.filter((c) => c.status === "submitted").length
  const totalValue = db.claims.reduce((sum, c) => sum + c.amount, 0)
  return { total, approved, rejected, underReview, submitted, totalValue }
}

export function createClaim(params: {
  patientId: string
  diagnosis: string
  amount: number
  notes?: string
  documentFiles?: { filename: string; mimeType: string; data: Uint8Array }[]
}) {
  // simple duplicate detection: same patient + diagnosis within 30 days
  const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30
  const duplicate = db.claims.find(
    (c) =>
      c.patientId === params.patientId &&
      c.diagnosis.trim().toLowerCase() === params.diagnosis.trim().toLowerCase() &&
      now() - c.createdAt < THIRTY_DAYS,
  )
  if (duplicate) {
    return { error: "Possible duplicate claim detected within 30 days for same diagnosis." as const }
  }

  // basic validation
  if (!params.diagnosis || !params.amount || params.amount <= 0) {
    return { error: "Missing or invalid data. Please provide diagnosis and a positive amount." as const }
  }

  const id = randomId()
  const claim: Claim = {
    id,
    patientId: params.patientId,
    diagnosis: params.diagnosis,
    amount: params.amount,
    notes: params.notes,
    documents: [],
    status: "submitted",
    hospitalVerified: false,
    createdAt: now(),
    updatedAt: now(),
  }
  db.claims.push(claim)

  if (params.documentFiles?.length) {
    for (const f of params.documentFiles) {
      const docId = randomId()
      const doc: DocFile = {
        id: docId,
        filename: f.filename,
        mimeType: f.mimeType,
        data: f.data,
        claimId: id,
        uploadedBy: params.patientId,
        createdAt: now(),
      }
      db.docs.push(doc)
      claim.documents.push(docId)
    }
  }

  notify(params.patientId, `Claim ${id.slice(0, 6)} submitted.`)
  // notify insurer and hospital roles (simple broadcast)
  db.users
    .filter((u) => u.role === "hospital" || u.role === "insurer" || u.role === "admin")
    .forEach((u) => notify(u.id, `New claim submitted: ${id.slice(0, 6)}.`))
  addAudit(params.patientId, "CLAIM_SUBMITTED", id, { diagnosis: params.diagnosis, amount: params.amount })
  return { claim }
}

export function transitionClaimStatus(params: {
  claimId: string
  actor: User
  action: "verify" | "send_under_review" | "approve" | "reject" | "settle"
}) {
  const claim = db.claims.find((c) => c.id === params.claimId)
  if (!claim) return { error: "Claim not found" as const }

  switch (params.action) {
    case "verify":
      if (params.actor.role !== "hospital") return { error: "Only Hospital can verify" as const }
      claim.hospitalVerified = true
      claim.status = "under_review"
      claim.updatedAt = now()
      addAudit(params.actor.id, "CLAIM_VERIFIED", claim.id)
      notify(claim.patientId, `Claim ${claim.id.slice(0, 6)} verified by hospital.`)
      break
    case "send_under_review":
      if (params.actor.role !== "insurer") return { error: "Only Insurer can mark under review" as const }
      claim.status = "under_review"
      claim.updatedAt = now()
      addAudit(params.actor.id, "CLAIM_MARKED_UNDER_REVIEW", claim.id)
      notify(claim.patientId, `Claim ${claim.id.slice(0, 6)} is under review.`)
      break
    case "approve":
      if (params.actor.role !== "insurer") return { error: "Only Insurer can approve" as const }
      if (!claim.hospitalVerified) return { error: "Hospital verification required before approval" as const }
      claim.status = "approved"
      claim.insurerDecision = "approved"
      claim.updatedAt = now()
      addAudit(params.actor.id, "CLAIM_APPROVED", claim.id)
      notify(claim.patientId, `Claim ${claim.id.slice(0, 6)} approved.`)
      break
    case "reject":
      if (params.actor.role !== "insurer") return { error: "Only Insurer can reject" as const }
      claim.status = "rejected"
      claim.insurerDecision = "rejected"
      claim.updatedAt = now()
      addAudit(params.actor.id, "CLAIM_REJECTED", claim.id)
      notify(claim.patientId, `Claim ${claim.id.slice(0, 6)} rejected.`)
      break
    case "settle":
      if (params.actor.role !== "admin") return { error: "Only Admin can settle" as const }
      if (claim.status !== "approved") return { error: "Only approved claims can be settled" as const }
      claim.status = "settled"
      claim.updatedAt = now()
      addAudit(params.actor.id, "CLAIM_SETTLED", claim.id)
      notify(claim.patientId, `Claim ${claim.id.slice(0, 6)} settled.`)
      break
  }
  return { claim }
}

export function getDocById(id: string) {
  return db.docs.find((d) => d.id === id)
}

export function analyticsByStatus(): { status: ClaimStatus; count: number }[] {
  const map = new Map<ClaimStatus, number>()
  for (const c of db.claims) {
    map.set(c.status, (map.get(c.status) ?? 0) + 1)
  }
  const statuses: ClaimStatus[] = ["submitted", "under_review", "approved", "settled", "rejected"]
  return statuses.map((s) => ({ status: s, count: map.get(s) ?? 0 }))
}

export function analyticsByDiagnosis(): { diagnosis: string; count: number }[] {
  const map = new Map<string, number>()
  for (const c of db.claims) {
    const key = c.diagnosis.trim()
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()].map(([diagnosis, count]) => ({ diagnosis, count })).sort((a, b) => b.count - a.count)
}

export function analyticsDailyNew(days = 30): { day: string; count: number }[] {
  const out: { key: string; label: string; count: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    out.push({ key, label, count: 0 })
  }
  const idx = new Map(out.map((b, i) => [b.key, i]))
  for (const c of db.claims) {
    const d = new Date(c.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const i = idx.get(key)
    if (i !== undefined) out[i].count++
  }
  return out.map((b) => ({ day: b.label, count: b.count }))
}

export function analyticsMonthlyStatusStacked(months = 6): {
  month: string
  submitted: number
  under_review: number
  approved: number
  settled: number
  rejected: number
}[] {
  const buckets: Record<
    string,
    { label: string; submitted: number; under_review: number; approved: number; settled: number; rejected: number }
  > = {}
  const nowDate = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    buckets[key] = {
      label: d.toLocaleString("en-IN", { month: "short" }) + " " + d.getFullYear(),
      submitted: 0,
      under_review: 0,
      approved: 0,
      settled: 0,
      rejected: 0,
    }
  }
  for (const c of db.claims) {
    const d = new Date(c.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!(key in buckets)) continue
    buckets[key][c.status]++
  }
  return Object.entries(buckets).map(([, v]) => ({
    month: v.label,
    submitted: v.submitted,
    under_review: v.under_review,
    approved: v.approved,
    settled: v.settled,
    rejected: v.rejected,
  }))
}

export function listContractsForRole(user: User): SmartContract[] {
  // All roles can view; scope may be refined later
  const all = [...db.contracts].sort((a, b) => b.createdAt - a.createdAt)
  if (user.role === "patient") {
    // Patients see contracts linked to their claims (patientId on claim)
    const patientClaimIds = db.claims.filter((c) => c.patientId === user.id).map((c) => c.id)
    return all.filter((sc) => patientClaimIds.includes(sc.claimId))
  }
  if (user.role === "hospital") {
    return all.filter((sc) => sc.hospitalId === user.id)
  }
  if (user.role === "insurer") {
    return all.filter((sc) => sc.insurerId === user.id)
  }
  return all // admin
}

export function getContractById(id: string) {
  return db.contracts.find((c) => c.id === id)
}

export function createContract(params: {
  claimId: string
  policyId: string
  amount: number
  insurerWallet: string
  hospitalWallet: string
  date: number
  createdBy: User
  address: string
  txHash: string
}): { contract?: SmartContract; error?: string } {
  // Role gate: only admin/insurer
  if (!(params.createdBy.role === "admin" || params.createdBy.role === "insurer")) {
    return { error: "Only Admin or Insurer can deploy contracts" }
  }

  // Basic validation
  const claim = db.claims.find((c) => c.id === params.claimId)
  if (!claim) return { error: "Claim not found" }
  const hospitalUser = db.users.find((u) => u.role === "hospital")
  const insurerUser = db.users.find((u) => u.role === "insurer")

  const id = `sc_${Math.random().toString(36).slice(2)}`
  const contract: SmartContract = {
    id,
    claimId: params.claimId,
    policyId: params.policyId,
    insurerId: insurerUser?.id || "u_insurer",
    hospitalId: hospitalUser?.id || "u_hospital",
    createdBy: params.createdBy.id,
    insurerWallet: params.insurerWallet,
    hospitalWallet: params.hospitalWallet,
    amount: params.amount,
    date: params.date,
    address: params.address,
    status: "pending",
    hash: params.txHash,
    lastTxId: params.txHash,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  db.contracts.push(contract)
  addAudit(params.createdBy.id, "SC_DEPLOYED", claim.id, { contractId: id, address: params.address })
  notify(claim.patientId, `Smart contract deployed for claim ${claim.id.slice(0, 6)}.`)
  return { contract }
}

export function actOnContract(params: {
  id: string
  actor: User
  action: "approve" | "reject" | "release_payment" | "request_settlement"
  txHash?: string
}): { contract?: SmartContract; error?: string } {
  const contract = db.contracts.find((c) => c.id === params.id)
  if (!contract) return { error: "Contract not found" }

  const set = (status: ContractStatus, audit: string, note?: string) => {
    contract.status = status
    contract.updatedAt = Date.now()
    if (params.txHash) {
      contract.hash = params.txHash
      contract.lastTxId = params.txHash
    }
    addAudit(params.actor.id, audit, contract.claimId, { contractId: contract.id, note })
  }

  switch (params.action) {
    case "approve":
      if (!(params.actor.role === "admin" || params.actor.role === "insurer")) return { error: "Not allowed" }
      set("active", "SC_APPROVED")
      {
        const cl = db.claims.find((c) => c.id === contract.claimId)
        if (cl && cl.status !== "approved" && cl.status !== "settled") {
          cl.status = "approved"
          cl.insurerDecision = "approved"
          cl.updatedAt = Date.now()
          notify(cl.patientId, `Claim ${cl.id.slice(0, 6)} approved (contract).`)
        }
      }
      break
    case "reject":
      if (!(params.actor.role === "admin" || params.actor.role === "insurer")) return { error: "Not allowed" }
      set("rejected", "SC_REJECTED")
      {
        const cl = db.claims.find((c) => c.id === contract.claimId)
        if (cl) {
          cl.status = "rejected"
          cl.insurerDecision = "rejected"
          cl.updatedAt = Date.now()
          notify(cl.patientId, `Claim ${cl.id.slice(0, 6)} rejected (contract).`)
        }
      }
      break
    case "release_payment":
      if (!(params.actor.role === "admin" || params.actor.role === "insurer")) return { error: "Not allowed" }
      set("completed", "SC_PAYMENT_RELEASED")
      {
        const cl = db.claims.find((c) => c.id === contract.claimId)
        if (cl && cl.status !== "settled") {
          cl.status = "settled"
          cl.updatedAt = Date.now()
          notify(cl.patientId, `Claim ${cl.id.slice(0, 6)} settled (payment released).`)
        }
      }
      break
    case "request_settlement":
      addAudit(params.actor.id, "SC_SETTLEMENT_REQUESTED", contract.claimId, { contractId: contract.id })
      // notify admins/insurers
      db.users
        .filter((u) => u.role === "admin" || u.role === "insurer")
        .forEach((u) => notify(u.id, `Settlement requested for contract ${contract.id}`))
      break
  }

  return { contract }
}

export function analyticsMonthlyTotals(months = 6): { month: string; total: number }[] {
  const data: { key: string; label: string; total: number }[] = []
  const nowDate = new Date()
  // Build month buckets from oldest to newest
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = d.toLocaleString("en-IN", { month: "short" }) + " " + String(d.getFullYear())
    data.push({ key, label, total: 0 })
  }
  const bucketIndex = new Map<string, number>()
  data.forEach((b, idx) => bucketIndex.set(b.key, idx))

  for (const c of db.claims) {
    const d = new Date(c.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const idx = bucketIndex.get(key)
    if (idx === undefined) continue
    // Sum only approved/settled to reflect payouts/approved exposure
    if (c.status === "approved" || c.status === "settled") {
      data[idx].total += c.amount
    }
  }

  return data.map((b) => ({ month: b.label, total: b.total }))
}

// New analytics helpers: amount buckets and avg settlement days
export function analyticsAmountBuckets() {
  // buckets in INR
  const buckets = [
    { label: "≤ ₹25k", min: 0, max: 25_000, count: 0 },
    { label: "₹25k–₹50k", min: 25_001, max: 50_000, count: 0 },
    { label: "₹50k–₹1L", min: 50_001, max: 100_000, count: 0 },
    { label: "₹1L–₹2L", min: 100_001, max: 200_000, count: 0 },
    { label: "≥ ₹2L", min: 200_001, max: Number.POSITIVE_INFINITY, count: 0 },
  ]
  for (const c of db.claims) {
    const b = buckets.find((b) => c.amount >= b.min && c.amount <= b.max)
    if (b) b.count++
  }
  return buckets.map(({ label, count }) => ({ label, count }))
}

// Average settlement time (days) for settled claims, grouped by month label
export function analyticsAvgSettlementDays(months = 6): { month: string; avgDays: number }[] {
  const data: { key: string; label: string; totalDays: number; settledCount: number }[] = []
  const nowDate = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = d.toLocaleString("en-IN", { month: "short" }) + " " + d.getFullYear()
    data.push({ key, label, totalDays: 0, settledCount: 0 })
  }
  const bucketIndex = new Map<string, number>()
  data.forEach((b, idx) => bucketIndex.set(b.key, idx))

  for (const c of db.claims) {
    if (c.status !== "settled") continue
    const created = new Date(c.createdAt)
    const updated = new Date(c.updatedAt)
    const days = Math.max(0, Math.round((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
    const key = `${created.getFullYear()}-${created.getMonth()}`
    const idx = bucketIndex.get(key)
    if (idx !== undefined) {
      data[idx].totalDays += days
      data[idx].settledCount += 1
    }
  }

  return data.map((b) => ({
    month: b.label,
    avgDays: b.settledCount ? Math.round(b.totalDays / b.settledCount) : 0,
  }))
}
