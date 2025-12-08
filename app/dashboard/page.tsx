import { getCurrentUser, signOut } from "@/lib/auth"
import { kpis, analyticsByStatus } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatINR } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { KPICard } from "@/components/kpi-card"
import { GaugeChart } from "@/components/gauge-chart"
import { LazySection } from "@/components/lazy-section"
import { Users, FileCheck, AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
          </CardHeader>
          <CardContent>
            Please{" "}
            <Link href="/login" className="underline">
              sign in
            </Link>{" "}
            to access your dashboard.
          </CardContent>
        </Card>
      </main>
    )
  }

  const summary = kpis()
  const statusData = analyticsByStatus()

  async function signOutAction() {
    "use server"
    await signOut()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.name} userRole={user.role} onSignOut={signOutAction} />

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <LazySection>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.name}</p>
          </div>
        </LazySection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <LazySection delay={0}>
            <KPICard icon={<FileCheck size={24} />} label="Total Claims" value={summary.total} change={12} trend="up" />
          </LazySection>
          <LazySection delay={100}>
            <KPICard icon={<Users size={24} />} label="Approved" value={summary.approved} change={8} trend="up" />
          </LazySection>
          <LazySection delay={200}>
            <KPICard
              icon={<AlertCircle size={24} />}
              label="Under Review"
              value={summary.underReview}
              change={3}
              trend="down"
            />
          </LazySection>
          <LazySection delay={300}>
            <KPICard label="Total Value" value={formatINR(summary.totalValue)} change={15} trend="up" />
          </LazySection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LazySection className="lg:col-span-2" delay={400}>
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusData.map((s) => (
                    <div key={s.status} className="flex items-center justify-between">
                      <span className="text-sm capitalize font-medium">{s.status.replace("_", " ")}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (s.count / summary.total) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{s.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </LazySection>

          <LazySection delay={500}>
            <Card>
              <CardHeader>
                <CardTitle>Approval Rate</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <GaugeChart
                  value={Math.round((summary.approved / Math.max(summary.total, 1)) * 100)}
                  max={100}
                  label="Approved"
                  size={140}
                />
              </CardContent>
            </Card>
          </LazySection>
        </div>

        <LazySection delay={600} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/claims" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  View All Claims
                </Button>
              </Link>
              {user.role === "patient" && (
                <Link href="/claims/new" className="block">
                  <Button className="w-full justify-start">New Claim</Button>
                </Link>
              )}
              <Link href="/contracts" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Smart Contracts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </LazySection>
      </main>
    </div>
  )
}
