import { Button } from "@/components/ui/button"

export function CTABanner() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h3 className="text-balance text-2xl font-semibold">Ready to modernize your claims?</h3>
          <div className="flex gap-3">
            <Button variant="secondary" className="bg-primary-foreground text-primary">
              Request access
            </Button>
            <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground bg-transparent">
              Talk to sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
