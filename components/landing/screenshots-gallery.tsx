"use client"

export function ScreenshotsGallery() {
  const items = [
    { alt: "Claims pipeline", src: "/images/screenshots/pipeline.jpg" },
    { alt: "Analytics overview", src: "/images/screenshots/analytics.jpg" },
    { alt: "Policy lookup", src: "/images/screenshots/policy-lookup.jpg" },
  ]
  return (
    <section aria-label="Product screenshots" className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-balance text-2xl font-semibold md:text-3xl">See the product in action</h2>
        <p className="mt-2 text-muted-foreground">
          A modern, secure interface built for hospitals, TPAs, and insurers to collaborate in real time.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((it) => (
            <figure key={it.alt} className="rounded-lg border bg-card p-2 transition-transform hover:scale-[1.01]">
              <img
                alt={it.alt}
                src={it.src || "/placeholder.svg?height=360&width=600&query=medical%20claims%20screenshot"}
                className="h-auto w-full rounded-md"
              />
              <figcaption className="mt-2 px-1 text-xs text-muted-foreground">{it.alt}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
