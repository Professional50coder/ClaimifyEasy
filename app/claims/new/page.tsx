import TopNav from "@/components/top-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentUser } from "@/lib/auth"
import { createClaim } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function NewClaimPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "patient") redirect("/claims")

  async function createAction(formData: FormData) {
    "use server"
    const diagnosis = String(formData.get("diagnosis") || "")
    const amount = Number(formData.get("amount") || 0)
    const notes = String(formData.get("notes") || "")

    const files = formData.getAll("documents") as unknown as File[]
    const documentFiles: { filename: string; mimeType: string; data: Uint8Array }[] = []
    for (const f of files ?? []) {
      if (!f || typeof (f as any).arrayBuffer !== "function") continue
      const buf = new Uint8Array(await f.arrayBuffer())
      documentFiles.push({
        filename: (f as any).name || "document",
        mimeType: (f as any).type || "application/octet-stream",
        data: buf,
      })
    }

    const res = createClaim({ patientId: user.id, diagnosis, amount, notes, documentFiles })
    if (res.error) {
      // naive: redirect back with simple query
      redirect("/claims/new?error=1")
    }
    redirect("/claims")
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>New Claim</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAction} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input id="diagnosis" name="diagnosis" required placeholder="e.g., Dengue Fever" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="amount">Amount (INR)</Label>
                  <Input id="amount" name="amount" type="number" min="1" step="1" required placeholder="e.g., 45000" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Add any extra details..." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="documents">Documents</Label>
                <Input id="documents" name="documents" type="file" multiple accept="application/pdf,image/*" />
                <p className="text-xs text-muted-foreground">
                  Optional: upload discharge summary, bills, prescriptions (PDF or images). You can submit without
                  files.
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Submit Claim</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
