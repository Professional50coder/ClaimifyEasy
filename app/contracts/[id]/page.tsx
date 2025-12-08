import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import TopNav from "@/components/top-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiGetContract, apiQueryContractState, apiGetContractAuditTrail, apiExecuteAction } from "@/lib/contracts-api"
import Link from "next/link"
import { formatINR } from "@/lib/utils"
import { Shield, CheckCircle, AlertCircle } from "lucide-react"

async function loadContractData(id: string) {
  try {
    const contract = await apiGetContract(id)
    if (!contract) return { contract: null, state: null, auditTrail: [] }

    const state = await apiQueryContractState(id)
    const auditData = await apiGetContractAuditTrail(id)

    return {
      contract,
      state,
      auditTrail: auditData.error ? [] : auditData.auditTrail || [],
    }
  } catch (error) {
    console.error("[v0] Failed to load contract:", error)
    return { contract: null, state: null, auditTrail: [] }
  }
}

export default async function ContractDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { contract, state, auditTrail } = await loadContractData(params.id)

  if (!contract) {
    return (
      <>
        <TopNav user={user} />
        <main className="mx-auto max-w-4xl p-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Not Found</CardTitle>
            </CardHeader>
          </Card>
        </main>
      </>
    )
  }

  const canExecute = user.role === "admin" || user.role === "insurer"
  const canRequestSettlement = user.role === "hospital"

  async function handleAction(action: string) {
    "use server"
    if (!user || !contract) return
    try {
      await apiExecuteAction({
        id: contract.id,
        actor: user,
        action: action as any,
      })
    } catch (error) {
      console.error("[v0] Action failed:", error)
    }
  }

  return (
    <>
      <TopNav user={user} />
      <main className="mx-auto max-w-4xl p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield size={28} className="text-primary" />
            Contract Details
          </h1>
          <Link href="/contracts">
            <Button variant="outline">Back to Contracts</Button>
          </Link>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-mono text-lg">
                <Shield size={20} />
                {contract.id}
              </CardTitle>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold text-white capitalize ${
                  contract.status === "active"
                    ? "bg-green-500"
                    : contract.status === "pending"
                      ? "bg-orange-500"
                      : contract.status === "completed"
                        ? "bg-blue-500"
                        : "bg-red-500"
                }`}
              >
                {contract.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <section className="grid gap-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground font-semibold">Claim ID</div>
                  <div className="font-mono text-sm mt-1">{contract.claimId}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground font-semibold">Policy ID</div>
                  <div className="font-mono text-sm mt-1">{contract.policyId}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground font-semibold">Amount</div>
                  <div className="font-bold text-sm mt-1 text-primary">{formatINR(contract.amount)}</div>
                </div>
              </div>
            </section>

            <Separator />

            <section className="grid gap-2">
              <div className="text-sm font-semibold mb-2">Parties</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Insurer</div>
                  <div className="text-sm mt-1">{contract.insurerId}</div>
                  <div className="font-mono text-xs text-muted-foreground mt-2">{contract.insurerWallet}</div>
                </div>
                <div className="p-3 bg-teal-50 dark:bg-teal-950 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="text-xs text-teal-700 dark:text-teal-300 font-semibold">Hospital</div>
                  <div className="text-sm mt-1">{contract.hospitalId}</div>
                  <div className="font-mono text-xs text-muted-foreground mt-2">{contract.hospitalWallet}</div>
                </div>
              </div>
            </section>

            <Separator />

            <section className="grid gap-2">
              <div className="text-sm font-semibold mb-2">Blockchain Details</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground font-semibold">Contract Address</div>
                  <div className="font-mono text-xs mt-1 break-all">{contract.address}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground font-semibold">Last Transaction</div>
                  <div className="font-mono text-xs mt-1 break-all">{contract.lastTxId || "-"}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground font-semibold">Hash</div>
                  <div className="font-mono text-xs mt-1 break-all">{contract.hash || "-"}</div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        {state && !state.error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold mt-1 capitalize">{state.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="font-semibold mt-1">{formatINR(state.balance)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Event Logs</p>
                  <p className="font-semibold mt-1">{state.eventLogs}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Update</p>
                  <p className="font-semibold mt-1 text-xs">{new Date(state.lastUpdate * 1000).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {auditTrail.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditTrail.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-muted rounded text-sm">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-semibold">{log.action}</div>
                      <div className="text-xs text-muted-foreground">
                        Block {log.blockNumber} • {new Date(log.timestamp * 1000).toLocaleString()}
                      </div>
                      <div className="font-mono text-xs mt-1 break-all text-muted-foreground">
                        {log.transactionHash}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {canExecute && (
                <>
                  <form action={handleAction.bind(null, "approve")}>
                    <Button
                      type="submit"
                      disabled={contract.status === "active"}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Approve
                    </Button>
                  </form>
                  <form action={handleAction.bind(null, "reject")}>
                    <Button type="submit" variant="destructive">
                      <AlertCircle size={16} className="mr-2" />
                      Reject
                    </Button>
                  </form>
                  <form action={handleAction.bind(null, "release_payment")}>
                    <Button type="submit" disabled={contract.status !== "active"} variant="outline">
                      Release Payment
                    </Button>
                  </form>
                </>
              )}
              {canRequestSettlement && (
                <form action={handleAction.bind(null, "request_settlement")}>
                  <Button type="submit" variant="outline">
                    Request Settlement
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
