import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSiteContent } from "@/hooks/useSiteContent";

export const FAQ = () => {
  const { content: { faq } } = useSiteContent();
  return (
    <section id="faq" className="py-12 md:py-24 px-6 bg-secondary/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Pertanyaan</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">Sering <em className="text-gradient-gold">Ditanyakan</em></h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faq.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass rounded-2xl border-0 px-6">
              <AccordionTrigger className="text-left font-serif text-lg hover:no-underline py-5">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
