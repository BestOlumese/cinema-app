import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Do I need a sales call to get started?",
    answer:
      "No. CineSuite is fully self-serve — sign up, choose independent or chain, and start configuring your cinema right away.",
  },
  {
    question: "What's the difference between independent and chain?",
    answer:
      "Independent is a single self-contained cinema. Chain/head-office is one account managing multiple branches, with circuit-wide reporting and centralized pricing/film templates branches can inherit or override.",
  },
  {
    question: "Does box office still work if the internet goes down?",
    answer:
      "Yes. Box office and concessions POS are offline-first — sales queue locally and sync automatically once connectivity returns.",
  },
  {
    question: "What payment methods can my customers use?",
    answer:
      "Card and bank transfer via Paystack, USSD, mobile money (OPay, PalmPay), and cash at the box office.",
  },
  {
    question: "Can I start independent and add branches later?",
    answer:
      "Yes — the underlying data model supports adding branches later without a migration.",
  },
];

export function LandingFaq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h2 className="text-center text-2xl font-semibold text-foreground">
        Frequently asked questions
      </h2>

      <Accordion className="mt-8" multiple>
        {FAQS.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
