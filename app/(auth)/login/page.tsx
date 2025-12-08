import { signIn, getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect("/dashboard")

  async function loginAction(formData: FormData) {
    "use server"
    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")
    const res = await signIn(email, password)
    if (res.error) {
      // naive error redirect with query param
      redirect("/login?error=1")
    }
    redirect("/dashboard")
  }

  async function loginAdmin() {
    "use server"
    const res = await signIn("admin@example.com", "password")
    if (res?.error) redirect("/login?error=1")
    redirect("/dashboard")
  }

  async function loginInsurer() {
    "use server"
    const res = await signIn("insurer@example.com", "password")
    if (res?.error) redirect("/login?error=1")
    redirect("/dashboard")
  }

  async function loginHospital() {
    "use server"
    const res = await signIn("hospital@example.com", "password")
    if (res?.error) redirect("/login?error=1")
    redirect("/dashboard")
  }

  async function loginPatient() {
    "use server"
    const res = await signIn("patient@example.com", "password")
    if (res?.error) redirect("/login?error=1")
    redirect("/dashboard")
  }

  return (
    <main className="mx-auto flex min-h-[80dvh] max-w-md items-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <form action={loginAdmin}>
              <Button type="submit" variant="default" className="w-full">
                Sign in as Admin
              </Button>
            </form>
            <form action={loginInsurer}>
              <Button type="submit" variant="secondary" className="w-full">
                Sign in as Insurer
              </Button>
            </form>
            <form action={loginHospital}>
              <Button type="submit" variant="outline" className="w-full bg-transparent">
                Sign in as Hospital
              </Button>
            </form>
            <form action={loginPatient}>
              <Button type="submit" variant="ghost" className="w-full">
                Sign in as Patient
              </Button>
            </form>
          </div>

          <form action={loginAction} className="mt-2 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="pt-2">
            <Link href="/" className="text-xs underline">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
