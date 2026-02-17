import { cookies } from "next/headers"
import { findUserByEmail, findUserById } from "./db"
import type { Role, User } from "./types"

const SESSION_COOKIE = "mi_claims_session"

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { userId: string }
    const user = findUserById(parsed.userId)
    return user ?? null
  } catch {
    return null
  }
}

export async function signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
  const user = findUserByEmail(email)
  if (!user || user.password !== password) return { error: "Invalid email or password" }
  const store = await cookies()
  store.set(SESSION_COOKIE, JSON.stringify({ userId: user.id }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  return { user }
}

export async function signOut() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export function hasRole(user: User | null, allowed: Role[]): boolean {
  if (!user) return false
  return allowed.includes(user.role)
}
