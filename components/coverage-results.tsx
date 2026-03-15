'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, CheckCircle2, Info, Download } from 'lucide-react'

interface CoverageResult {
  diagnosis: string
  treatmentType: string
  eligibleAmount: number
  deductibleApplied: number
  coinsuranceAmount: number
  insuranceCoverageAmount: number
  coveragePercentage: number
  limitExceeded: boolean
  exclusions: string[]
  recommendations: string[]
  explanation: string
}

interface CoverageResultsProps {
  data: CoverageResult
  estimatedCost: number
  onReset?: () => void
}

export function CoverageResults({ data, estimatedCost, onReset }: CoverageResultsProps) {
  const breakdownData = [
    { name: 'Insurance Covers', value: Math.round(data.insuranceCoverageAmount) },
    { name: 'Deductible', value: Math.round(data.deductibleApplied) },
    { name: 'Coinsurance', value: Math.round(data.coinsuranceAmount) },
    { name: 'Uncovered', value: Math.max(0, estimatedCost - (data.insuranceCoverageAmount + data.deductibleApplied + data.coinsuranceAmount)) },
  ]

  const coverageBreakdown = [
    { name: 'Insurance Coverage', value: Math.round(data.insuranceCoverageAmount), color: '#10b981' },
    { name: 'Patient Responsibility', value: Math.round(data.deductibleApplied + data.coinsuranceAmount), color: '#ef4444' },
  ]

  const handleDownload = () => {
    const reportContent = `
COVERAGE CALCULATOR REPORT
==========================
Generated: ${new Date().toLocaleDateString()}

CLAIM DETAILS
Diagnosis: ${data.diagnosis}
Treatment Type: ${data.treatmentType}
Estimated Cost: $${estimatedCost.toFixed(2)}

COVERAGE ANALYSIS
Eligible Amount: $${data.eligibleAmount.toFixed(2)}
Deductible Applied: $${data.deductibleApplied.toFixed(2)}
Coinsurance (Patient): $${data.coinsuranceAmount.toFixed(2)}
Insurance Coverage: $${data.insuranceCoverageAmount.toFixed(2)}
Coverage Percentage: ${data.coveragePercentage.toFixed(1)}%

${data.limitExceeded ? 'WARNING: Policy limit exceeded' : 'Coverage within policy limits'}

EXCLUSIONS
${data.exclusions.length > 0 ? data.exclusions.map((e) => `- ${e}`).join('\n') : 'None'}

RECOMMENDATIONS
${data.recommendations.map((r) => `- ${r}`).join('\n')}

EXPLANATION
${data.explanation}
    `

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent))
    element.setAttribute('download', `coverage-report-${Date.now()}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Insurance Covers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${data.insuranceCoverageAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.coveragePercentage.toFixed(1)}% of eligible amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">You Pay (Deductible)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${data.deductibleApplied.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Before insurance coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">You Pay (Coinsurance)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${data.coinsuranceAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">After deductible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patient Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(data.deductibleApplied + data.coinsuranceAmount).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your total responsibility</p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {data.limitExceeded && (
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-amber-900">Policy Limit Exceeded</h4>
            <p className="text-sm text-amber-800 mt-1">The estimated cost exceeds your policy maximum benefit. Additional costs may be your responsibility.</p>
          </div>
        </div>
      )}

      {data.exclusions.length > 0 && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-red-900">Coverage Exclusions</h4>
            <ul className="text-sm text-red-800 mt-2 space-y-1">
              {data.exclusions.map((exclusion, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full" />
                  {exclusion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={breakdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Coverage vs Patient */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coverage Split</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={coverageBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {coverageBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info size={20} className="text-blue-500" />
            How We Calculated Your Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground">{data.explanation}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download size={16} className="mr-2" />
          Download Report
        </Button>
        {onReset && (
          <Button onClick={onReset} variant="outline" className="flex-1">
            Calculate Another
          </Button>
        )}
      </div>
    </div>
  )
}
