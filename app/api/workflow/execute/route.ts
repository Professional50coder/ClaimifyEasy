import { createWorkflowExecution, executeWorkflow } from "@/lib/workflow-executor"

export async function POST(request: Request) {
  try {
    const { claimId, documents } = await request.json()

    if (!claimId) {
      return new Response(JSON.stringify({ error: "Missing claimId" }), { status: 400 })
    }

    if (!documents || !Array.isArray(documents)) {
      return new Response(
        JSON.stringify({
          error: "Missing or invalid documents array",
        }),
        { status: 400 },
      )
    }

    // Create workflow execution record
    const execution = createWorkflowExecution(claimId)

    // Execute workflow asynchronously (don't wait for completion)
    executeWorkflow(execution, documents).catch((error) => {
      console.error("[v0] Workflow execution failed:", error)
    })

    // Return execution ID immediately
    return new Response(
      JSON.stringify({
        success: true,
        executionId: execution.id,
        claimId,
        status: execution.status,
        message: "Workflow execution started",
      }),
      {
        status: 202, // Accepted - processing in background
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("[v0] Workflow execute API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to start workflow execution",
        details: String(error),
      }),
      { status: 500 },
    )
  }
}
