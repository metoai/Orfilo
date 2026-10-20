import React from 'react';
import { Star, Sparkles, Quote } from 'lucide-react';
import {
  ORFILO_TESTIMONIALS,
  ORFILO_SOCIAL_PROOF_METRICS,
} from '../../data/orfilo/testimonials';

export const OrfiloTestimonials: React.FC = () => {
  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#19A974]">
          <Sparkles className="size-3.5 fill-[#19A974]" />
          <span>Loved by AI Engineers & Creators</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-tight">
          Built for builders who generate <br />
          hundreds of assets every week
        </h2>
        <p className="text-[14px] text-[#636363] leading-relaxed">
          See how designers, developers, and founders use Orfilo to reclaim their
          sanity and eliminate messy Downloads folders.
        </p>
      </div>

      {/* Social Proof Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-2xl bg-[#FAF8F5] border border-[#ECE7E1]">
        {ORFILO_SOCIAL_PROOF_METRICS.map((metric, idx) => (
          <div key={idx} className="flex flex-col items-center text-center gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#121212] font-mono tracking-tight">
              {metric.value}
            </span>
            <span className="text-xs font-medium text-[#666666]">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {ORFILO_TESTIMONIALS.map((item) => (
          <div
            key={item.id}
            className="relative flex flex-col justify-between gap-6 rounded-2xl bg-white border border-[#ECE7E1] p-6 sm:p-7 shadow-xs transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.06)]"
          >
            {/* Stars & Metric Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#F59E0B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-[#F59E0B]" />
                ))}
              </div>
              <span className="text-[10.5px] font-bold text-[#19A974] bg-[#E8F7F0] px-2.5 py-0.5 rounded-full">
                {item.highlightMetric}
              </span>
            </div>

            {/* Quote */}
            <p className="text-[13.5px] text-[#2E2E2E] leading-relaxed italic">
              &ldquo;{item.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#F2ECE4]">
              <img
                src={item.avatarUrl}
                alt={item.name}
                className="size-10 rounded-full object-cover border border-[#E5DFD7]"
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#141414] leading-snug">
                  {item.name}
                </span>
                <span className="text-[11px] text-[#777777]">
                  {item.role} • {item.company}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
