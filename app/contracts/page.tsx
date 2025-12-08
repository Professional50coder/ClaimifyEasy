import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LazySection } from "@/components/lazy-section"
import { Plus, Shield, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { signOutAction } from "./actions"

// Sample smart contracts data
const sampleContracts = [
  {
    id: "SC-001",
    claimId: "CLM-2024-001",
    policyId: "POL-12345",
    insurerId: "Insurer A",
    hospitalId: "Hospital A",
    status: "active",
    amount: 500000,
    createdAt: "2024-01-15",
    deployedAt: "2024-01-16",
    blockNumber: 18500001,
    gasUsed: 125000,
  },
  {
    id: "SC-002",
    claimId: "CLM-2024-002",
    policyId: "POL-12346",
    insurerId: "Insurer B",
    hospitalId: "Hospital B",
    status: "pending",
    amount: 750000,
    createdAt: "2024-01-18",
    deployedAt: null,
    blockNumber: null,
    gasUsed: null,
  },
  {
    id: "SC-003",
    claimId: "CLM-2024-003",
    policyId: "POL-12347",
    insurerId: "Insurer A",
    hospitalId: "Hospital C",
    status: "completed",
    amount: 350000,
    createdAt: "2024-01-10",
    deployedAt: "2024-01-11",
    blockNumber: 18450001,
    gasUsed: 98500,
  },
  {
    id: "SC-004",
    claimId: "CLM-2024-004",
    policyId: "POL-12348",
    insurerId: "Insurer C",
    hospitalId: "Hospital D",
    status: "rejected",
    amount: 600000,
    createdAt: "2024-01-12",
    deployedAt: "2024-01-13",
    blockNumber: 18470001,
    gasUsed: 75000,
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "#10B981"
    case "pending":
      return "#F59E0B"
    case "completed":
      return "#0066FF"
    case "rejected":
      return "#EF4444"
    default:
      return "#8B5CF6"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return <CheckCircle size={16} className="text-green-500" />
    case "pending":
      return <Clock size={16} className="text-orange-500" />
    case "completed":
      return <CheckCircle size={16} className="text-blue-500" />
    case "rejected":
      return <AlertCircle size={16} className="text-red-500" />
    default:
      return <Shield size={16} />
  }
}

export default async function ContractsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "patient") {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userName={user.name} userRole={user.role} onSignOut={signOutAction} />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                You don't have permission to access Smart Contracts. This feature is only available to admin and insurer
                staff.
              </p>
              <Link href="/dashboard" className="text-primary hover:underline text-sm font-medium">
                ← Back to Dashboard
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.name} userRole={user.role} onSignOut={signOutAction} />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <LazySection>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield size={32} className="text-primary" />
                Smart Contracts
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Manage blockchain-based insurance contracts</p>
            </div>
            <div className="flex gap-2">
              <Link href="/contracts/new">
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus size={18} />
                  Deploy Contract
                </Button>
              </Link>
              <Link href="/contracts/examples">
                <Button variant="outline" className="gap-2 bg-transparent">
                  Code Examples
                </Button>
              </Link>
            </div>
          </div>
        </LazySection>

        <LazySection delay={100} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="animate-slide-up delay-100 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-3xl font-bold text-foreground mt-2">{sampleContracts.length}</p>
                <p className="text-xs text-accent mt-1">All time</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up delay-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {sampleContracts.filter((c) => c.status === "active").length}
                </p>
                <p className="text-xs text-accent mt-1">Running now</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up delay-300 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {sampleContracts.filter((c) => c.status === "completed").length}
                </p>
                <p className="text-xs text-accent mt-1">Settled</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up delay-400 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Value Locked</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  ₹{(sampleContracts.reduce((sum, c) => sum + c.amount, 0) / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-accent mt-1">In contracts</p>
              </div>
            </CardContent>
          </Card>
        </LazySection>

        <LazySection delay={200}>
          <Card className="animate-fade-in delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                All Smart Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Contract ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Claim ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Policy ID</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                      <th className="text-right py-3 px-4 font-semibold">Gas Used</th>
                      <th className="text-center py-3 px-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleContracts.map((contract, idx) => (
                      <tr
                        key={contract.id}
                        className="border-b border-border hover:bg-muted transition-colors animate-fade-in"
                        style={{ animationDelay: `${300 + idx * 100}ms` }}
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-primary">{contract.id}</td>
                        <td className="py-3 px-4 font-mono">{contract.claimId}</td>
                        <td className="py-3 px-4">{contract.policyId}</td>
                        <td className="py-3 px-4 text-right font-semibold">₹{contract.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getStatusIcon(contract.status)}
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold text-white capitalize"
                              style={{ backgroundColor: getStatusColor(contract.status) }}
                            >
                              {contract.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {contract.gasUsed ? `${(contract.gasUsed / 1000).toFixed(0)}k` : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/contracts/${contract.id}`}>
                            <Button size="sm" variant="outline" className="text-xs bg-transparent">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </LazySection>

        <LazySection delay={300} className="mt-6">
          <Card className="animate-fade-in delay-300 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                Smart Contract Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Smart contracts automate insurance claim settlements using blockchain technology. Each contract ensures
                transparent, immutable, and tamper-proof claim processing with real-time settlement capabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-border">
                  <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                    <Shield size={16} /> Transparency
                  </p>
                  <p className="text-xs text-muted-foreground">All transactions recorded on blockchain</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-border">
                  <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                    <CheckCircle size={16} /> Security
                  </p>
                  <p className="text-xs text-muted-foreground">Cryptographic verification prevents fraud</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-border">
                  <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                    <TrendingUp size={16} /> Automation
                  </p>
                  <p className="text-xs text-muted-foreground">Instant settlement when conditions met</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-border">
                  <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                    <AlertCircle size={16} /> Auditability
                  </p>
                  <p className="text-xs text-muted-foreground">Complete audit trail of all actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </LazySection>
      </main>
    </div>
  )
}
