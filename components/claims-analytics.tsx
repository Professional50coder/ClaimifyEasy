"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const claimsData = [
  { month: "Jan", submitted: 45, approved: 38, rejected: 7 },
  { month: "Feb", submitted: 52, approved: 44, rejected: 8 },
  { month: "Mar", submitted: 48, approved: 41, rejected: 7 },
  { month: "Apr", submitted: 61, approved: 52, rejected: 9 },
  { month: "May", submitted: 55, approved: 47, rejected: 8 },
  { month: "Jun", submitted: 67, approved: 58, rejected: 9 },
]

const statusData = [
  { name: "Approved", value: 58, fill: "hsl(var(--chart-3))" },
  { name: "Under Review", value: 25, fill: "hsl(var(--chart-4))" },
  { name: "Rejected", value: 9, fill: "hsl(var(--chart-5))" },
  { name: "Submitted", value: 8, fill: "hsl(var(--chart-2))" },
]

const regionData = [
  { region: "North", claims: 120, approved: 98 },
  { region: "South", claims: 95, approved: 78 },
  { region: "East", claims: 110, approved: 92 },
  { region: "West", claims: 85, approved: 71 },
  { region: "Central", claims: 75, approved: 62 },
]

export function ClaimsAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Claims Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={claimsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="approved" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                <Line type="monotone" dataKey="rejected" stroke="hsl(var(--chart-5))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Claims by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Claims by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="claims" fill="hsl(var(--chart-1))" />
              <Bar dataKey="approved" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
