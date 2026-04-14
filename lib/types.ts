export type Role = "patient" | "hospital" | "insurer" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  created_at?: string
  updated_at?: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: Role
  created_at: string
  updated_at: string
}

export type ClaimStatus = "submitted" | "under_review" | "approved" | "settled" | "rejected"

export interface Claim {
  id: string
  patient_id: string
  diagnosis: string
  amount: number
  claim_type?: string
  notes?: string
  documents?: string[] // document ids
  status: ClaimStatus
  hospital_verified?: boolean
  insurer_decision?: "approved" | "rejected"
  status_notes?: string
  created_at?: string
  updated_at?: string
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

export interface ClaimDocument {
  id: string
  claim_id: string
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  uploaded_by: string
  created_at: string
  updated_at: string
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
  user_id: string
  action: string
  details?: Record<string, unknown>
  created_at: string
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

// ============ WORKFLOW TYPES ============

export type WorkflowStage = "document_processing" | "fraud_analysis" | "claims_processing"
export type WorkflowStatus = "pending" | "processing" | "completed" | "failed"

export interface FraudAnalysisResult {
  fraudScore: number // 0-100
  riskLevel: "low" | "medium" | "high" | "critical"
  detectedFlags: string[]
  confidence: number // 0-1
  reasoning: string
  explainability: {
    keyFactors: string[]
    dataPoints: Record<string, unknown>
  }
}

export interface ClaimsProcessingResult {
  approvalPercentage: number // 0-100
  decision: "approved" | "denied" | "under_review"
  reasoning: string
  approvalAmount: number
  decisionDetails: {
    businessRulesApplied: string[]
    policyEligibility: boolean
    claimAmountValidation: boolean
    reviewRequired: boolean
  }
}

export interface WorkflowStageExecution {
  stage: WorkflowStage
  status: WorkflowStatus
  startedAt: number
  completedAt?: number
  error?: string
  output?: Record<string, unknown>
}

export interface WorkflowExecution {
  id: string
  claimId: string
  status: "pending" | "in_progress" | "completed" | "failed"
  currentStage: WorkflowStage
  stages: WorkflowStageExecution[]
  documentProcessingOutput?: {
    claimantInfo: Record<string, unknown>
    incidentDetails: Record<string, unknown>
    claimsAmounts: Record<string, unknown>
  }
  fraudAnalysisResult?: FraudAnalysisResult
  claimsProcessingResult?: ClaimsProcessingResult
  startedAt: number
  completedAt?: number
  createdAt: number
  updatedAt: number
}

export interface WorkflowOutput {
  executionId: string
  claimId: string
  stage: WorkflowStage
  output: Record<string, unknown>
  timestamp: number
}
