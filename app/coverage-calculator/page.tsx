"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LazySection } from "@/components/lazy-section"
import { Calculator, TrendingUp, AlertCircle } from "lucide-react"

export default function CoverageCalculatorPage() {
  const [claimAmount, setClaimAmount] = useState(100000)
  const [deductible, setDeductible] = useState(5000)
  const [coinsurance, setCoinsurance] = useState(20)
  const [maxOutOfPocket, setMaxOutOfPocket] = useState(50000)
  const [coverageType, setCoverageType] = useState("standard")

  const calculateCoverage = () => {
    let coverage = claimAmount
    const deductibleAmount = Math.min(deductible, claimAmount)
    coverage -= deductibleAmount

    const coinsuranceAmount = (coverage * coinsurance) / 100
    coverage -= coinsuranceAmount

    const totalOutOfPocket = deductibleAmount + coinsuranceAmount
    const cappedOutOfPocket = Math.min(totalOutOfPocket, maxOutOfPocket)
    const insurerPayment = claimAmount - cappedOutOfPocket

    return {
      claimAmount,
      deductible: deductibleAmount,
      coinsurance: coinsuranceAmount,
      totalOutOfPocket: cappedOutOfPocket,
      insurerPayment,
      percentageCovered: ((insurerPayment / claimAmount) * 100).toFixed(1),
    }
  }

  const result = calculateCoverage()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <LazySection>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calculator size={32} className="text-primary" />
              Coverage Calculator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Calculate your insurance coverage based on claim amount
            </p>
          </div>
        </LazySection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator Form */}
          <LazySection className="lg:col-span-2" delay={100}>
            <Card>
              <CardHeader>
                <CardTitle>Claim Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coverage Type */}
                <div className="space-y-2">
                  <Label>Coverage Type</Label>
                  <Select value={coverageType} onValueChange={setCoverageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Coverage</SelectItem>
                      <SelectItem value="standard">Standard Coverage</SelectItem>
                      <SelectItem value="premium">Premium Coverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Claim Amount */}
                <div className="space-y-2">
                  <Label>Claim Amount</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(Math.max(0, Number.parseInt(e.target.value) || 0))}
                      placeholder="Enter claim amount"
                    />
                    <span className="flex items-center font-semibold text-primary">
                      ₹{claimAmount.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[claimAmount]}
                    onValueChange={(val) => setClaimAmount(val[0])}
                    min={0}
                    max={1000000}
                    step={10000}
                    className="w-full"
                  />
                </div>

                {/* Deductible */}
                <div className="space-y-2">
                  <Label>Deductible</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={deductible}
                      onChange={(e) => setDeductible(Math.max(0, Number.parseInt(e.target.value) || 0))}
                      placeholder="Enter deductible"
                    />
                    <span className="flex items-center font-semibold text-primary">₹{deductible.toLocaleString()}</span>
                  </div>
                  <Slider
                    value={[deductible]}
                    onValueChange={(val) => setDeductible(val[0])}
                    min={0}
                    max={100000}
                    step={1000}
                    className="w-full"
                  />
                </div>

                {/* Coinsurance */}
                <div className="space-y-2">
                  <Label>Coinsurance %</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={coinsurance}
                      onChange={(e) => setCoinsurance(Math.max(0, Math.min(100, Number.parseInt(e.target.value) || 0)))}
                      placeholder="Enter coinsurance percentage"
                    />
                    <span className="flex items-center font-semibold text-primary">{coinsurance}%</span>
                  </div>
                  <Slider
                    value={[coinsurance]}
                    onValueChange={(val) => setCoinsurance(val[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Max Out of Pocket */}
                <div className="space-y-2">
                  <Label>Maximum Out of Pocket</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={maxOutOfPocket}
                      onChange={(e) => setMaxOutOfPocket(Math.max(0, Number.parseInt(e.target.value) || 0))}
                      placeholder="Enter max out of pocket"
                    />
                    <span className="flex items-center font-semibold text-primary">
                      ₹{maxOutOfPocket.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[maxOutOfPocket]}
                    onValueChange={(val) => setMaxOutOfPocket(val[0])}
                    min={0}
                    max={500000}
                    step={5000}
                    className="w-full"
                  />
                </div>

                <Button className="w-full gap-2">
                  <Calculator size={18} />
                  Calculate Coverage
                </Button>
              </CardContent>
            </Card>
          </LazySection>

          {/* Results */}
          <LazySection delay={200}>
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Your Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-lg">
                      <p className="text-xs text-muted-foreground">Claim Amount</p>
                      <p className="text-2xl font-bold text-foreground">₹{result.claimAmount.toLocaleString()}</p>
                    </div>

                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-700 dark:text-red-300">Your Out of Pocket</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ₹{result.totalOutOfPocket.toLocaleString()}
                      </p>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1 space-y-0.5">
                        <p>Deductible: ₹{result.deductible.toLocaleString()}</p>
                        <p>Coinsurance: ₹{result.coinsurance.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-700 dark:text-green-300">Insurance Will Pay</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{result.insurerPayment.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {result.percentageCovered}% of claim
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-semibold mb-1">Coverage Estimate</p>
                      <p>This is an estimate based on your policy terms. Actual coverage may vary.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </LazySection>
        </div>
      </main>
    </div>
  )
}
