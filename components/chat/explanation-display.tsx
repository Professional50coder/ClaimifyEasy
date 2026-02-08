"use client"

import { useState } from "react"
import { ChevronDown, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExplanationProps {
  explanation?: {
    reasoning: string[]
    confidence: number
    dataPoints: string[]
  }
}

export function ExplanationDisplay({ explanation }: ExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!explanation || (!explanation.reasoning.length && !explanation.dataPoints.length)) {
    return null
  }

  const confidenceColor =
    explanation.confidence >= 0.8 ? "text-green-600" : explanation.confidence >= 0.6 ? "text-yellow-600" : "text-orange-600"
  const confidenceLabel =
    explanation.confidence >= 0.8 ? "High" : explanation.confidence >= 0.6 ? "Medium" : "Low"

  return (
    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 text-left font-medium text-blue-900 hover:text-blue-700 transition-colors"
      >
        <Lightbulb className="h-4 w-4 flex-shrink-0" />
        <span>AI Reasoning</span>
        <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Confidence Level */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Confidence:</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    explanation.confidence >= 0.8
                      ? "bg-green-500"
                      : explanation.confidence >= 0.6
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                  }`}
                  style={{ width: `${explanation.confidence * 100}%` }}
                />
              </div>
              <span className={`font-medium text-xs ${confidenceColor}`}>{confidenceLabel}</span>
            </div>
          </div>

          {/* Reasoning Steps */}
          {explanation.reasoning.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Reasoning Steps:</h4>
              <ul className="space-y-1 ml-3">
                {explanation.reasoning.map((step, idx) => (
                  <li key={idx} className="flex gap-2 text-gray-700">
                    <span className="font-semibold text-blue-600">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Points */}
          {explanation.dataPoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Key Information Used:</h4>
              <ul className="space-y-1 ml-3">
                {explanation.dataPoints.map((point, idx) => (
                  <li key={idx} className="flex gap-2 text-gray-700">
                    <span className="text-blue-600">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
