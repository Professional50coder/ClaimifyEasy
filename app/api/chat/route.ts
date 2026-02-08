import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

interface ExplainableResponse {
  role: string
  content: string
  explanation?: {
    reasoning: string[]
    confidence: number
    dataPoints: string[]
  }
}

export async function POST(request: Request) {
  try {
    const { messages, explainable = false } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]?.content || ""

    const systemPrompt = explainable
      ? `You are a helpful assistant for ClaimifyEasy, a medical insurance claims management platform.
You help users with:
- Claim status inquiries
- Policy information
- General questions about the platform
- Guidance on submitting claims
- Settlement timelines

IMPORTANT: When answering, structure your response as follows:
1. Start with your main answer/recommendation
2. Then provide a "Reasoning:" section explaining your logic step-by-step
3. Include any key data points or assumptions you used
4. End with a confidence level (HIGH/MEDIUM/LOW)

This helps users understand how you arrived at your conclusion.

Be concise, friendly, and professional. If you don't know something, suggest contacting support.`
      : `You are a helpful assistant for ClaimifyEasy, a medical insurance claims management platform. 
You help users with:
- Claim status inquiries
- Policy information
- General questions about the platform
- Guidance on submitting claims
- Settlement timelines

Be concise, friendly, and professional. If you don't know something, suggest contacting support.`

    const { text } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      system: systemPrompt,
      prompt: lastMessage,
    })

    const response: ExplainableResponse = {
      role: "assistant",
      content: text,
    }

    // Parse explanation if requested
    if (explainable) {
      const reasoningMatch = text.match(/Reasoning:([\s\S]*?)(?=Confidence|Data Point|$)/i)
      const confidenceMatch = text.match(/Confidence[:\s]+(HIGH|MEDIUM|LOW)/i)
      const dataPointsMatch = text.match(/(?:Data Point|Key Information)s?:([\s\S]*?)(?=Confidence|$)/i)

      if (reasoningMatch || confidenceMatch || dataPointsMatch) {
        response.explanation = {
          reasoning: reasoningMatch
            ? reasoningMatch[1]
                .split("\n")
                .filter((line) => line.trim())
                .map((line) => line.replace(/^[-•]\s*/, "").trim())
            : [],
          confidence:
            {
              HIGH: 0.9,
              MEDIUM: 0.6,
              LOW: 0.3,
            }[confidenceMatch?.[1] || "MEDIUM"] || 0.6,
          dataPoints: dataPointsMatch
            ? dataPointsMatch[1]
                .split("\n")
                .filter((line) => line.trim())
                .map((line) => line.replace(/^[-•]\s*/, "").trim())
            : [],
        }
      }
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate response" }), { status: 500 })
  }
}
