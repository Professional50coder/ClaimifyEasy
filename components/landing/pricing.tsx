import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "₹0",
    desc: "For small teams evaluating the product.",
    items: ["Up to 100 claims/mo", "Basic reports", "Email support"],
    cta: "Try free",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹24,999",
    desc: "Best for growing operations.",
    items: ["10k claims/mo", "Advanced analytics", "Priority support"],
    cta: "Start Pro",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Security, scale, and SLAs.",
    items: ["Unlimited claims", "SAML SSO", "Dedicated CSM"],
    cta: "Contact sales",
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">Simple, transparent pricing</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Choose a plan that fits your claim volume and compliance needs.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.name} className={p.featured ? "border-primary ring-1 ring-primary/20" : ""}>
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span>{p.name}</span>
                  <span className="text-2xl">{p.price}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {p.items.map((i) => (
                    <li key={i}>• {i}</li>
                  ))}
                </ul>
                <Button className="mt-4 w-full" variant={p.featured ? "default" : "outline"}>
                  {p.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
