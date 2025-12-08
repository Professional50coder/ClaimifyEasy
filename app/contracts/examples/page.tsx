import { getCurrentUser, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LazySection } from "@/components/lazy-section"
import Link from "next/link"
import { ArrowLeft, Code } from "lucide-react"
import { solidityClaimContract, rustClaimContract } from "@/lib/sample-data"

async function signOutAction() {
  "use server"
  await signOut()
}

export default async function ContractExamplesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "patient") {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userName={user.name} userRole={user.role} onSignOut={signOutAction} />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Access Denied</CardTitle>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.name} userRole={user.role} onSignOut={signOutAction} />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <LazySection>
          <div className="mb-8 flex items-center gap-4">
            <Link href="/contracts">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={16} />
                Back to Contracts
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Code size={32} className="text-primary" />
                Smart Contract Examples
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Production-ready smart contract implementations for medical insurance claims
              </p>
            </div>
          </div>
        </LazySection>

        <LazySection delay={100}>
          <Tabs defaultValue="solidity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="solidity">Solidity (Ethereum)</TabsTrigger>
              <TabsTrigger value="rust">Rust (Solana)</TabsTrigger>
            </TabsList>

            <TabsContent value="solidity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code size={20} />
                    {solidityClaimContract.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{solidityClaimContract.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-100 font-mono whitespace-pre-wrap break-words">
                      <code>{solidityClaimContract.code}</code>
                    </pre>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Language</p>
                      <p className="text-sm font-semibold mt-1">Solidity ^0.8.0</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Blockchain</p>
                      <p className="text-sm font-semibold mt-1">Ethereum, Polygon, Arbitrum</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Use Case</p>
                      <p className="text-sm font-semibold mt-1">EVM-based blockchains</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100 text-sm">Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <p>✓ Submit claims with diagnosis and amount</p>
                  <p>✓ Insurer approval workflow</p>
                  <p>✓ Secure fund transfer to hospital</p>
                  <p>✓ Event logging for transparency</p>
                  <p>✓ Status tracking (PENDING → APPROVED → SETTLED)</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rust" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code size={20} />
                    {rustClaimContract.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{rustClaimContract.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-100 font-mono whitespace-pre-wrap break-words">
                      <code>{rustClaimContract.code}</code>
                    </pre>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Language</p>
                      <p className="text-sm font-semibold mt-1">Rust + Anchor</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Blockchain</p>
                      <p className="text-sm font-semibold mt-1">Solana</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Use Case</p>
                      <p className="text-sm font-semibold mt-1">High-speed settlement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-orange-900 dark:text-orange-100 text-sm">Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                  <p>✓ Anchor framework for type safety</p>
                  <p>✓ Claims stored in on-chain accounts</p>
                  <p>✓ Insurer authorization checks</p>
                  <p>✓ Direct SOL transfers via system program</p>
                  <p>✓ Custom error handling with error codes</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </LazySection>

        <LazySection delay={200} className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Solidity Deployment</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Install Hardhat: npm install --save-dev hardhat</li>
                    <li>2. Initialize project: npx hardhat init</li>
                    <li>3. Compile contract: npx hardhat compile</li>
                    <li>4. Deploy to testnet: npx hardhat run scripts/deploy.js --network goerli</li>
                    <li>5. Verify on Etherscan using Hardhat plugin</li>
                  </ol>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Rust Deployment</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Install Rust and Solana CLI</li>
                    <li>2. Install Anchor: cargo install --git https://github.com/coral-xyz/anchor</li>
                    <li>3. Build program: anchor build</li>
                    <li>4. Deploy to devnet: anchor deploy --provider.cluster devnet</li>
                    <li>5. Run tests: anchor test</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </LazySection>
      </main>
    </div>
  )
}
