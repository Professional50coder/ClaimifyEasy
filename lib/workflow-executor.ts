import type { WorkflowExecution, WorkflowStageExecution } from "./types"
import { documentProcessingAgent, fraudAnalysisAgent, claimsProcessingAgent } from "./workflow-agents"

// In-memory store for workflow executions (replace with database in production)
const workflowExecutions = new Map<string, WorkflowExecution>()

/**
 * Create a new workflow execution
 */
export function createWorkflowExecution(claimId: string): WorkflowExecution {
  const execution: WorkflowExecution = {
    id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    claimId,
    status: "pending",
    currentStage: "document_processing",
    stages: [
      { stage: "document_processing", status: "pending", startedAt: 0 },
      { stage: "fraud_analysis", status: "pending", startedAt: 0 },
      { stage: "claims_processing", status: "pending", startedAt: 0 },
    ],
    startedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  workflowExecutions.set(execution.id, execution)
  return execution
}

/**
 * Get workflow execution by ID
 */
export function getWorkflowExecution(executionId: string): WorkflowExecution | undefined {
  return workflowExecutions.get(executionId)
}

/**
 * Update stage status
 */
function updateStageStatus(
  execution: WorkflowExecution,
  stage: string,
  status: "pending" | "processing" | "completed" | "failed",
  output?: Record<string, unknown>,
  error?: string,
): void {
  const stageExecution = execution.stages.find((s) => s.stage === stage)
  if (stageExecution) {
    if (status === "processing") {
      stageExecution.status = "processing"
      stageExecution.startedAt = Date.now()
    } else if (status === "completed") {
      stageExecution.status = "completed"
      stageExecution.completedAt = Date.now()
      stageExecution.output = output
    } else if (status === "failed") {
      stageExecution.status = "failed"
      stageExecution.completedAt = Date.now()
      stageExecution.error = error
    }
  }

  // Update overall status
  const allCompleted = execution.stages.every((s) => s.status === "completed")
  const anyFailed = execution.stages.some((s) => s.status === "failed")

  if (anyFailed) {
    execution.status = "failed"
  } else if (allCompleted) {
    execution.status = "completed"
  } else {
    execution.status = "in_progress"
  }

  execution.updatedAt = Date.now()
}

/**
 * Execute the complete workflow
 */
export async function executeWorkflow(
  execution: WorkflowExecution,
  documents: { text: string; type: string }[],
): Promise<WorkflowExecution> {
  try {
    // Stage 1: Document Processing
    console.log("[v0] Starting document processing stage...")
    updateStageStatus(execution, "document_processing", "processing")

    const documentOutput = await documentProcessingAgent(documents)
    execution.documentProcessingOutput = documentOutput
    updateStageStatus(execution, "document_processing", "completed", documentOutput)

    // Stage 2: Fraud Analysis
    console.log("[v0] Starting fraud analysis stage...")
    updateStageStatus(execution, "fraud_analysis", "processing")

    const fraudResult = await fraudAnalysisAgent(documentOutput)
    execution.fraudAnalysisResult = fraudResult
    updateStageStatus(execution, "fraud_analysis", "completed", fraudResult as unknown as Record<string, unknown>)

    // Stage 3: Claims Processing
    console.log("[v0] Starting claims processing stage...")
    updateStageStatus(execution, "claims_processing", "processing")

    const claimsResult = await claimsProcessingAgent(documentOutput, fraudResult)
    execution.claimsProcessingResult = claimsResult
    updateStageStatus(execution, "claims_processing", "completed", claimsResult as unknown as Record<string, unknown>)

    execution.completedAt = Date.now()
    execution.currentStage = "claims_processing"
    workflowExecutions.set(execution.id, execution)

    console.log("[v0] Workflow execution completed successfully")
    return execution
  } catch (error) {
    console.error("[v0] Workflow execution failed:", error)
    execution.status = "failed"
    execution.completedAt = Date.now()
    workflowExecutions.set(execution.id, execution)
    throw error
  }
}

/**
 * Get execution status
 */
export function getExecutionStatus(executionId: string): {
  id: string
  status: string
  currentStage: string
  progress: number
  stages: Array<{
    stage: string
    status: string
    completedAt?: number
  }>
} | null {
  const execution = workflowExecutions.get(executionId)
  if (!execution) return null

  const completedStages = execution.stages.filter((s) => s.status === "completed").length
  const progress = (completedStages / execution.stages.length) * 100

  return {
    id: execution.id,
    status: execution.status,
    currentStage: execution.currentStage,
    progress,
    stages: execution.stages.map((s) => ({
      stage: s.stage,
      status: s.status,
      completedAt: s.completedAt,
    })),
  }
}

/**
 * Get all execution results
 */
export function getExecutionResults(executionId: string) {
  const execution = workflowExecutions.get(executionId)
  if (!execution) return null

  return {
    executionId: execution.id,
    claimId: execution.claimId,
    status: execution.status,
    documentProcessing: execution.documentProcessingOutput,
    fraudAnalysis: execution.fraudAnalysisResult,
    claimsProcessing: execution.claimsProcessingResult,
    timeline: {
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      duration: execution.completedAt ? execution.completedAt - execution.startedAt : 0,
    },
  }
}
