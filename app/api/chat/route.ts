import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]?.content || ""

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `You are a helpful assistant for ClaimifyEasy, a medical insurance claims management platform. 
You help users with:
- Claim status inquiries
- Policy information
- General questions about the platform
- Guidance on submitting claims
- Settlement timelines

Be concise, friendly, and professional. If you don't know something, suggest contacting support.`,
      prompt: lastMessage,
    })

    return new Response(
      JSON.stringify({
        role: "assistant",
        content: text,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate response" }), { status: 500 })
  }
}
