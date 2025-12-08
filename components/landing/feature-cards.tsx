import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "Fast Intake",
    desc: "Guided forms with validations reduce errors and speed up submissions.",
  },
  {
    title: "Real‑time Tracking",
    desc: "See claim status updates instantly across all stakeholders.",
  },
  {
    title: "Compliance & Audit",
    desc: "Immutable logs and role-based access for HIPAA‑aligned workflows.",
  },
  {
    title: "Smart Detection",
    desc: "Flag anomalies and duplicates with built‑in heuristics.",
  },
]

export function FeatureCards() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">Everything you need to process claims</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Modern tools to accelerate your operations from intake to settlement.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="h-full">
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.desc}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
