import { ElevenLabsClient } from "elevenlabs"
import type { NextRequest } from "next/server"

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb", model = "eleven_multilingual_v2" } = await request.json()

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), { status: 400 })
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: "ElevenLabs API key not configured" }), { status: 500 })
    }

    console.log("[v0] Generating audio for text:", text.substring(0, 50))

    const audio = await client.textToSpeech.convert({
      text: text,
      voice_id: voiceId,
      model_id: model,
      output_format: "mp3_44100_128",
    })

    // Convert audio buffer to base64
    const audioBuffer = Buffer.from(audio)
    const audioBase64 = audioBuffer.toString("base64")

    return new Response(
      JSON.stringify({
        success: true,
        audio: `data:audio/mp3;base64,${audioBase64}`,
        text: text,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Text-to-speech error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    )
  }
}
