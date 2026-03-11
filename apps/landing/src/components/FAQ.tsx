import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StructuredData } from "./StructuredData";

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
  /** Plain-text version for JSON-LD schema. Falls back to answer if omitted. */
  schemaAnswer?: string;
}

function FAQAccordionItem({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item${open ? " faq-item-open" : ""}`}>
      <dt>
        <button
          className="faq-question"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`faq-answer-${index}`}
          id={`faq-question-${index}`}
        >
          <span>{item.question}</span>
          <ChevronDown
            size={16}
            className={`faq-chevron${open ? " faq-chevron-open" : ""}`}
          />
        </button>
      </dt>
      <dd
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`faq-answer${open ? " faq-answer-open" : ""}`}
      >
        <div className="faq-answer-inner">
          <p>{item.answer}</p>
        </div>
      </dd>
    </div>
  );
}

export function FAQ({
  items,
  includeSchema = true,
}: {
  items: FAQItem[];
  includeSchema?: boolean;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.schemaAnswer ?? (typeof item.answer === "string" ? item.answer : ""),
      },
    })),
  };

  return (
    <>
      {includeSchema && <StructuredData schema={schema} />}
      <dl className="faq-list">
        {items.map((item, i) => (
          <FAQAccordionItem key={i} item={item} index={i} />
        ))}
      </dl>
    </>
  );
}
