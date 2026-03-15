'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

interface CoverageFormProps {
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

const POLICY_TYPES = [
  { value: 'comprehensive', label: 'Comprehensive Coverage' },
  { value: 'standard', label: 'Standard Coverage' },
  { value: 'basic', label: 'Basic Coverage' },
  { value: 'catastrophic', label: 'Catastrophic Coverage' },
]

const TREATMENT_TYPES = [
  { value: 'surgery', label: 'Surgery' },
  { value: 'hospitalization', label: 'Hospitalization' },
  { value: 'emergency', label: 'Emergency Care' },
  { value: 'inpatient_care', label: 'Inpatient Care' },
  { value: 'outpatient_care', label: 'Outpatient Care' },
  { value: 'prescription_drugs', label: 'Prescription Drugs' },
  { value: 'diagnostic_tests', label: 'Diagnostic Tests' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'preventive_care', label: 'Preventive Care' },
  { value: 'mental_health', label: 'Mental Health' },
]

export function CoverageCalculatorForm({ onSubmit, isLoading = false }: CoverageFormProps) {
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatmentType: '',
    estimatedCost: '',
    policyType: 'standard',
    deductible: '1000',
    maxLimit: '100000',
    coinsurance: '20',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.diagnosis || !formData.treatmentType || !formData.estimatedCost) {
      alert('Please fill in all required fields')
      return
    }

    await onSubmit({
      diagnosis: formData.diagnosis,
      treatmentType: formData.treatmentType,
      estimatedCost: parseFloat(formData.estimatedCost),
      policyType: formData.policyType,
      policyDetails: {
        deductible: parseFloat(formData.deductible),
        maxLimit: parseFloat(formData.maxLimit),
        coinsurance: parseFloat(formData.coinsurance),
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Diagnosis */}
      <div className="space-y-2">
        <Label htmlFor="diagnosis">
          Medical Diagnosis <span className="text-red-500">*</span>
        </Label>
        <Input
          id="diagnosis"
          name="diagnosis"
          placeholder="e.g., Appendectomy, Type 2 Diabetes Treatment"
          value={formData.diagnosis}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      {/* Treatment Type */}
      <div className="space-y-2">
        <Label>
          Treatment Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.treatmentType}
          onValueChange={(value) => handleSelectChange('treatmentType', value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select treatment type" />
          </SelectTrigger>
          <SelectContent>
            {TREATMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estimated Cost */}
      <div className="space-y-2">
        <Label htmlFor="estimatedCost">
          Estimated Cost <span className="text-red-500">*</span>
        </Label>
        <Input
          id="estimatedCost"
          name="estimatedCost"
          type="number"
          placeholder="$0.00"
          value={formData.estimatedCost}
          onChange={handleChange}
          disabled={isLoading}
          required
          min="0"
          step="100"
        />
      </div>

      {/* Policy Type */}
      <div className="space-y-2">
        <Label>
          Policy Type <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.policyType} onValueChange={(value) => handleSelectChange('policyType', value)} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POLICY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Policy Details Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Info size={16} className="text-blue-500" />
          Policy Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Deductible */}
          <div className="space-y-2">
            <Label htmlFor="deductible">Annual Deductible</Label>
            <Input
              id="deductible"
              name="deductible"
              type="number"
              placeholder="$1000"
              value={formData.deductible}
              onChange={handleChange}
              disabled={isLoading}
              min="0"
              step="100"
            />
          </div>

          {/* Max Limit */}
          <div className="space-y-2">
            <Label htmlFor="maxLimit">Policy Max Limit</Label>
            <Input
              id="maxLimit"
              name="maxLimit"
              type="number"
              placeholder="$100000"
              value={formData.maxLimit}
              onChange={handleChange}
              disabled={isLoading}
              min="0"
              step="1000"
            />
          </div>

          {/* Coinsurance */}
          <div className="space-y-2">
            <Label htmlFor="coinsurance">Coinsurance (%)</Label>
            <Input
              id="coinsurance"
              name="coinsurance"
              type="number"
              placeholder="20"
              value={formData.coinsurance}
              onChange={handleChange}
              disabled={isLoading}
              min="0"
              max="100"
              step="5"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading} size="lg">
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Calculating Coverage...
          </>
        ) : (
          'Calculate Coverage'
        )}
      </Button>
    </form>
  )
}
