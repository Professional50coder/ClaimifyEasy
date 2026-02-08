"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine,
} from "recharts"
import { useMemo } from "react"
import { ChartTooltipContent } from "./ui/chart"

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

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0)

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

const STATUS_ORDER: Claim["status"][] = ["submitted", "under_review", "approved", "rejected", "settled"]

function toDate(d: number) {
  return new Date(d)
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function AnalyticsCharts({ claims }: { claims: Claim[] }) {
  const normalized = useMemo(
    () =>
      (claims || []).map((c) => ({
        ...c,
        createdAt: toDate(c.createdAt),
      })),
    [claims],
  )

  // 1) Daily new claims (Area)
  const dailyNew = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of normalized) {
      const k = dayKey(c.createdAt as Date)
      map.set(k, (map.get(k) || 0) + 1)
    }
    const arr = [...map.entries()].map(([date, value]) => ({ date, value })).sort((a, b) => (a.date < b.date ? -1 : 1))
    return arr
  }, [normalized])

  // 2) Monthly status mix (Stacked Bar by count)
  const monthlyStatus = useMemo(() => {
    const m = new Map<
      string,
      {
        month: string
        submitted: number
        under_review: number
        approved: number
        rejected: number
        settled: number
      }
    >()
    for (const c of normalized) {
      const mk = monthKey(c.createdAt as Date)
      if (!m.has(mk)) {
        m.set(mk, { month: mk, submitted: 0, under_review: 0, approved: 0, rejected: 0, settled: 0 })
      }
      const row = m.get(mk)!
      row[c.status]++
    }
    return [...m.values()].sort((a, b) => (a.month < b.month ? -1 : 1))
  }, [normalized])

  // 3) Diagnosis distribution (Pie by count)
  const diagnosisMix = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of normalized) {
      const diagnosis = c.diagnosis || "Unknown"
      map.set(diagnosis, (map.get(diagnosis) || 0) + 1)
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }))
  }, [normalized])

  // 4) Top diagnoses by total amount (Bar)
  const topDiagnoses = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of normalized) {
      const diagnosis = c.diagnosis || "Unknown"
      map.set(diagnosis, (map.get(diagnosis) || 0) + (c.amount || 0))
    }
    const arr = [...map.entries()].map(([name, total]) => ({ name, total }))
    arr.sort((a, b) => b.total - a.total)
    return arr.slice(0, 10)
  }, [normalized])

  // 5) Average settlement days trend by month (Line)
  const avgSettlementDays = useMemo(() => {
    const map = new Map<string, { month: string; sum: number; n: number }>()
    for (const c of normalized) {
      if (c.status === "settled" || c.status === "approved") {
        const created = c.createdAt as Date
        const updated = toDate(c.updatedAt)
        const days = Math.max(0, (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        const mk = monthKey(updated)
        const row = map.get(mk) || { month: mk, sum: 0, n: 0 }
        row.sum += days
        row.n += 1
        map.set(mk, row)
      }
    }
    return [...map.values()]
      .map(({ month, sum, n }) => ({ month, avgDays: n ? Math.round(sum / n) : 0 }))
      .sort((a, b) => (a.month < b.month ? -1 : 1))
  }, [normalized])

  // 6) Amount buckets distribution (Bar)
  const amountBuckets = useMemo(() => {
    const buckets = [
      { label: "≤ ₹25k", test: (v: number) => v <= 25_000 },
      { label: "₹25k–₹1L", test: (v: number) => v > 25_000 && v <= 100_000 },
      { label: "₹1L–₹5L", test: (v: number) => v > 100_000 && v <= 500_000 },
      { label: "₹5L–₹10L", test: (v: number) => v > 500_000 && v <= 1_000_000 },
      { label: "₹10L+", test: (v: number) => v > 1_000_000 },
    ]
    const res = buckets.map((b) => ({ bucket: b.label, count: 0 }))
    for (const c of normalized) {
      const v = c.amount || 0
      const idx = buckets.findIndex((b) => b.test(v))
      if (idx >= 0) res[idx].count++
    }
    return res
  }, [normalized])

  // 7) Top Hospitals by Amount (Bar)
  const topHospitals = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of normalized) {
      const hospital = c.patientId || "Unknown"
      map.set(hospital, (map.get(hospital) || 0) + (c.amount || 0))
    }
    const arr = [...map.entries()].map(([name, total]) => ({ name, total }))
    arr.sort((a, b) => b.total - a.total)
    return arr.slice(0, 10)
  }, [normalized])

  const pieColors = [
    VIBRANT_COLORS.blue,
    VIBRANT_COLORS.teal,
    VIBRANT_COLORS.green,
    VIBRANT_COLORS.orange,
    VIBRANT_COLORS.red,
    VIBRANT_COLORS.purple,
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {/* Daily New Claims - Area Chart with Gradient */}
      <div className="rounded-lg border bg-card p-4 animate-fade-in delay-100">
        <h3 className="mb-3 font-medium text-foreground">Daily New Claims</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dailyNew}>
            <defs>
              <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={VIBRANT_COLORS.blue} stopOpacity={0.4} />
                <stop offset="100%" stopColor={VIBRANT_COLORS.blue} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#e5e7eb" />
            <XAxis dataKey="date" tickLine={false} stroke="#9ca3af" />
            <YAxis allowDecimals={false} tickLine={false} stroke="#9ca3af" />
            <Tooltip content={<ChartTooltipContent labelKey="date" />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={VIBRANT_COLORS.blue}
              fill="url(#areaFill)"
              strokeWidth={3}
              animationBegin={100}
              animationDuration={800}
            />
            <Brush height={16} travellerWidth={8} fill={VIBRANT_COLORS.blue} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Status Mix - Stacked Bar Chart */}
      <div className="rounded-lg border bg-card p-4 animate-fade-in delay-200">
        <h3 className="mb-3 font-medium text-foreground">Monthly Status Mix</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyStatus}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#e5e7eb" />
            <XAxis dataKey="month" tickLine={false} stroke="#9ca3af" />
            <YAxis allowDecimals={false} tickLine={false} stroke="#9ca3af" />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar stackId="a" dataKey="submitted" fill={VIBRANT_COLORS.blue} animationDuration={700} radius={[4, 4, 0, 0]} />
            <Bar
              stackId="a"
              dataKey="under_review"
              fill={VIBRANT_COLORS.teal}
              animationDuration={700}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              stackId="a"
              dataKey="approved"
              fill={VIBRANT_COLORS.green}
              animationDuration={700}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              stackId="a"
              dataKey="rejected"
              fill={VIBRANT_COLORS.red}
              animationDuration={700}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              stackId="a"
              dataKey="settled"
              fill={VIBRANT_COLORS.purple}
              animationDuration={700}
              radius={[4, 4, 0, 0]}
            />
            <Brush height={16} travellerWidth={8} fill={VIBRANT_COLORS.teal} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Diagnosis Mix - Donut Chart */}
      <div className="rounded-lg border bg-card p-4 animate-fade-in delay-300">
        <h3 className="mb-3 font-medium text-foreground">Diagnosis Mix</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Pie
              data={diagnosisMix}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              animationDuration={600}
              label
              labelLine={false}
            >
              {diagnosisMix.map((_, idx) => (
                <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Diagnoses - Horizontal Bar Chart */}
      <div className="rounded-lg border bg-card p-4 animate-fade-in delay-400">
        <h3 className="mb-3 font-medium text-foreground">Top Diagnoses by Amount</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topDiagnoses} layout="vertical">
            <defs>
              <linearGradient id="barFillHosp" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={VIBRANT_COLORS.orange} stopOpacity={0.8} />
                <stop offset="100%" stopColor={VIBRANT_COLORS.red} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#e5e7eb" />
            <XAxis
              type="number"
              tickFormatter={(v) => formatINR(v).replace("₹", "")}
              tickLine={false}
              stroke="#9ca3af"
            />
            <YAxis dataKey="name" type="category" tickLine={false} stroke="#9ca3af" width={80} />
            <Tooltip content={<ChartTooltipContent formatter={(v: any) => formatINR(Number(v))} />} />
            <Bar dataKey="total" fill="url(#barFillHosp)" radius={[0, 4, 4, 0]} animationDuration={700} />
            <ReferenceLine x={500000} stroke={VIBRANT_COLORS.green} strokeDasharray="6 6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Settlement Days Trend - Line Chart */}
      <div className="rounded-lg border bg-card p-4 animate-fade-in delay-500">
        <h3 className="mb-3 font-medium text-foreground">Avg Settlement Time (Days)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={avgSettlementDays}>
            <defs>
              <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={VIBRANT_COLORS.green} stopOpacity={0.3} />
                <stop offset="100%" stopColor={VIBRANT_COLORS.green} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#e5e7eb" />
            <XAxis dataKey="month" tickLine={false} stroke="#9ca3af" />
            <YAxis allowDecimals={false} tickLine={false} stroke="#9ca3af" />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="avgDays"
              stroke={VIBRANT_COLORS.green}
              strokeWidth={3}
              dot={{ r: 4, fill: VIBRANT_COLORS.green }}
              activeDot={{ r: 6 }}
              animationDuration={600}
            />
            <ReferenceLine y={15} stroke={VIBRANT_COLORS.orange} strokeDasharray="6 6" label="Target" />
            <Brush height={16} travellerWidth={8} fill={VIBRANT_COLORS.green} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Amount Distribution - Bar Chart */}
      <div className="rounded-lg border bg-card p-4 animate-fade-in delay-700">
        <h3 className="mb-3 font-medium text-foreground">Amount Distribution</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={amountBuckets}>
            <defs>
              <linearGradient id="amountFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={VIBRANT_COLORS.purple} stopOpacity={0.8} />
                <stop offset="100%" stopColor={VIBRANT_COLORS.pink} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#e5e7eb" />
            <XAxis dataKey="bucket" tickLine={false} stroke="#9ca3af" />
            <YAxis allowDecimals={false} tickLine={false} stroke="#9ca3af" />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="url(#amountFill)" radius={[4, 4, 0, 0]} animationDuration={700} />
            <Brush height={16} travellerWidth={8} fill={VIBRANT_COLORS.purple} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
