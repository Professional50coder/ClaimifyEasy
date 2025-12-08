import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"
import { RoleBadge } from "./role-badge"
import type { User } from "@/lib/types"

interface TopNavProps {
  user: User | null
}

export default function TopNav({ user }: TopNavProps) {
  async function signOutAction() {
    "use server"
    await signOut()
  }

  return (
    <header className="w-full border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo-claimifyeasy.jpg" alt="ClaimifyEasy" className="h-5 w-5" />
          <span>ClaimifyEasy</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className="text-sm hover:underline">
            Product
          </Link>
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
          <Link href="/claims" className="text-sm hover:underline">
            Claims
          </Link>
          <Link href="/contracts" className="text-sm hover:underline">
            Smart Contracts
          </Link>
          {user?.role === "patient" && (
            <Link href="/claims/new" className="text-sm hover:underline">
              New Claim
            </Link>
          )}
          {user && (
            <Link href="/settings" className="text-sm hover:underline">
              Settings
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm">{user.name}</span>
              <RoleBadge role={user.role} />
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
