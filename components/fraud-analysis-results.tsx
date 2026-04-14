"use client"

import type { FraudAnalysisResult } from "@/lib/types"
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FraudAnalysisResultsProps {
  result: FraudAnalysisResult
}

export function FraudAnalysisResults({ result }: FraudAnalysisResultsProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "high":
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getRiskIcon(result.riskLevel)}
          Fraud Analysis Report
        </CardTitle>
        <CardDescription>AI-powered fraud detection and risk assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score Gauge */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Fraud Risk Score</label>
            <span className="text-2xl font-bold">{Math.round(result.fraudScore)}/100</span>
          </div>
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                result.fraudScore < 30
                  ? "bg-green-500"
                  : result.fraudScore < 50
                    ? "bg-yellow-500"
                    : result.fraudScore < 75
                      ? "bg-orange-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${result.fraudScore}%` }}
            />
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold">Risk Level:</label>
          <Badge className={`${getRiskColor(result.riskLevel)} capitalize border`}>
            {result.riskLevel}
          </Badge>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-900">Confidence Level</span>
          <span className="text-lg font-bold text-blue-700">{Math.round(result.confidence * 100)}%</span>
        </div>

        {/* Detected Flags */}
        {result.detectedFlags.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold">Detected Flags</label>
            <div className="space-y-2">
              {result.detectedFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Factors */}
        {result.explainability.keyFactors.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold">Key Factors Analyzed</label>
            <ul className="space-y-1">
              {result.explainability.keyFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reasoning */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
          <label className="text-sm font-semibold text-gray-900">Analysis Reasoning</label>
          <p className="text-sm text-gray-700">{result.reasoning}</p>
        </div>

        {/* Explainability Data */}
        {Object.keys(result.explainability.dataPoints).length > 0 && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <label className="text-sm font-semibold text-gray-900">Additional Data Points</label>
            <div className="text-xs text-gray-600 space-y-1">
              {Object.entries(result.explainability.dataPoints).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="font-medium">{key}:</span>
                  <span>{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
