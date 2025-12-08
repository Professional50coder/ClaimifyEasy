import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    q: "Is my data secure?",
    a: "Yes. We enforce encryption in transit and at rest, granular roles, and audit trails.",
  },
  {
    q: "How fast can we get started?",
    a: "Most teams onboard in under a day using our guided intake and sample data.",
  },
  {
    q: "Do you support custom workflows?",
    a: "Yes. Define statuses and approvals to match your internal processes.",
  },
]

export function FAQ() {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="mb-4 text-center text-3xl font-semibold">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
