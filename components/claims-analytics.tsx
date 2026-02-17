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
  { name: "Approved", value: 58, fill: "#10B981" },
  { name: "Under Review", value: 25, fill: "#F59E0B" },
  { name: "Rejected", value: 9, fill: "#EF4444" },
  { name: "Submitted", value: 8, fill: "#00D9FF" },
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
    <div className="space-y-8 py-6 px-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <Line type="monotone" dataKey="submitted" stroke="#0066FF" strokeWidth={2} name="Submitted" />
                <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} name="Rejected" />
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
              <Bar dataKey="claims" fill="#0066FF" name="Total Claims" />
              <Bar dataKey="approved" fill="#10B981" name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
