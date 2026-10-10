// Pure, dependency-free coverage estimate (no AI call). Rates are illustrative, not real policy terms.
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
  const treatmentMultiplier = TREATMENT_COVERAGE[input.treatmentType] ?? 0.7

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
    // Everything the insurer does not pay: uncovered treatment share, amount over the
    // policy limit, deductible, coinsurance and the policy-percentage haircut.
    patientResponsibility: Math.round((input.estimatedCost - finalCoverageAmount) * 100) / 100,
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
