import { ChevronDown } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFaqSchema, type FaqItem } from "@/lib/seo";

interface FaqSectionProps {
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
  faqs: FaqItem[];
  accentColor?: "blue" | "emerald";
  bgClass?: string;
}

export function FaqSection({
  eyebrow = "Frequently Asked Questions",
  heading = "Common questions, clear answers.",
  subtitle,
  faqs,
  accentColor = "blue",
  bgClass = "bg-[#fbfbfd]",
}: FaqSectionProps) {
  const accentText =
    accentColor === "emerald" ? "text-[#15803d]" : "text-[#0071e3]";

  return (
    <section className={`py-16 sm:py-20 border-t border-black/[0.06] ${bgClass}`}>
      <JsonLd data={buildFaqSchema(faqs)} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className={`text-xs font-semibold uppercase tracking-widest ${accentText}`}>
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f]">
            {heading}
          </h2>
          {subtitle && (
            <p className="mt-2.5 text-sm sm:text-base text-[#6e6e73]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={faq.question}
              open={idx === 0}
              className="group rounded-2xl border border-black/[0.06] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] open:shadow-[0_6px_22px_rgba(0,0,0,0.04)] transition"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm sm:text-base font-semibold text-[#1d1d1f]">
                <span>{faq.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#86868b] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 pt-3 border-t border-black/[0.05] text-xs sm:text-sm text-[#424245] leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
