'use client'

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export interface CoverageAnalysisInput {
  diagnosis: string
  treatmentType: string
  estimatedCost: number
  policyType: string
  policyDetails: {
    deductible: number
    maxLimit: number
    coinsurance: number
  }
  preExistingConditions?: string[]
}

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

// Policy database with common coverage rules
export const POLICY_COVERAGE_RULES: Record<string, { coverage: number; exclusions: string[] }> = {
  'comprehensive': {
    coverage: 0.85,
    exclusions: ['cosmetic', 'experimental'],
  },
  'standard': {
    coverage: 0.7,
    exclusions: ['cosmetic', 'experimental', 'alternative_medicine'],
  },
  'basic': {
    coverage: 0.6,
    exclusions: ['cosmetic', 'experimental', 'alternative_medicine', 'preventive'],
  },
  'catastrophic': {
    coverage: 0.5,
    exclusions: ['routine', 'preventive', 'cosmetic', 'alternative_medicine'],
  },
}

// Treatment coverage mapping
export const TREATMENT_COVERAGE: Record<string, number> = {
  'surgery': 1.0,
  'hospitalization': 1.0,
  'emergency': 1.0,
  'inpatient_care': 0.9,
  'outpatient_care': 0.8,
  'prescription_drugs': 0.75,
  'diagnostic_tests': 0.9,
  'rehabilitation': 0.8,
  'preventive_care': 0.6,
  'dental': 0.5,
  'vision': 0.5,
  'mental_health': 0.7,
}

export function calculateBasicCoverage(input: CoverageAnalysisInput): {
  coverageAmount: number
  patientResponsibility: number
  breakdown: Record<string, number>
} {
  const rules = POLICY_COVERAGE_RULES[input.policyType] || POLICY_COVERAGE_RULES['standard']
  const treatmentMultiplier = TREATMENT_COVERAGE[input.treatmentType] || 0.7

  // Start with eligible amount
  let eligibleAmount = input.estimatedCost * treatmentMultiplier

  // Apply policy maximum
  if (eligibleAmount > input.policyDetails.maxLimit) {
    eligibleAmount = input.policyDetails.maxLimit
  }

  // Apply deductible
  const afterDeductible = Math.max(0, eligibleAmount - input.policyDetails.deductible)

  // Apply coinsurance
  const insuranceShare = afterDeductible * (1 - input.policyDetails.coinsurance / 100)
  const patientCoinsurance = afterDeductible * (input.policyDetails.coinsurance / 100)

  // Apply policy coverage percentage
  const finalCoverageAmount = insuranceShare * rules.coverage

  return {
    coverageAmount: Math.round(finalCoverageAmount * 100) / 100,
    patientResponsibility:
      Math.round((input.policyDetails.deductible + patientCoinsurance + (insuranceShare - finalCoverageAmount)) * 100) /
      100,
    breakdown: {
      estimatedCost: input.estimatedCost,
      treatmentCoverage: input.estimatedCost * treatmentMultiplier,
      afterDeductible,
      coinsurancePatientShare: patientCoinsurance,
      insuranceBase: insuranceShare,
      policyAdjustment: insuranceShare * rules.coverage,
    },
  }
}
