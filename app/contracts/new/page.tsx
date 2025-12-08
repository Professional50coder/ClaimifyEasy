import TopNav from "@/components/top-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser } from "@/lib/auth"
import { apiDeployContract } from "@/lib/contracts-api"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function NewContractPage() {
  const user = await getCurrentUser()
  if (!user || !(user.role === "admin" || user.role === "insurer")) {
    redirect("/contracts")
  }

  async function deployAction(formData: FormData) {
    "use server"
    const claimId = String(formData.get("claimId") || "")
    const policyId = String(formData.get("policyId") || "")
    const amount = Number(formData.get("amount") || 0)
    const insurerWallet = String(formData.get("insurerWallet") || "")
    const hospitalWallet = String(formData.get("hospitalWallet") || "")
    const dateStr = String(formData.get("date") || "")
    const date = dateStr ? new Date(dateStr).getTime() : Date.now()

    const { error, contract } = await apiDeployContract({
      claimId,
      policyId,
      amount,
      insurerWallet,
      hospitalWallet,
      date,
      createdBy: user,
    })
    if (error || !contract) {
      redirect("/contracts/new?error=1")
    }
    redirect(`/contracts/${contract.id}`)
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Deploy New Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={deployAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="claimId">Claim ID</Label>
                <Input id="claimId" name="claimId" placeholder="claim_..." required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="policyId">Policy ID</Label>
                <Input id="policyId" name="policyId" placeholder="POL-12345" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Claim Amount</Label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="1000.00" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="insurerWallet">Insurer Wallet</Label>
                <Input id="insurerWallet" name="insurerWallet" placeholder="0x..." required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hospitalWallet">Hospital Wallet</Label>
                <Input id="hospitalWallet" name="hospitalWallet" placeholder="0x..." required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit">Deploy</Button>
                <Link href="/contracts">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
