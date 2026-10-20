import React, { useState } from 'react';
import { PRICING_TIERS, GUARANTEE_POINTS, PricingTier } from '../../data/pricing';

interface PricingTiersProps {
  onSelectTier?: (tierId: string) => void;
}

export const PricingTiers: React.FC<PricingTiersProps> = ({ onSelectTier }) => {
  const [selectedTier, setSelectedTier] = useState<string>('growth');
  const [showAgencyComparison, setShowAgencyComparison] = useState<boolean>(true);

  const handleCheckout = (tierId: string) => {
    if (onSelectTier) {
      onSelectTier(tierId);
    } else {
      // Direct checkout URL hook (e.g. LemonSqueezy or Stripe checkout link)
      window.location.href = `#checkout?plan=${tierId}`;
    }
  };

  return (
    <section id="pricing" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            100% One-Time Payment • No Monthly Subscriptions
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Transparent Pricing. High-Authority Backlinks.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Choose the package tailored to your startup stage. Pay once, keep your permanent backlinks forever. 
            All submissions delivered with a live verification sheet & screenshot proof.
          </p>

          {/* Social validation counter pill */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-full py-1.5 px-4">
            <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              1,420+ Startups Submitted
            </span>
            <span className="text-zinc-600">•</span>
            <span>4.95/5 Star Rating</span>
            <span className="text-zinc-600">•</span>
            <span className="text-indigo-400 font-medium">30-Day Money-Back Guarantee</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
          {PRICING_TIERS.map((tier) => {
            const isPopular = tier.popular;

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative rounded-3xl bg-zinc-900/80 border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'border-indigo-500/80 shadow-2xl shadow-indigo-500/15 lg:-translate-y-3 bg-gradient-to-b from-zinc-900/90 to-zinc-950 ring-2 ring-indigo-500/40'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/80'
                }`}
              >
                {/* Popular Ribbon */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[11px] font-extrabold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg shadow-indigo-500/30 flex items-center gap-1.5 whitespace-nowrap">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Card Header */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        {tier.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
                        {tier.tagline}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs line-through text-zinc-500 block">
                        ${tier.originalPrice}
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-3xl sm:text-4xl font-extrabold text-white">
                          ${tier.price}
                        </span>
                        <span className="text-zinc-400 text-xs ml-1 font-medium">one-time</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Highlights Metrics */}
                  <div className="grid grid-cols-2 gap-2 my-5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Curated Platforms</span>
                      <span className="text-white font-bold text-sm">{tier.directoriesCount} Directories</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Do-Follow Links</span>
                      <span className="text-emerald-400 font-bold text-sm">{tier.guaranteedDoFollow}+ Guaranteed</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Turnaround:</span>
                      <span className="text-indigo-400 font-medium">{tier.turnaround}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      What's Included:
                    </p>
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        {feature.included ? (
                          <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${feature.highlight ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="mt-0.5 rounded-full p-0.5 text-zinc-600 shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                        <span className={`${feature.included ? (feature.highlight ? 'text-zinc-100 font-semibold' : 'text-zinc-300') : 'text-zinc-600 line-through'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA & Micro-copy */}
                <div>
                  <button
                    onClick={() => handleCheckout(tier.id)}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg flex items-center justify-center gap-2 group ${
                      isPopular
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white hover:text-white border border-zinc-700/60'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <p className="text-center text-[11px] text-zinc-500 mt-2.5">
                    {tier.ctaSubtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Anchor: Launchdir vs Alternatives Table */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 mb-16 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">The Math Speaks For Itself</span>
              <h3 className="text-xl sm:text-3xl font-bold text-white mt-1">
                Why Founders Choose Launchdir Over Alternatives
              </h3>
            </div>
            <button
              onClick={() => setShowAgencyComparison(!showAgencyComparison)}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              {showAgencyComparison ? 'Hide Comparison' : 'Show Comparison'}
            </button>
          </div>

          {showAgencyComparison && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="py-3 px-4 font-medium">Comparison Factor</th>
                    <th className="py-3 px-4 font-semibold text-indigo-400 bg-indigo-500/5 rounded-t-xl">
                      Launchdir (Growth $99)
                    </th>
                    <th className="py-3 px-4 font-medium text-zinc-400">Doing It Yourself</th>
                    <th className="py-3 px-4 font-medium text-zinc-400">Traditional SEO Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Direct Cost</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 bg-indigo-500/5">$99 one-time</td>
                    <td className="py-3.5 px-4 text-zinc-400">$0 direct ($3,000+ opportunity cost)</td>
                    <td className="py-3.5 px-4 text-rose-400">$1,500 – $3,500/month retainer</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Time Required From You</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 bg-indigo-500/5">3 minutes (Intake form)</td>
                    <td className="py-3.5 px-4 text-zinc-400">60–80 hours of tedious form filling</td>
                    <td className="py-3.5 px-4 text-zinc-400">Multiple weekly sync meetings & onboarding</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Submission Quality</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 bg-indigo-500/5">100% Hand-formatted & verified</td>
                    <td className="py-3.5 px-4 text-zinc-400">Prone to burnout, fatigue & formatting mistakes</td>
                    <td className="py-3.5 px-4 text-zinc-400">Junior intern task or automated black-hat tools</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Duplicate Content Safeguards</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 bg-indigo-500/5">3–5 Custom Copy Variations</td>
                    <td className="py-3.5 px-4 text-zinc-400">Usually copy-paste same text (risk penalty)</td>
                    <td className="py-3.5 px-4 text-zinc-400">Varies widely</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Proof & Verification</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 bg-indigo-500/5">Live Sheet + Screenshot per directory</td>
                    <td className="py-3.5 px-4 text-zinc-400">Manual tracking</td>
                    <td className="py-3.5 px-4 text-zinc-400">Vague monthly PDF summary</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Delivery Turnaround</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 bg-indigo-500/5">48–72 hours</td>
                    <td className="py-3.5 px-4 text-zinc-400">3–6 weeks depending on founder free time</td>
                    <td className="py-3.5 px-4 text-zinc-400">30–60 days before first links live</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-white">Guarantee</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 bg-indigo-500/5">30-Day Money-Back & Rejection Warranty</td>
                    <td className="py-3.5 px-4 text-zinc-400">None</td>
                    <td className="py-3.5 px-4 text-zinc-400">Locked into 6-month contract</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4 Pillars of Risk Reversal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GUARANTEE_POINTS.map((g, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1.5">{g.title}</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">{g.description}</p>
            </div>
          ))}
        </div>

        {/* Secure Checkout Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 text-xs text-zinc-500">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>256-Bit SSL Encrypted Checkout via Stripe • Visa, Mastercard, Apple Pay, Google Pay</span>
          </div>
        </div>
      </div>
    </section>
  );
};
