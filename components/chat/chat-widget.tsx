"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, Send, Brain, Volume2, VolumeX } from "lucide-react"
import { ExplanationDisplay } from "./explanation-display"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showExplanations, setShowExplanations] = useState(false)
  const [messageExplanations, setMessageExplanations] = useState<Record<string, any>>({})
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { speak: ttsSpeak, isPlaying, isLoading: ttsLoading, stop: ttsStop } = useTextToSpeech()
  const { messages, input, setInput, append, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm your ClaimifyEasy assistant powered by Grok AI. I can help you with claim status, policy information, and general questions. What can I help you with today?",
      },
    ],
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSpeakMessage = async (messageId: string, text: string) => {
    if (isPlaying && playingMessageId === messageId) {
      ttsStop()
      setPlayingMessageId(null)
    } else {
      setPlayingMessageId(messageId)
      try {
        await ttsSpeak(text)
      } catch (error) {
        console.error("[v0] Error speaking message:", error)
        setPlayingMessageId(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message first
    const userMessage = input
    setInput("")
    
    // Send message with explainable flag
    const messageId = `msg-${Date.now()}`
    await append({
      role: "user",
      content: userMessage,
      id: messageId,
    })

    // If explanations are enabled, fetch with explainable flag
    if (showExplanations) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages,
              { role: "user", content: userMessage },
            ],
            explainable: true,
          }),
        })
        const data = await response.json()
        if (data.explanation) {
          setMessageExplanations((prev) => ({
            ...prev,
            [messageId]: data.explanation,
          }))
        }
      } catch (error) {
        console.error("[v0] Error fetching explanation:", error)
      }
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-shadow animate-float"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 max-h-[500px] flex flex-col shadow-2xl animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4 bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Grok Assistant (xAI)</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className={`hover:bg-primary/80 rounded p-1 transition-colors ${showExplanations ? "bg-primary/80" : ""}`}
                title={showExplanations ? "Disable explanations" : "Enable explanations"}
                aria-label="Toggle explanations"
              >
                <Brain className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary/80 rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => {
              const msgId = msg.id || `msg-${idx}`
              return (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div className={`max-w-xs ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className="flex items-end gap-2">
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user" ? "bg-primary text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleSpeakMessage(msgId, msg.content)}
                          disabled={ttsLoading}
                          className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
                          title={playingMessageId === msgId && isPlaying ? "Stop" : "Read aloud"}
                          aria-label={playingMessageId === msgId && isPlaying ? "Stop reading" : "Read message aloud"}
                        >
                          {playingMessageId === msgId && isPlaying ? (
                            <VolumeX className="h-4 w-4 text-primary" />
                          ) : (
                            <Volume2 className="h-4 w-4 text-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                    {msg.role === "assistant" && showExplanations && messageExplanations[msgId] && (
                      <ExplanationDisplay explanation={messageExplanations[msgId]} />
                    )}
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-lg px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-foreground animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-foreground animate-bounce delay-100" />
                    <div className="h-2 w-2 rounded-full bg-foreground animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="px-3">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  )
}
