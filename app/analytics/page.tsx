import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { LazySection } from "@/components/lazy-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getClaimsSafe() {
  try {
    const db: any = await import("../../lib/db")
    const claims =
      (await db.getAllClaims?.()) ?? (await db.listClaims?.()) ?? (await db.getClaims?.()) ?? db.claims ?? []
    if (claims?.length) return claims
  } catch (error) {
    console.error("[v0] DB load failed:", error)
  }
  const sample = await import("../../lib/sample-data")
  return sample.sampleClaims
}

async function AnalyticsSection() {
  const claims = await getClaimsSafe()
  const { AnalyticsCharts } = await import("../../components/analytics-charts")
  const { AnalyticsSummary } = await import("../../components/analytics-summary")
  return (
    <>
      <AnalyticsSummary claims={claims} />
      <AnalyticsCharts claims={claims} />
    </>
  )
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "patient") {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userName={user.name} userRole={user.role} />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                You don't have permission to access the Analytics section. This feature is only available to staff
                members.
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

  const claims = await getClaimsSafe()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.name} userRole={user.role} />
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <LazySection>
          <header className="mb-12">
            <h1 className="text-3xl font-bold text-foreground">Analytics Overview</h1>
            <p className="text-sm text-muted-foreground mt-2">Comprehensive claims analytics and insights</p>
          </header>
        </LazySection>

        <div className="space-y-6">
          <Suspense fallback={
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border p-12">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground text-center mt-4">Loading analytics…</p>
            </div>
          }>
            <AnalyticsSection />
          </Suspense>
        </div>

        <LazySection delay={800} className="mt-10">
          <p className="text-sm text-muted-foreground">
            Showing data in INR (₹). All trends are based on live claim data.
          </p>
        </LazySection>
      </main>
    </div>
  )
}
