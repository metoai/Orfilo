import React from 'react';
import { Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { ORFILO_PRICING_TIERS, ORFILO_GUARANTEE_POINTS } from '../../data/orfilo/pricing';

interface OrfiloPricingProps {
  onSelectTier: (tierId: string) => void;
}

export const OrfiloPricing: React.FC<OrfiloPricingProps> = ({ onSelectTier }) => {
  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#19A974]">
          <Sparkles className="size-3.5 fill-[#19A974]" />
          <span>Honest Early Adopter Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-tight">
          Pay once, organize forever. <br />
          No recurring subscription trap.
        </h2>
        <p className="text-[14px] text-[#636363] leading-relaxed">
          We are just launching into public beta. Help us shape the future of AI deliverable 
          organization and lock in lifetime access before recurring monthly pricing begins.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {ORFILO_PRICING_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col justify-between rounded-3xl p-7 lg:p-8 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              tier.isPopular
                ? 'bg-white border-2 border-[#19A974] shadow-[0_20px_45px_-12px_rgba(25,169,116,0.18)] scale-[1.02] z-10'
                : 'bg-white/80 border border-[#ECE7E1] shadow-xs hover:border-[#D5CFCE]'
            }`}
          >
            {/* Popular Badge */}
            {tier.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-[#19A974] px-3.5 py-1 text-[11px] font-bold text-white tracking-wide uppercase shadow-xs whitespace-nowrap">
                  {tier.badge}
                </span>
              </div>
            )}

            {/* Top Details */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-[#141414]">{tier.name}</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed min-h-[36px]">
                  {tier.description}
                </p>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-2 border-b border-[#F0EBE5] pb-5">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#121212] tracking-tight font-mono">
                  {tier.price}
                </span>
                <span className="text-xs font-medium text-[#777777]">
                  / {tier.period}
                </span>
              </div>

              {/* Features List */}
              <div className="flex flex-col gap-3 py-2">
                <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                  What&apos;s Included
                </span>
                {tier.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-[13px] text-[#2E2E2E]">
                    <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#E8F7F0] text-[#19A974] mt-0.5">
                      <Check className="size-2.5 stroke-[2.5]" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => onSelectTier(tier.id)}
              className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-[13.5px] font-semibold transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] cursor-pointer ${
                tier.isPopular
                  ? 'bg-[#19A974] text-white shadow-sm hover:bg-[#158C60]'
                  : 'bg-[#121212] text-white hover:bg-black'
              }`}
            >
              <span>{tier.ctaLabel}</span>
              <ArrowRight className="size-3.5 stroke-[2.2]" />
            </button>
          </div>
        ))}
      </div>

      {/* Guarantee & Trust Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl bg-[#FAF8F5] border border-[#ECE7E1] p-6 sm:p-8">
        {ORFILO_GUARANTEE_POINTS.map((pt, idx) => (
          <div key={idx} className="flex items-start gap-3.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#E8F7F0] text-[#19A974]">
              <ShieldCheck className="size-4.5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-[13.5px] font-bold text-[#141414]">{pt.title}</h4>
              <p className="text-[12px] text-[#666666] leading-relaxed">{pt.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
