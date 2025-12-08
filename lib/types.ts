export type Role = "patient" | "hospital" | "insurer" | "admin"

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: Role
}

export type ClaimStatus = "submitted" | "under_review" | "approved" | "settled" | "rejected"

export interface Claim {
  id: string
  patientId: string
  diagnosis: string
  amount: number
  notes?: string
  documents: string[] // document ids
  status: ClaimStatus
  hospitalVerified: boolean
  insurerDecision?: "approved" | "rejected"
  createdAt: number
  updatedAt: number
}

export interface DocFile {
  id: string
  filename: string
  mimeType: string
  data: Uint8Array
  createdAt: number
  claimId?: string
  uploadedBy: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  createdAt: number
  read: boolean
}

export interface AuditLog {
  id: string
  actorId: string
  action: string
  claimId?: string
  metadata?: Record<string, unknown>
  createdAt: number
}

export type ContractStatus = "pending" | "active" | "completed" | "rejected"

export interface SmartContract {
  id: string
  claimId: string
  policyId: string
  insurerId: string
  hospitalId: string
  createdBy: string
  insurerWallet: string
  hospitalWallet: string
  amount: number
  date: number
  address: string // simulated contract address
  status: ContractStatus
  hash?: string // last deployment or action hash
  lastTxId?: string
  createdAt: number
  updatedAt: number
}
