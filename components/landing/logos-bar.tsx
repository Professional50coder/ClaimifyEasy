export function LogosBar() {
  const logos = [
    { name: "HospitalOne", alt: "HospitalOne", src: "/hospital-logo-1.jpg" },
    { name: "CarePlus", alt: "CarePlus", src: "/hospital-logo-2.jpg" },
    { name: "InsureCo", alt: "InsureCo", src: "/insurance-logo-1.jpg" },
    { name: "MediTrust", alt: "MediTrust", src: "/health-logo-1.jpg" },
    { name: "HealthWorks", alt: "HealthWorks", src: "/health-logo-2.jpg" },
    { name: "ZenLife", alt: "ZenLife", src: "/insurance-logo-2.jpg" },
  ]
  return (
    <section aria-label="Trusted by" className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Trusted by forward-thinking providers and insurers
        </p>
        <div className="grid grid-cols-2 place-items-center gap-8 opacity-80 md:grid-cols-6">
          {logos.map((l) => (
            <img
              key={l.name}
              alt={l.alt}
              src={l.src || "/placeholder.svg?height=32&width=96&query=partner%20logo"}
              className="h-8 w-auto opacity-80"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
