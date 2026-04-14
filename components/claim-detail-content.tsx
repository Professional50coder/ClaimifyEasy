"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowDiagram } from "@/components/workflow-diagram"
import { FraudAnalysisResults } from "@/components/fraud-analysis-results"
import { ClaimsDecisionResults } from "@/components/claims-decision-results"
import { Zap, FileText, CheckCircle2, AlertTriangle } from "lucide-react"
import type { WorkflowExecution, FraudAnalysisResult, ClaimsProcessingResult } from "@/lib/types"

interface ClaimDetailPageProps {
  claimId: string
  claim?: {
    id: string
    patientId: string
    diagnosis: string
    amount: number
    status: string
    documents: string[]
    createdAt: number
  }
}

// Demo data for the page
const demoExecution: WorkflowExecution = {
  id: "wf_demo_001",
  claimId: "CLM-2024-001",
  status: "completed",
  currentStage: "claims_processing",
  stages: [
    {
      stage: "document_processing",
      status: "completed",
      startedAt: 1710000000000,
      completedAt: 1710000030000,
    },
    {
      stage: "fraud_analysis",
      status: "completed",
      startedAt: 1710000030000,
      completedAt: 1710000060000,
    },
    {
      stage: "claims_processing",
      status: "completed",
      startedAt: 1710000060000,
      completedAt: 1710000090000,
    },
  ],
  documentProcessingOutput: {
    claimantInfo: { name: "John Doe", policyNumber: "POL-123456" },
    incidentDetails: { dateOfIncident: "2024-03-10", description: "Motor vehicle accident" },
    claimsAmounts: { totalClaimed: 15000, currency: "USD" },
  },
  startedAt: 1710000000000,
  completedAt: 1710000090000,
  createdAt: 1710000000000,
  updatedAt: 1710000090000,
}

const demoFraudResult: FraudAnalysisResult = {
  fraudScore: 25,
  riskLevel: "low",
  detectedFlags: [],
  confidence: 0.92,
  reasoning: "Claim appears legitimate with consistent documentation. No fraud indicators detected.",
  explainability: {
    keyFactors: [
      "Policy is active and in good standing",
      "Incident date aligns with claim submission",
      "Medical costs are within reasonable range for injury type",
      "Claimant history shows no previous fraud indicators",
    ],
    dataPoints: {
      policyStatus: "active",
      claimHistoryRiskScore: 0.1,
      medicalCostReasonableness: 0.95,
    },
  },
}

const demoClaimsResult: ClaimsProcessingResult = {
  approvalPercentage: 95,
  decision: "approved",
  reasoning: "Claim meets all eligibility criteria. Medical necessity confirmed. Approved for full benefit payment.",
  approvalAmount: 14250,
  decisionDetails: {
    businessRulesApplied: [
      "Policy coverage confirmed for injury type",
      "Medical amount within policy limits",
      "Deductible applied: $750",
      "Co-insurance applied: 10%",
    ],
    policyEligibility: true,
    claimAmountValidation: true,
    reviewRequired: false,
  },
}

export function ClaimDetailContent({ claimId, claim }: ClaimDetailPageProps) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(demoExecution)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{claimId}</h1>
          <p className="text-gray-600 mt-1">Claim ID: {claimId}</p>
        </div>
        {execution && (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-300 border">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Workflow Complete
            </Badge>
            <Button variant="outline">Run Workflow</Button>
          </div>
        )}
      </div>

      {/* Claims Overview */}
      {claim && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold">{claim.diagnosis}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Claim Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold">${claim.amount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="capitalize">{claim.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold">{claim.documents.length} files</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      {execution && (
        <Tabs defaultValue="workflow" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="fraud" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Fraud Analysis
            </TabsTrigger>
            <TabsTrigger value="decision" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Decision
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Claims Processing Workflow</CardTitle>
                <CardDescription>Visual representation of AI-powered claim processing pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowDiagram execution={execution} compact={false} />
              </CardContent>
            </Card>

            {/* Timeline */}
            {execution && (
              <Card>
                <CardHeader>
                  <CardTitle>Execution Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {execution.stages.map((stage, idx) => (
                      <div key={stage.stage} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                        <div className="w-32 flex-shrink-0">
                          <p className="text-sm font-semibold capitalize">{stage.stage.replace(/_/g, " ")}</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="capitalize">{stage.status}</Badge>
                            {stage.completedAt && (
                              <span className="text-xs text-gray-600">
                                {Math.round((stage.completedAt - stage.startedAt) / 1000)}s
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {stage.startedAt
                              ? new Date(stage.startedAt).toLocaleTimeString()
                              : "Not started"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Fraud Analysis Tab */}
          <TabsContent value="fraud">
            {execution.fraudAnalysisResult ? (
              <FraudAnalysisResults result={execution.fraudAnalysisResult} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Fraud analysis results not yet available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Decision Tab */}
          <TabsContent value="decision">
            {execution.claimsProcessingResult ? (
              <ClaimsDecisionResults result={execution.claimsProcessingResult} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Claims processing results not yet available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
                <CardDescription>Documents uploaded for this claim</CardDescription>
              </CardHeader>
              <CardContent>
                {claim && claim.documents.length > 0 ? (
                  <div className="space-y-2">
                    {claim.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">Document {idx + 1}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!execution && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Workflow has not been executed for this claim</p>
            <Button>Run Workflow Now</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
