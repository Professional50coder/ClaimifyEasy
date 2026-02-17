import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCurrentUser } from "@/lib/auth"
import { listClaimsForRole, transitionClaimStatus } from "@/lib/db"
import Link from "next/link"
import { formatINR } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/badge"
import { ClaimsAnalytics } from "@/components/claims-analytics"

export default async function ClaimsPage() {
  const user = await getCurrentUser()
  if (!user) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
          </CardHeader>
          <CardContent>Please sign in.</CardContent>
        </Card>
      </main>
    )
  }
  const claims = await listClaimsForRole(user)

  async function action(formData: FormData) {
    "use server"
    const claimId = String(formData.get("claimId") || "")
    const act = String(formData.get("action") || "") as "verify" | "send_under_review" | "approve" | "reject" | "settle"
    await transitionClaimStatus({ claimId, actor: user, action: act })
    revalidatePath("/claims")
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: "outline",
      verified: "secondary",
      under_review: "secondary",
      approved: "default",
      rejected: "destructive",
      settled: "default",
    }
    return variants[status] || "outline"
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        userName={user.name}
        userRole={user.role}
        onSignOut={async () => {
          "use server"
          await import("@/lib/auth").then((m) => m.signOut())
        }}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Claims</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user.role === "patient" ? "Your insurance claims" : "Manage and track all insurance claims"}
            </p>
          </div>
          {user.role === "patient" && (
            <Link href="/claims/new">
              <Button className="bg-primary hover:bg-primary/90">New Claim</Button>
            </Link>
          )}
        </div>

        {user.role !== "patient" && (
          <div className="mb-12 bg-white dark:bg-slate-900 rounded-lg border border-border p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Claims Analytics</h2>
            <ClaimsAnalytics />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{user.role === "patient" ? "Your Claims" : "Claims List"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Diagnosis</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Verified</TableHead>
                    <TableHead className="font-semibold">Documents</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium">{c.diagnosis}</TableCell>
                      <TableCell className="font-semibold">{formatINR(c.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(c.status)} className="capitalize">
                          {c.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.hospitalVerified ? "✓" : "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {c.documents.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                          {c.documents.map((id) => (
                            <a
                              key={id}
                              href={`/api/docs/${id}`}
                              className="text-xs text-primary underline hover:no-underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Doc {id.slice(0, 6)}
                            </a>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.role === "hospital" && c.status === "submitted" && (
                            <form action={action}>
                              <input type="hidden" name="claimId" value={c.id} />
                              <input type="hidden" name="action" value="verify" />
                              <Button size="sm" variant="outline">
                                Verify
                              </Button>
                            </form>
                          )}
                          {user.role === "insurer" && (
                            <>
                              {c.status !== "rejected" && c.status !== "approved" && (
                                <form action={action}>
                                  <input type="hidden" name="claimId" value={c.id} />
                                  <input type="hidden" name="action" value="send_under_review" />
                                  <Button size="sm" variant="outline">
                                    Review
                                  </Button>
                                </form>
                              )}
                              {c.hospitalVerified && c.status !== "approved" && (
                                <form action={action}>
                                  <input type="hidden" name="claimId" value={c.id} />
                                  <input type="hidden" name="action" value="approve" />
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    Approve
                                  </Button>
                                </form>
                              )}
                              {c.status !== "rejected" && (
                                <form action={action}>
                                  <input type="hidden" name="claimId" value={c.id} />
                                  <input type="hidden" name="action" value="reject" />
                                  <Button size="sm" variant="destructive">
                                    Reject
                                  </Button>
                                </form>
                              )}
                            </>
                          )}
                          {user.role === "admin" && c.status === "approved" && (
                            <form action={action}>
                              <input type="hidden" name="claimId" value={c.id} />
                              <input type="hidden" name="action" value="settle" />
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                Settle
                              </Button>
                            </form>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
