"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap } from "lucide-react"

interface WorkflowOverviewProps {
  title?: string
  description?: string
}

export function WorkflowOverview({ title = "Active Workflows", description = "Recently executed claim processing workflows" }: WorkflowOverviewProps) {
  // Demo data - in production this would come from an API
  const activeWorkflows = [
    {
      id: "wf_1",
      claimId: "CLM-2024-001",
      stage: "claims_processing",
      progress: 100,
      status: "completed",
    },
    {
      id: "wf_2",
      claimId: "CLM-2024-002",
      stage: "fraud_analysis",
      progress: 67,
      status: "in_progress",
    },
    {
      id: "wf_3",
      claimId: "CLM-2024-003",
      stage: "document_processing",
      progress: 33,
      status: "processing",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      document_processing: "Document Processing",
      fraud_analysis: "Fraud Analysis",
      claims_processing: "Claims Processing",
    }
    return labels[stage] || stage
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Link href="/workflow">
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{workflow.claimId}</span>
                  <Badge className={`${getStatusColor(workflow.status)} border capitalize text-xs`}>
                    {workflow.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{getStageLabel(workflow.stage)}</p>
              </div>

              <div className="w-24 flex-shrink-0">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">{workflow.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        workflow.status === "completed"
                          ? "bg-green-500"
                          : workflow.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }`}
                      style={{ width: `${workflow.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link href="/workflow">
            <Button className="w-full" variant="secondary">
              View Full Pipeline Dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
