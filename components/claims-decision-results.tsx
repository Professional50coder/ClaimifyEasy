"use client"

import type { ClaimsProcessingResult } from "@/lib/types"
import { CheckCircle2, XCircle, Clock, DollarSign, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ClaimsDecisionResultsProps {
  result: ClaimsProcessingResult
}

export function ClaimsDecisionResults({ result }: ClaimsDecisionResultsProps) {
  const getDecisionIcon = () => {
    switch (result.decision) {
      case "approved":
        return <CheckCircle2 className="w-8 h-8 text-green-600" />
      case "denied":
        return <XCircle className="w-8 h-8 text-red-600" />
      case "under_review":
        return <Clock className="w-8 h-8 text-yellow-600" />
      default:
        return <Clock className="w-8 h-8 text-gray-600" />
    }
  }

  const getDecisionColor = () => {
    switch (result.decision) {
      case "approved":
        return "bg-green-50 border-green-200"
      case "denied":
        return "bg-red-50 border-red-200"
      case "under_review":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getDecisionBadgeColor = () => {
    switch (result.decision) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300"
      case "denied":
        return "bg-red-100 text-red-800 border-red-300"
      case "under_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claims Processing Decision</CardTitle>
        <CardDescription>Final approval decision and claim amount</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Decision */}
        <div className={`border-2 rounded-lg p-6 text-center space-y-4 ${getDecisionColor()}`}>
          <div className="flex justify-center">{getDecisionIcon()}</div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Decision</h3>
            <Badge className={`${getDecisionBadgeColor()} capitalize border text-base py-1 px-3`}>
              {result.decision === "under_review" ? "Under Review" : result.decision}
            </Badge>
          </div>
        </div>

        {/* Approval Percentage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Approval Percentage</label>
            <span className="text-3xl font-bold text-blue-600">{Math.round(result.approvalPercentage)}%</span>
          </div>
          <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
            <div
              className={`h-full transition-all flex items-center justify-center text-white text-sm font-bold ${
                result.approvalPercentage >= 75
                  ? "bg-green-500"
                  : result.approvalPercentage >= 50
                    ? "bg-yellow-500"
                    : result.approvalPercentage > 0
                      ? "bg-orange-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${result.approvalPercentage}%` }}
            >
              {result.approvalPercentage > 0 && `${Math.round(result.approvalPercentage)}%`}
            </div>
          </div>
        </div>

        {/* Approval Amount */}
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <label className="text-sm font-semibold text-green-900">Approved Amount</label>
          </div>
          <span className="text-2xl font-bold text-green-700">${result.approvalAmount.toFixed(2)}</span>
        </div>

        {/* Business Rules Applied */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Business Rules Applied</label>
          <div className="space-y-2">
            {result.decisionDetails.businessRulesApplied.length > 0 ? (
              result.decisionDetails.businessRulesApplied.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-800">{rule}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No specific rules applied</p>
            )}
          </div>
        </div>

        {/* Decision Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 border border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Policy Eligible</p>
            <div className="flex justify-center">
              {result.decisionDetails.policyEligibility ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Amount Valid</p>
            <div className="flex justify-center">
              {result.decisionDetails.claimAmountValidation ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Manual Review</p>
            <div className="flex justify-center">
              {result.decisionDetails.reviewRequired ? (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
          <label className="text-sm font-semibold text-gray-900">Decision Reasoning</label>
          <p className="text-sm text-gray-700">{result.reasoning}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
