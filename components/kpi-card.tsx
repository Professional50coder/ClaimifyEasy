import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  icon?: React.ReactNode
  label: string
  value: string | number
  change?: number
  trend?: "up" | "down"
}

export function KPICard({ icon, label, value, change, trend }: KPICardProps) {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend === "up" ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : (
                  <TrendingDown size={16} className="text-red-600" />
                )}
                <span className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
