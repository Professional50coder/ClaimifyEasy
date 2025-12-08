"use client"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LazySection } from "@/components/lazy-section"
import { Download, TrendingUp } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import Link from "next/link"

const VIBRANT_COLORS = {
  blue: "#0066FF",
  teal: "#00D9FF",
  green: "#10B981",
  orange: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
}

const reportData = [
  { month: "Jan", approved: 245, rejected: 45, pending: 120 },
  { month: "Feb", approved: 320, rejected: 38, pending: 95 },
  { month: "Mar", approved: 410, rejected: 52, pending: 110 },
  { month: "Apr", approved: 380, rejected: 41, pending: 85 },
  { month: "May", approved: 520, rejected: 35, pending: 75 },
  { month: "Jun", approved: 610, rejected: 28, pending: 60 },
]

const statusDistribution = [
  { name: "Approved", value: 2485 },
  { name: "Rejected", value: 239 },
  { name: "Pending", value: 545 },
]

const hospitalPerformance = [
  { hospital: "Apollo", claims: 450, approved: 405, avgTime: 8 },
  { hospital: "Fortis", claims: 380, approved: 342, avgTime: 9 },
  { hospital: "Max", claims: 320, approved: 288, avgTime: 7 },
  { hospital: "Medanta", claims: 290, approved: 261, avgTime: 10 },
  { hospital: "Manipal", claims: 265, approved: 238, avgTime: 8 },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("6m")
  const [isAuthorized, setIsAuthorized] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()
        if (data.role === "patient") {
          setIsAuthorized(false)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }
    checkAuth()
  }, [])

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                You don't have permission to access the Reports section. This feature is only available to staff
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <LazySection>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
              <p className="text-sm text-muted-foreground mt-1">Generate and view detailed claim reports</p>
            </div>
            <Button className="gap-2">
              <Download size={18} />
              Export Report
            </Button>
          </div>
        </LazySection>

        {/* Filters */}
        <LazySection delay={100}>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Date Range</label>
                  <div className="flex gap-2 mt-2">
                    {["1m", "3m", "6m", "1y"].map((range) => (
                      <Button
                        key={range}
                        variant={dateRange === range ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateRange(range)}
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Hospital</label>
                  <Input placeholder="Filter by hospital..." className="mt-2" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Input placeholder="Filter by status..." className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </LazySection>

        {/* Key Metrics */}
        <LazySection delay={200} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="animate-slide-up delay-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-3xl font-bold text-foreground mt-2">3,269</p>
                <p className="text-xs text-accent mt-1">+12% from last period</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up delay-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-3xl font-bold text-foreground mt-2">76%</p>
                <p className="text-xs text-accent mt-1">+3% from last period</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up delay-400">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Settlement</p>
                <p className="text-3xl font-bold text-foreground mt-2">8.2d</p>
                <p className="text-xs text-accent mt-1">-0.5d from last period</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up delay-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-3xl font-bold text-foreground mt-2">₹45.2Cr</p>
                <p className="text-xs text-accent mt-1">+8% from last period</p>
              </div>
            </CardContent>
          </Card>
        </LazySection>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LazySection delay={300}>
            <Card className="animate-fade-in delay-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Claims Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={VIBRANT_COLORS.blue} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={VIBRANT_COLORS.blue} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="approved"
                      fill="url(#trendFill)"
                      stroke={VIBRANT_COLORS.green}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </LazySection>

          <LazySection delay={400}>
            <Card className="animate-fade-in delay-400">
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      <Cell fill={VIBRANT_COLORS.green} />
                      <Cell fill={VIBRANT_COLORS.red} />
                      <Cell fill={VIBRANT_COLORS.orange} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </LazySection>
        </div>

        {/* Hospital Performance Table */}
        <LazySection delay={500}>
          <Card className="animate-fade-in delay-500">
            <CardHeader>
              <CardTitle>Hospital Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Hospital</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Claims</th>
                      <th className="text-right py-3 px-4 font-semibold">Approved</th>
                      <th className="text-right py-3 px-4 font-semibold">Approval %</th>
                      <th className="text-right py-3 px-4 font-semibold">Avg Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitalPerformance.map((hospital, idx) => (
                      <tr
                        key={hospital.hospital}
                        className="border-b border-border hover:bg-muted transition-colors animate-fade-in"
                        style={{ animationDelay: `${600 + idx * 100}ms` }}
                      >
                        <td className="py-3 px-4">{hospital.hospital}</td>
                        <td className="text-right py-3 px-4">{hospital.claims}</td>
                        <td className="text-right py-3 px-4">{hospital.approved}</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {Math.round((hospital.approved / hospital.claims) * 100)}%
                        </td>
                        <td className="text-right py-3 px-4">{hospital.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </LazySection>
      </main>
    </div>
  )
}
