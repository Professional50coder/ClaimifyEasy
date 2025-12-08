import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import TopNav from "@/components/top-nav"
import { Hero } from "@/components/landing/hero"
import { LogosBar } from "@/components/landing/logos-bar"
import { FeatureCards } from "@/components/landing/feature-cards"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { CTABanner } from "@/components/landing/cta-banner"
import { ScreenshotsGallery } from "@/components/landing/screenshots-gallery"

export default async function LandingPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <>
      <TopNav />
      <main>
        <Hero />
        <LogosBar />
        <FeatureCards />
        <ScreenshotsGallery />
        <Pricing />
        <FAQ />
        <CTABanner />
      </main>
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Medical Insurance Claims. All rights reserved.
        </div>
      </footer>
    </>
  )
}
