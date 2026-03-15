"use client"

import type { WorkflowExecution } from "@/lib/types"
import { CheckCircle2, Clock, AlertCircle, FileText, AlertTriangle, CheckCheck } from "lucide-react"

interface WorkflowDiagramProps {
  execution?: WorkflowExecution
  compact?: boolean
}

export function WorkflowDiagram({ execution, compact = false }: WorkflowDiagramProps) {
  const stages = [
    {
      id: "document_processing",
      label: "Document Processing",
      description: "Extract & parse documents",
      inputs: ["Medical Records", "Forms", "Receipts"],
      outputs: ["Claim Data"],
      icon: FileText,
    },
    {
      id: "fraud_analysis",
      label: "Fraud Analysis",
      description: "Detect fraud patterns",
      inputs: ["Claim Data", "Policy Info"],
      outputs: ["Fraud Report", "Risk Level"],
      icon: AlertTriangle,
    },
    {
      id: "claims_processing",
      label: "Claims Processing",
      description: "Generate decision",
      inputs: ["Fraud Analysis", "Rules"],
      outputs: ["Approval %", "Decision"],
      icon: CheckCheck,
    },
  ]

  const getStageStatus = (stageId: string) => {
    if (!execution) return "pending"
    const stage = execution.stages.find((s) => s.stage === stageId)
    return stage?.status || "pending"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "processing":
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(getStageStatus(stage.id))}
                  <span className="text-xs font-medium text-gray-700">{stage.label}</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      getStageStatus(stage.id) === "completed"
                        ? "bg-green-500"
                        : getStageStatus(stage.id) === "processing"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                    }`}
                    style={{
                      width: getStageStatus(stage.id) === "completed" ? "100%" : "50%",
                    }}
                  />
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div className="w-6 h-0.5 bg-gray-300 -mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col md:flex-row items-stretch gap-6">
        {/* Document Inputs */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 w-40">
            <p className="font-semibold text-sm text-green-900 mb-2">Input Documents</p>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Medical Records</li>
              <li>• Handwritten Forms</li>
              <li>• Receipts & Bills</li>
              <li>• Witness Statements</li>
            </ul>
          </div>
          <div className="text-green-600">▼</div>
        </div>

        {/* Stage 1: Document Processing */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className={`border-2 rounded-lg p-6 w-full text-center transition-all ${
              getStageStatus("document_processing") === "completed"
                ? "border-green-500 bg-green-50"
                : getStageStatus("document_processing") === "processing"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {getStatusIcon(getStageStatus("document_processing"))}
              <h3 className="font-bold text-sm">AI Document Processing</h3>
            </div>
            <p className="text-xs text-gray-600 mb-2">Extract structured information</p>
            <div className="text-xs text-gray-500">
              <p className="font-medium">Processing:</p>
              <ul className="mt-1 space-y-0.5">
                <li>• OCR (Optical Character Recognition)</li>
                <li>• Document Parsing</li>
                <li>• Image Analysis</li>
              </ul>
            </div>
          </div>
          <div className="text-blue-600 my-3">▼</div>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 w-full text-center text-xs">
            <p className="font-semibold text-blue-900">Output</p>
            <p className="text-blue-700">Claim Data</p>
          </div>
        </div>

        <div className="hidden md:block text-gray-400">→</div>

        {/* Stage 2: Fraud Analysis */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className={`border-2 rounded-lg p-6 w-full text-center transition-all ${
              getStageStatus("fraud_analysis") === "completed"
                ? "border-green-500 bg-green-50"
                : getStageStatus("fraud_analysis") === "processing"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {getStatusIcon(getStageStatus("fraud_analysis"))}
              <h3 className="font-bold text-sm">AI Fraud Analysis</h3>
            </div>
            <p className="text-xs text-gray-600 mb-2">Detect fraud patterns & risks</p>
            <div className="text-xs text-gray-500">
              <p className="font-medium">Inputs:</p>
              <ul className="mt-1 space-y-0.5">
                <li>• Structured Data</li>
                <li>• Credit Scores</li>
                <li>• Policy Info</li>
              </ul>
            </div>
          </div>
          <div className="text-red-600 my-3">▼</div>
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 w-full text-center text-xs">
            <p className="font-semibold text-red-900">Outputs</p>
            <p className="text-red-700 text-xs">Fraud Report • Risk Level</p>
          </div>
        </div>

        <div className="hidden md:block text-gray-400">→</div>

        {/* Stage 3: Claims Processing */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className={`border-2 rounded-lg p-6 w-full text-center transition-all ${
              getStageStatus("claims_processing") === "completed"
                ? "border-green-500 bg-green-50"
                : getStageStatus("claims_processing") === "processing"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {getStatusIcon(getStageStatus("claims_processing"))}
              <h3 className="font-bold text-sm">AI Claims Processing</h3>
            </div>
            <p className="text-xs text-gray-600 mb-2">Generate final decision</p>
            <div className="text-xs text-gray-500">
              <p className="font-medium">Processing:</p>
              <ul className="mt-1 space-y-0.5">
                <li>• Business Rules Check</li>
                <li>• Approval Calculation</li>
                <li>• Decision Making</li>
              </ul>
            </div>
          </div>
          <div className="text-yellow-600 my-3">▼</div>
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 w-full text-center text-xs">
            <p className="font-semibold text-yellow-900">Final Outputs</p>
            <p className="text-yellow-700 text-xs">Approval % • Decision • Report</p>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      {execution && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-semibold capitalize">{execution.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Current Stage</p>
              <p className="font-semibold capitalize">{execution.currentStage.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-gray-600">Completed</p>
              <p className="font-semibold">
                {execution.stages.filter((s) => s.status === "completed").length}/{execution.stages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
