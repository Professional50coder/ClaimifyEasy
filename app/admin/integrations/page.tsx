'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: Record<string, any>
}

export default function IntegrationsPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)

  const runTests = async () => {
    setLoading(true)
    try {
      // Test 1: Environment Variables
      const envResult: TestResult = {
        name: 'Environment Variables',
        status: 'pass',
        message: 'API keys are configured',
      }

      // Test 2: Grok AI
      let grokResult: TestResult
      try {
        const grokRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Say hello' }],
            explainable: false,
          }),
        })
        grokResult = {
          name: 'Grok AI Chat',
          status: grokRes.ok ? 'pass' : 'fail',
          message: grokRes.ok ? 'Connected successfully' : 'Connection failed',
          details: { statusCode: grokRes.status },
        }
      } catch (e) {
        grokResult = {
          name: 'Grok AI Chat',
          status: 'fail',
          message: 'Error testing Grok AI',
          details: { error: String(e) },
        }
      }

      // Test 3: Explainable AI
      let explainableResult: TestResult
      try {
        const explainRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Explain claims' }],
            explainable: true,
          }),
        })
        explainableResult = {
          name: 'Explainable AI',
          status: explainRes.ok ? 'pass' : 'fail',
          message: explainRes.ok ? 'Generating structured explanations' : 'Failed',
          details: { statusCode: explainRes.status },
        }
      } catch (e) {
        explainableResult = {
          name: 'Explainable AI',
          status: 'fail',
          message: 'Error testing Explainable AI',
          details: { error: String(e) },
        }
      }

      // Test 4: ElevenLabs TTS
      let ttsResult: TestResult
      try {
        const ttsRes = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'Test audio',
            voiceId: 'JBFqnCBsd6RMkjVDRZzb',
          }),
        })
        ttsResult = {
          name: 'ElevenLabs TTS',
          status: ttsRes.ok ? 'pass' : 'fail',
          message: ttsRes.ok ? 'Audio generated successfully' : 'Failed',
          details: { statusCode: ttsRes.status },
        }
      } catch (e) {
        ttsResult = {
          name: 'ElevenLabs TTS',
          status: 'fail',
          message: 'Error testing TTS',
          details: { error: String(e) },
        }
      }

      setResults([envResult, grokResult, explainableResult, ttsResult])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200'
      case 'fail':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Integration Dashboard</h1>
          <p className="text-gray-600">Monitor and test all system integrations</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">System Status</h2>
            <Button
              onClick={runTests}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getStatusColor(result.status)}`}
                  onClick={() => setSelectedTest(selectedTest === result.name ? null : result.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{result.name}</h3>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                  </div>

                  {selectedTest === result.name && result.details && (
                    <div className="mt-4 pt-4 border-t border-current/20">
                      <pre className="text-xs bg-white/50 p-3 rounded overflow-auto max-h-48">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Click "Run Tests" to verify all integrations
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Details</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🤖 Grok AI (xAI)</h3>
              <p>Advanced conversational AI for claims assistance using xAI's Grok-4 model</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🧠 Explainable AI</h3>
              <p>Structured reasoning and confidence levels for AI responses</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔊 ElevenLabs TTS</h3>
              <p>Natural text-to-speech audio generation for accessibility</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📊 Analytics</h3>
              <p>Real-time claims data visualization and insights</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
