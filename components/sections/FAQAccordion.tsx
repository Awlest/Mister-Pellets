import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQAccordionProps {
  title?: string;
  description?: string;
  items: FAQItem[];
}

export function FAQAccordion({
  title = "Questions fréquentes",
  description,
  items,
}: FAQAccordionProps) {
  return (
    <section className="py-16 md:py-24 bg-mp-cream">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-lg text-mp-ink-soft mb-10 leading-relaxed">{description}</p>
        )}

        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
