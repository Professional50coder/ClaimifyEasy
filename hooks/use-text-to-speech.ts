'use client';

import { useState, useCallback, useRef } from "react"

interface TextToSpeechOptions {
  voiceId?: string
  model?: string
}

interface TextToSpeechState {
  isLoading: boolean
  isPlaying: boolean
  error: string | null
}

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
  const [state, setState] = useState<TextToSpeechState>({
    isLoading: false,
    isPlaying: false,
    error: null,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setState((prev) => ({
          ...prev,
          error: "Text cannot be empty",
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            voiceId: options.voiceId || "JBFqnCBsd6RMkjVDRZzb",
            model: options.model || "eleven_multilingual_v2",
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate audio")
        }

        const data = await response.json()

        // Create or reuse audio element
        if (!audioRef.current) {
          audioRef.current = new Audio()
        }

        audioRef.current.src = data.audio

        // Set up event listeners
        audioRef.current.onplay = () => {
          setState((prev) => ({
            ...prev,
            isPlaying: true,
          }))
        }

        audioRef.current.onended = () => {
          setState((prev) => ({
            ...prev,
            isPlaying: false,
          }))
        }

        audioRef.current.onerror = () => {
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            error: "Failed to play audio",
          }))
        }

        // Play the audio
        await audioRef.current.play()

        setState((prev) => ({
          ...prev,
          isLoading: false,
        }))
      } catch (error) {
        console.error("[v0] Text-to-speech error:", error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        }))
      }
    },
    [options],
  )

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setState((prev) => ({
        ...prev,
        isPlaying: false,
      }))
    }
  }, [])

  return {
    ...state,
    speak,
    stop,
  }
}
