import { getExecutionResults } from "@/lib/workflow-executor"

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  try {
    const { id } = await params

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing execution ID" }), { status: 400 })
    }

    const results = getExecutionResults(id)

    if (!results) {
      return new Response(
        JSON.stringify({
          error: "Workflow execution not found",
        }),
        { status: 404 },
      )
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Workflow results API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to get workflow results",
      }),
      { status: 500 },
    )
  }
}
