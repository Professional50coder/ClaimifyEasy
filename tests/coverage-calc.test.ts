import { describe, it, expect } from "vitest"
import { calculateBasicCoverage } from "../lib/coverage-calc"

const base = {
  diagnosis: "Appendicitis",
  treatmentType: "surgery",
  estimatedCost: 10000,
  policyType: "comprehensive",
  policyDetails: { deductible: 500, maxLimit: 50000, coinsurance: 20 },
}

describe("calculateBasicCoverage", () => {
  it("matches a hand-computed example", () => {
    // surgery 1.0 -> 10000; minus 500 deductible = 9500; 20% coinsurance -> insurer base 7600; x0.85 = 6460
    const r = calculateBasicCoverage(base)
    expect(r.coverageAmount).toBe(6460)
    expect(r.patientResponsibility).toBe(3540)
  })

  it("coverage + patient responsibility always equals the estimated cost", () => {
    for (const treatmentType of ["surgery", "dental", "prescription_drugs", "unknown_type"]) {
      for (const policyType of ["comprehensive", "basic", "catastrophic", "nonexistent"]) {
        const r = calculateBasicCoverage({ ...base, treatmentType, policyType, estimatedCost: 12345.67 })
        expect(r.coverageAmount + r.patientResponsibility).toBeCloseTo(12345.67, 1)
      }
    }
  })

  it("caps the eligible amount at the policy limit", () => {
    const r = calculateBasicCoverage({ ...base, estimatedCost: 1_000_000 })
    expect(r.coverageAmount).toBeLessThanOrEqual(50000)
    expect(r.patientResponsibility).toBeGreaterThan(950000)
  })

  it("never returns negative coverage when the deductible exceeds the cost", () => {
    const r = calculateBasicCoverage({ ...base, estimatedCost: 300 })
    expect(r.coverageAmount).toBe(0)
    expect(r.patientResponsibility).toBe(300)
  })

  it("falls back to the standard policy and a 0.7 treatment rate for unknown inputs", () => {
    const unknown = calculateBasicCoverage({ ...base, policyType: "???", treatmentType: "???" })
    expect(unknown.breakdown.treatmentCoverage).toBe(7000)
    const standard = calculateBasicCoverage({ ...base, policyType: "standard", treatmentType: "???" })
    expect(unknown.coverageAmount).toBe(standard.coverageAmount)
  })
})
