'use client'

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import type { CoverageAnalysisInput } from './coverage-calc'

export type { CoverageAnalysisInput }
export { POLICY_COVERAGE_RULES, TREATMENT_COVERAGE, calculateBasicCoverage } from './coverage-calc'

export const CoverageAnalysisSchema = z.object({
  eligibleAmount: z.number().describe('Amount eligible for coverage'),
  deductibleApplied: z.number().describe('Deductible amount applied'),
  coinsuranceAmount: z.number().describe('Patient coinsurance portion'),
  insuranceCoverageAmount: z.number().describe('Final insurance coverage amount'),
  coveragePercentage: z.number().describe('Coverage percentage (0-100)'),
  limitExceeded: z.boolean().describe('Whether the claim exceeds policy limits'),
  exclusions: z.array(z.string()).describe('List of any exclusions that apply'),
  recommendations: z.array(z.string()).describe('Recommendations for the claim'),
  explanation: z.string().describe('Detailed explanation of coverage calculation'),
})

export async function analyzeCoverage(input: CoverageAnalysisInput) {
  const prompt = `
You are a healthcare insurance coverage analyst. Analyze the following medical claim and calculate coverage:

Diagnosis: ${input.diagnosis}
Treatment Type: ${input.treatmentType}
Estimated Cost: $${input.estimatedCost}
Policy Type: ${input.policyType}
Policy Deductible: $${input.policyDetails.deductible}
Policy Max Limit: $${input.policyDetails.maxLimit}
Coinsurance Rate: ${input.policyDetails.coinsurance}%
Pre-existing Conditions: ${input.preExistingConditions?.join(', ') || 'None'}

Calculate:
1. If the diagnosis/treatment is covered under this policy type
2. Deductible application
3. Coinsurance calculation (patient responsibility)
4. Insurance coverage amount
5. Any exclusions or limitations
6. Coverage percentage
7. Recommendations

Be precise with calculations and explain any limitations or exclusions.
`

  try {
    const result = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: CoverageAnalysisSchema,
      prompt,
    })

    return result.object
  } catch (error) {
    console.error('Error analyzing coverage:', error)
    throw error
  }
}
