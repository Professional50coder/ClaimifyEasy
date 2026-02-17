"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Claim = {
  id: string
  patientId?: string
  diagnosis: string
  amount: number
  notes?: string
  status: "submitted" | "under_review" | "approved" | "settled" | "rejected"
  hospitalVerified?: boolean
  insurerDecision?: "approved" | "rejected"
  createdAt: number
  updatedAt: number
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0)

export function AnalyticsSummary({ claims }: { claims: Claim[] }) {
  if (!claims || claims.length === 0) {
    return null
  }

  // Calculate summary metrics
  const totalClaims = claims.length
  const approvedClaims = claims.filter((c) => c.status === "approved").length
  const rejectedClaims = claims.filter((c) => c.status === "rejected").length
  const totalAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0)
  const avgAmount = totalAmount / totalClaims
  const approvalRate = ((approvedClaims / totalClaims) * 100).toFixed(1)

  const StatCard = ({ title, value, subtext, color }: { title: string; value: string | number; subtext?: string; color: string }) => (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 animate-fade-in">
      <StatCard title="Total Claims" value={totalClaims} color="border-l-blue-500" />
      <StatCard
        title="Approved"
        value={approvedClaims}
        subtext={`${approvalRate}% approval rate`}
        color="border-l-green-500"
      />
      <StatCard title="Rejected" value={rejectedClaims} color="border-l-red-500" />
      <StatCard title="Total Amount" value={formatINR(totalAmount)} subtext={`Avg: ${formatINR(avgAmount)}`} color="border-l-purple-500" />
      <StatCard
        title="Pending"
        value={claims.filter((c) => c.status === "submitted" || c.status === "under_review").length}
        color="border-l-orange-500"
      />
    </div>
  )
}
