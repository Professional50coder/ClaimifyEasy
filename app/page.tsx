import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { default as LandingPage } from "./landing/page"

export default async function Home() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
