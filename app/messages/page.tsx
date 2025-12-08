"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Search } from "lucide-react"
import { LazySection } from "@/components/lazy-section"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  isOwn: boolean
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Support Team",
      content: "Hello! How can we help you today?",
      timestamp: new Date(Date.now() - 3600000),
      isOwn: false,
    },
    {
      id: "2",
      sender: "You",
      content: "I have a question about my claim status",
      timestamp: new Date(Date.now() - 3000000),
      isOwn: true,
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: input,
      timestamp: new Date(),
      isOwn: true,
    }

    setMessages([...messages, newMessage])
    setInput("")

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "Support Team",
          content: "Thank you for your message. We'll get back to you shortly.",
          timestamp: new Date(),
          isOwn: false,
        },
      ])
    }, 1000)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <LazySection>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">Chat with support and team members</p>
          </div>
        </LazySection>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations list */}
          <LazySection className="lg:col-span-1" delay={100}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9" />
                </div>
                <div className="space-y-2">
                  {["Support Team", "Claims Manager", "Finance Team"].map((name) => (
                    <button
                      key={name}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">Last message...</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </LazySection>

          {/* Chat area */}
          <LazySection className="lg:col-span-3" delay={200}>
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  Support Team
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="border-t p-4 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} size="icon">
                  <Send size={18} />
                </Button>
              </div>
            </Card>
          </LazySection>
        </div>
      </main>
    </div>
  )
}
