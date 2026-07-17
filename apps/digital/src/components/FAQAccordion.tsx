import React, { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-bordergray rounded-xl border border-bordergray bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              className="flex min-h-[48px] w-full items-center justify-between gap-4 px-6 py-4 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-textdark">{item.question}</span>
              <span
                className={`shrink-0 text-gold transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden
              >
                ▼
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-4 text-textlight">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
