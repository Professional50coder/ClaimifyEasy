import { Sidebar } from "@/components/sidebar"
import { getCurrentUser, signOut } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  async function signOutAction() {
    "use server"
    await signOut()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user?.name} userRole={user?.role} onSignOut={signOutAction} />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-3xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your account, notifications, and preferences</p>
          </header>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Basic information for your ClaimifyEasy account.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" defaultValue={user?.name} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Hospital / Insurer / Admin" />
                </div>
                <div className="md:col-span-2">
                  <Button>Save changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Claim status updates</p>
                    <p className="text-sm text-muted-foreground">Email when claim state changes</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Settlement alerts</p>
                    <p className="text-sm text-muted-foreground">Notify when a settlement is requested</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly summary</p>
                    <p className="text-sm text-muted-foreground">Digest with analytics and KPIs</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
