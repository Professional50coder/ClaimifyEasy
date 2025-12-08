import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "ClaimifyEasy — Medical Insurance Claims SaaS",
  description:
    "ClaimifyEasy helps teams submit, track, and settle medical insurance claims faster with secure, compliant workflows.",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="font-sans">
        <Suspense
          fallback={
            <div className="min-h-dvh flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          }
        >
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
