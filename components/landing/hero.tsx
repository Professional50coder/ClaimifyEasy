"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-xs font-medium text-accent">Medical Claims SaaS</p>
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-6xl">
              Process medical insurance claims faster. Collaborate securely.
            </h1>
            <p className="text-pretty text-muted-foreground md:text-lg">
              Submit, track, and settle claims with real-time visibility, audit-ready logs, and role-based access.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button className="px-6">Get a demo</Button>
              </Link>
              <Link href="/claims">
                <Button variant="outline" className="px-6 bg-transparent">
                  Explore product
                </Button>
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-4 pt-4 text-sm text-muted-foreground md:grid-cols-4">
              <li>
                <span className="font-semibold text-foreground">98%</span> automation
              </li>
              <li>
                <span className="font-semibold text-foreground">6x</span> faster settlement
              </li>
              <li>
                <span className="font-semibold text-foreground">99.9%</span> uptime
              </li>
              <li>
                <span className="font-semibold text-foreground">SOC2</span> compliant
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <img
                alt="Claims dashboard preview"
                src={"/images/screenshots/dashboard.jpg"}
                className="h-auto w-full rounded-md"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <img
                alt="Claims submission form"
                src={"/images/screenshots/claim-form.jpg"}
                className="h-auto w-full rounded-md border animate-float"
                style={{ animationDelay: "0.2s" }}
              />
              <img
                alt="Settlement timeline"
                src={"/images/screenshots/settlement-timeline.jpg"}
                className="h-auto w-full rounded-md border animate-float"
                style={{ animationDelay: "0.6s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
