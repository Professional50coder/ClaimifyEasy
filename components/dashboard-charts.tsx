"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Brush,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

// local INR formatter to avoid server imports in client bundle
const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0)

type StatusRow = { status: string; count: number }
type MonthlyRow = { month: string; total: number }
type DxRow = { diagnosis: string; count: number }
type DailyRow = { day: string; count: number }
type StackedRow = {
  month: string
  submitted: number
  under_review: number
  approved: number
  settled: number
  rejected: number
}
type AmountBucketRow = { label: string; count: number }
type AvgSettlementRow = { month: string; avgDays: number }

export function DashboardCharts({
  statusData,
  monthly,
  byDx,
  daily,
  stacked,
  amountBuckets,
  avgSettlement,
}: {
  statusData: StatusRow[]
  monthly: MonthlyRow[]
  byDx: DxRow[]
  daily: DailyRow[]
  stacked: StackedRow[]
  amountBuckets: AmountBucketRow[]
  avgSettlement: AvgSettlementRow[]
}) {
  const pieColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const monthlyAvg =
    monthly.length > 0 ? Math.round(monthly.reduce((acc, r) => acc + Number(r.total || 0), 0) / monthly.length) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Claims by Status */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Claims by Status</div>
        <ChartContainer
          id="status-chart"
          className="w-full"
          config={{ count: { label: "Count", color: "hsl(var(--chart-1))" } }}
        >
          <BarChart data={statusData.map((s) => ({ name: s.status.replace("_", " "), count: s.count }))}>
            <defs>
              <pattern id="barPatternStatus" patternUnits="userSpaceOnUse" width="6" height="6">
                <rect width="6" height="6" fill="hsl(var(--chart-1))" opacity="0.9" />
                <path d="M0 6 L6 0" stroke="oklch(0.985 0 0)" strokeOpacity="0.25" />
              </pattern>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="url(#barPatternStatus)" radius={[4, 4, 0, 0]} />
            <Brush height={16} travellerWidth={8} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Monthly Approved/Settled Value */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Monthly Approved/Settled Value</div>
        <ChartContainer
          id="monthly-chart"
          className="w-full"
          config={{ total: { label: "Total (INR)", color: "hsl(var(--chart-2))" } }}
        >
          <LineChart data={monthly}>
            <defs>
              <linearGradient id="lineMonthlyFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity="0.25" />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => formatINR(Number(v)).replace("₹", "₹ ")} />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value) => <span>{formatINR(Number(value))}</span>} />}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <ReferenceLine y={monthlyAvg} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
            <Brush height={16} travellerWidth={8} />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>

      {/* Diagnosis Distribution */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Diagnosis Distribution</div>
        <ChartContainer id="diagnosis-pie" className="w-full" config={{}}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Pie
              data={byDx.map((d) => ({ name: d.diagnosis, value: d.count }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={2}
              label
              labelLine={false}
            >
              {byDx.map((_, idx) => (
                <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      {/* Daily New Claims */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Daily New Claims (30 days)</div>
        <ChartContainer
          id="daily-area"
          className="w-full"
          config={{ count: { label: "New Claims", color: "hsl(var(--chart-4))" } }}
        >
          <AreaChart data={daily}>
            <defs>
              <linearGradient id="dailyFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-4))" fill="url(#dailyFill)" />
            <Brush height={16} travellerWidth={8} />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* Monthly Status Mix */}
      <div className="space-y-2 md:col-span-2">
        <div className="text-sm text-muted-foreground">Monthly Status Mix</div>
        <ChartContainer
          id="stacked-status"
          className="w-full"
          config={{
            submitted: { label: "Submitted", color: "hsl(var(--chart-1))" },
            under_review: { label: "Under Review", color: "hsl(var(--chart-5))" },
            approved: { label: "Approved", color: "hsl(var(--chart-2))" },
            settled: { label: "Settled", color: "hsl(var(--chart-3))" },
            rejected: { label: "Rejected", color: "hsl(var(--chart-4))" },
          }}
        >
          <BarChart data={stacked} stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="submitted" stackId="a" fill="hsl(var(--chart-1))" />
            <Bar dataKey="under_review" stackId="a" fill="hsl(var(--chart-5))" />
            <Bar dataKey="approved" stackId="a" fill="hsl(var(--chart-2))" />
            <Bar dataKey="settled" stackId="a" fill="hsl(var(--chart-3))" />
            <Bar dataKey="rejected" stackId="a" fill="hsl(var(--chart-4))" />
            <Brush height={16} travellerWidth={8} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Amount Buckets */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Claim Amount Distribution</div>
        <ChartContainer
          id="amount-buckets"
          className="w-full"
          config={{ count: { label: "Count", color: "hsl(var(--chart-5))" } }}
        >
          <BarChart data={amountBuckets}>
            <defs>
              <pattern id="amountPattern" patternUnits="userSpaceOnUse" width="6" height="6">
                <rect width="6" height="6" fill="hsl(var(--chart-5))" opacity="0.9" />
                <path d="M0 0 L6 6" stroke="oklch(0.985 0 0)" strokeOpacity="0.25" />
              </pattern>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="url(#amountPattern)" radius={[4, 4, 0, 0]} />
            <Brush height={16} travellerWidth={8} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Avg Settlement */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Average Settlement Time (days)</div>
        <ChartContainer
          id="avg-settlement"
          className="w-full"
          config={{ avgDays: { label: "Avg Days", color: "hsl(var(--chart-2))" } }}
        >
          <LineChart data={avgSettlement}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="avgDays"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <ReferenceLine y={15} stroke="hsl(var(--chart-4))" strokeDasharray="6 6" />
            <Brush height={16} travellerWidth={8} />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>

      {/* Claim Stage Funnel (Radial) */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Claim Stage Funnel</div>
        <ChartContainer
          id="funnel-radial"
          className="w-full"
          config={{
            NEW: { label: "New", color: "hsl(var(--chart-1))" },
            SUBMITTED: { label: "Submitted", color: "hsl(var(--chart-2))" },
            VERIFIED: { label: "Verified", color: "hsl(var(--chart-3))" },
            APPROVED: { label: "Approved", color: "hsl(var(--chart-4))" },
            SETTLED: { label: "Settled", color: "hsl(var(--primary))" },
          }}
        >
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart
              innerRadius="20%"
              outerRadius="100%"
              data={statusData.map((s) => ({ name: s.status, value: s.count }))}
            >
              <PolarAngleAxis type="number" domain={[0, "auto"]} tick={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {statusData.map((s, idx) => (
                <RadialBar
                  key={s.status}
                  minAngle={8}
                  clockWise
                  dataKey="value"
                  data={[{ name: s.status, value: s.count }]}
                  cornerRadius={6}
                  fill={`hsl(var(--chart-${(idx % 4) + 1}))`}
                />
              ))}
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
