'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CoverageCalculatorForm } from '@/components/coverage-calculator-form'
import { CoverageResults } from '@/components/coverage-results'
import { calculateBasicCoverage } from '@/lib/coverage-agents'
import { LazySection } from '@/components/lazy-section'
import { AlertCircle, HelpCircle, Lightbulb } from 'lucide-react'

interface CalculationResult {
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

export default function CoverageCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the basic calculation logic
      const basicResult = calculateBasicCoverage(data)

      // Generate recommendations based on coverage
      const recommendations = []
      if (basicResult.breakdownData?.policyAdjustment < data.policyDetails.maxLimit * 0.3) {
        recommendations.push('Consider upgrading to a higher coverage plan for better protection.')
      }
      if (data.policyDetails.deductible > 1000) {
        recommendations.push('Your deductible is relatively high. Ensure you have emergency savings.')
      }
      if (data.policyDetails.coinsurance > 25) {
        recommendations.push('Your coinsurance percentage is high. Review policy for cost-sharing options.')
      }
      if (basicResult.coverageAmount < basicResult.breakdown.estimatedCost * 0.5) {
        recommendations.push('This treatment will require significant out-of-pocket costs. Plan accordingly.')
      }

      // Determine exclusions based on policy type
      const exclusions: string[] = []
      if (data.treatmentType === 'preventive_care') {
        if (data.policyType === 'basic' || data.policyType === 'catastrophic') {
          exclusions.push('Preventive care may have limited coverage under this plan')
        }
      }
      if (['cosmetic', 'experimental'].includes(data.treatmentType)) {
        exclusions.push('This treatment type may be considered experimental or cosmetic')
      }

      setEstimatedCost(data.estimatedCost)
      setResult({
        diagnosis: data.diagnosis,
        treatmentType: data.treatmentType,
        eligibleAmount: basicResult.breakdown.treatmentCoverage,
        deductibleApplied: Math.min(data.policyDetails.deductible, basicResult.breakdown.treatmentCoverage),
        coinsuranceAmount: basicResult.patientResponsibility - Math.min(data.policyDetails.deductible, basicResult.breakdown.treatmentCoverage),
        insuranceCoverageAmount: basicResult.coverageAmount,
        coveragePercentage: (basicResult.coverageAmount / data.estimatedCost) * 100,
        limitExceeded: basicResult.breakdown.treatmentCoverage > data.policyDetails.maxLimit,
        exclusions,
        recommendations,
        explanation: generateExplanation(data, basicResult),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate coverage. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setEstimatedCost(0)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <LazySection>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Coverage Calculator</h1>
            <p className="text-sm text-muted-foreground mt-1">Estimate your insurance coverage and out-of-pocket costs</p>
          </div>
        </LazySection>

        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Calculator Form */}
            <LazySection className="lg:col-span-2" delay={100}>
              <Card>
                <CardHeader>
                  <CardTitle>Calculate Your Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <CoverageCalculatorForm onSubmit={handleCalculate} isLoading={isLoading} />
                </CardContent>
              </Card>
            </LazySection>

            {/* Information Panels */}
            <div className="space-y-6">
              {/* Quick Tips */}
              <LazySection delay={200}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb size={18} className="text-yellow-500" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground mb-1">Deductible</p>
                      <p className="text-muted-foreground">Amount you pay before insurance kicks in.</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Coinsurance</p>
                      <p className="text-muted-foreground">Your share of costs after deductible (e.g., 20%).</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Out-of-Pocket Max</p>
                      <p className="text-muted-foreground">Most you'll pay in a year. Insurance covers 100% after this.</p>
                    </div>
                  </CardContent>
                </Card>
              </LazySection>

              {/* Common Questions */}
              <LazySection delay={300}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <HelpCircle size={18} className="text-blue-500" />
                      FAQ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground mb-1">How accurate is this calculator?</p>
                      <p className="text-muted-foreground">This is an estimate. Actual coverage depends on your specific policy and eligibility.</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">What if I exceed limits?</p>
                      <p className="text-muted-foreground">Any costs beyond your policy limit are your responsibility.</p>
                    </div>
                  </CardContent>
                </Card>
              </LazySection>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <LazySection delay={100}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Your Coverage Results</h2>
                  <p className="text-sm text-muted-foreground mt-1">{result.diagnosis} • {result.treatmentType}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  ← Back to Calculator
                </button>
              </div>
            </LazySection>

            <LazySection delay={200}>
              <CoverageResults data={result} estimatedCost={estimatedCost} onReset={handleReset} />
            </LazySection>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-red-900">Calculation Error</h4>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function generateExplanation(
  data: any,
  result: { coverageAmount: number; patientResponsibility: number; breakdown: Record<string, number> }
): string {
  const treatmentCov = result.breakdown.treatmentCoverage
  const afterDed = result.breakdown.afterDeductible
  const deductible = Math.min(data.policyDetails.deductible, treatmentCov)

  return `
Here's how we calculated your coverage:

1. **Eligible Amount**: Your treatment cost of $${data.estimatedCost.toFixed(2)} is evaluated based on the ${data.treatmentType} treatment type, resulting in an eligible amount of $${treatmentCov.toFixed(2)}.

2. **Deductible Applied**: Your deductible of $${deductible.toFixed(2)} is subtracted from the eligible amount, leaving $${afterDed.toFixed(2)} for insurance consideration.

3. **Coinsurance Calculation**: You pay ${data.policyDetails.coinsurance}% coinsurance on the remaining amount, which equals $${result.patientResponsibility.toFixed(2)} in your responsibility.

4. **Insurance Coverage**: After applying all deductibles and coinsurance, the insurance company covers $${result.coverageAmount.toFixed(2)}, which is ${((result.coverageAmount / data.estimatedCost) * 100).toFixed(1)}% of your estimated cost.

Your total out-of-pocket cost will be approximately $${(deductible + (afterDed * data.policyDetails.coinsurance / 100)).toFixed(2)}.
  `.trim()
}
