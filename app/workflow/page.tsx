"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WorkflowDiagram } from "@/components/workflow-diagram"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Loader2 } from "lucide-react"

interface WorkflowInfo {
  id: string
  claimId: string
  status: string
  currentStage: string
  progress: number
  createdAt?: number
}

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulated workflow data for demo
  const sampleWorkflows: WorkflowInfo[] = [
    {
      id: "wf_1234567890_abc123",
      claimId: "CLM-001",
      status: "completed",
      currentStage: "claims_processing",
      progress: 100,
      createdAt: Date.now() - 3600000,
    },
    {
      id: "wf_1234567890_def456",
      claimId: "CLM-002",
      status: "in_progress",
      currentStage: "fraud_analysis",
      progress: 67,
      createdAt: Date.now() - 1800000,
    },
    {
      id: "wf_1234567890_ghi789",
      claimId: "CLM-003",
      status: "pending",
      currentStage: "document_processing",
      progress: 0,
      createdAt: Date.now() - 600000,
    },
  ]

  useEffect(() => {
    // Load workflows on mount
    setWorkflows(sampleWorkflows)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-300 border">Completed</Badge>
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 border flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            In Progress
          </Badge>
        )
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300 border">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-300 border">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStageLabel = (stage: string) => {
    return stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Claims Processing Pipeline</h1>
        <p className="text-gray-600 mt-1">Monitor and manage AI-powered claim workflow executions</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {workflows.filter((w) => w.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {workflows.filter((w) => w.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {workflows.filter((w) => w.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Workflow List</TabsTrigger>
          <TabsTrigger value="diagram">Pipeline Diagram</TabsTrigger>
        </TabsList>

        {/* Workflows List Tab */}
        <TabsContent value="list" className="space-y-4">
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={`cursor-pointer transition-colors ${selectedWorkflow === workflow.id ? "border-blue-500 bg-blue-50" : ""}`}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{workflow.claimId}</CardTitle>
                        {getStatusBadge(workflow.status)}
                      </div>
                      <CardDescription>ID: {workflow.id.substring(0, 20)}...</CardDescription>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Stage:</span>
                    <span className="font-medium">{getStageLabel(workflow.currentStage)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{workflow.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {workflows.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No workflow executions yet. Start by running a workflow on a claim.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pipeline Diagram Tab */}
        <TabsContent value="diagram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims Processing Pipeline Architecture</CardTitle>
              <CardDescription>Visual representation of the AI-powered workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowDiagram compact={false} />
            </CardContent>
          </Card>

          {/* Pipeline Description */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stage 1: Document Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>Extracts structured information from multiple document types:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Medical records and receipts</li>
                  <li>Handwritten forms</li>
                  <li>Supporting documentation</li>
                  <li>Witness statements</li>
                </ul>
                <p className="font-semibold text-gray-900 pt-2">Output: Structured Claim Data</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stage 2: Fraud Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>Analyzes claim data for fraud indicators and risk assessment:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pattern detection</li>
                  <li>Anomaly analysis</li>
                  <li>Credit score validation</li>
                  <li>Policy eligibility check</li>
                </ul>
                <p className="font-semibold text-gray-900 pt-2">Output: Fraud Report & Risk Level</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stage 3: Claims Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>Makes final approval decision based on analysis:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Business rules validation</li>
                  <li>Approval percentage calculation</li>
                  <li>Decision making (Approve/Deny/Review)</li>
                  <li>Final report generation</li>
                </ul>
                <p className="font-semibold text-gray-900 pt-2">Output: Approval % & Decision</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
