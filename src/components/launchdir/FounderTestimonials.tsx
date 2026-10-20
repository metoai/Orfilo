import React, { useState, useMemo } from 'react';
import { FOUNDER_TESTIMONIALS, SOCIAL_PROOF_METRICS, FounderTestimonial } from '../../data/testimonials';

export const FounderTestimonials: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const categories = ['All', 'SaaS', 'AI', 'DevTools', 'Mobile'];

  const filteredTestimonials = useMemo(() => {
    if (selectedFilter === 'All') return FOUNDER_TESTIMONIALS;
    return FOUNDER_TESTIMONIALS.filter((t) => t.category === selectedFilter);
  }, [selectedFilter]);

  return (
    <section id="testimonials" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white overflow-hidden border-t border-zinc-900">
      {/* Background radial lighting */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[400px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Verified Founder Case Studies
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Real Founders. Real Traffic & DR Surges.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            See how founders jumpstart their search authority, land paying users from directory searches, 
            and dominate Google organic rankings in weeks.
          </p>
        </div>

        {/* Global Impact Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-xl mb-12 shadow-2xl">
          <div className="text-center p-3 border-r border-zinc-800/60 last:border-0">
            <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {SOCIAL_PROOF_METRICS.startupsLaunched}
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">Startups Indexed</div>
          </div>
          <div className="text-center p-3 border-r border-zinc-800/60 last:border-0">
            <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
              {SOCIAL_PROOF_METRICS.totalBacklinksBuilt}
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">Live Backlinks Built</div>
          </div>
          <div className="text-center p-3 border-r border-zinc-800/60 last:border-0">
            <div className="text-2xl sm:text-4xl font-extrabold text-indigo-400 tracking-tight">
              {SOCIAL_PROOF_METRICS.averageDrJump}
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">Avg 30-Day DR Increase</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-400 tracking-tight flex items-center justify-center gap-1.5">
              <span>★</span>
              <span>4.95</span>
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">Founder Satisfaction</div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex justify-center items-center gap-2 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {cat} Case Studies
            </button>
          ))}
        </div>

        {/* Testimonial Cards Masonry / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((t) => {
            const drDiff = t.drAfter - t.drBefore;

            return (
              <div
                key={t.id}
                className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-indigo-500/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-indigo-500/5 group"
              >
                <div>
                  {/* Top: Avatar, Name, Company & Verified Pill */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm sm:text-base flex items-center gap-1.5">
                          {t.name}
                          {t.verified && (
                            <span title="Verified Launchdir Customer" className="text-indigo-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </h4>
                        <p className="text-zinc-400 text-xs">
                          {t.role} • <span className="text-zinc-300 font-medium">{t.company}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                      {t.tierPurchased} Plan
                    </span>
                  </div>

                  {/* Primary DR & Traffic Impact Box */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                        Ahrefs DR Shift
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xs text-zinc-400">DR {t.drBefore}</span>
                        <span className="text-zinc-600">→</span>
                        <span className="text-base font-extrabold text-emerald-400">
                          DR {t.drAfter}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded">
                          +{drDiff}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                        Organic Impact
                      </span>
                      <div className="text-sm font-bold text-indigo-300 mt-0.5">
                        {t.trafficGrowth}
                      </div>
                    </div>
                  </div>

                  {/* Founder Quote */}
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{t.revenueOrUsers}</span>
                  </div>
                  <span className="text-zinc-500 font-medium">
                    Timeframe: <strong className="text-zinc-300">{t.daysToResult}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Proof Verification Guarantee Bar */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Full Transparency & Screenshot Proof</h4>
              <p className="text-xs text-zinc-400">
                Every customer receives a personal Google Sheets dashboard with live links, submission timestamps, and proof screenshots.
              </p>
            </div>
          </div>
          <a
            href="#pricing"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 whitespace-nowrap inline-flex items-center gap-1"
          >
            Start your DR jump today →
          </a>
        </div>
      </div>
    </section>
  );
};
