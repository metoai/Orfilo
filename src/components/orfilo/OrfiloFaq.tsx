import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { ORFILO_FAQS } from '../../data/orfilo/faqs';

export const OrfiloFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#19A974]">
          <Sparkles className="size-3.5 fill-[#19A974]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-tight">
          Everything you need to know <br />
          about Orfilo
        </h2>
        <p className="text-[14px] text-[#636363] leading-relaxed">
          Have more questions? Read our transparent answers below or reach out to our team anytime.
        </p>
      </div>

      {/* Accordion List */}
      <div className="flex flex-col gap-3.5 max-w-3xl mx-auto w-full">
        {ORFILO_FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl transition-all duration-200 border ${
                isOpen
                  ? 'bg-white border-[#19A974]/40 shadow-xs'
                  : 'bg-white/80 border-[#ECE7E1] hover:border-[#D5CFCE]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer select-none"
              >
                <span className="text-[15px] sm:text-base font-semibold text-[#141414]">
                  {faq.question}
                </span>
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#444444] transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#19A974] bg-[#E8F7F0]' : ''
                  }`}
                >
                  <ChevronDown className="size-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-[13.5px] sm:text-[14px] text-[#555555] leading-relaxed border-t border-[#F2ECE4]">
                  <p className="pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
