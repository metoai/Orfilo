import React, { useState } from 'react';
import { FAQ_ITEMS, FaqItem } from '../../data/faqs';

export const ConversionFaq: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('backlink-quality');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState<string>('');

  const categories = ['All', 'Quality', 'Process', 'Guarantees', 'Pricing'];

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(faqSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white border-t border-zinc-900">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-950/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Everything You Need To Know
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Got questions about backlink safety, index guarantees, or turnaround times? We have got you covered.
          </p>

          {/* Quick FAQ Search Bar */}
          <div className="mt-8 max-w-lg mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search questions (e.g. Google penalty, refund, speed)..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all shadow-lg"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-400 text-sm">No questions matched your search criteria.</p>
              <button
                onClick={() => {
                  setFaqSearch('');
                  setActiveCategory('All');
                }}
                className="mt-3 text-xs text-indigo-400 hover:underline"
              >
                Clear search and show all
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-zinc-900/90 border-indigo-500/50 shadow-xl shadow-indigo-500/5'
                      : 'bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      {faq.badge && (
                        <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {faq.badge}
                        </span>
                      )}
                      <span className="font-bold text-white text-sm sm:text-base pr-2">
                        {faq.question}
                      </span>
                    </div>

                    <div className={`p-1 rounded-full bg-zinc-800/80 text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white bg-indigo-600' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-zinc-300 text-xs sm:text-sm leading-relaxed border-t border-zinc-800/60 pt-4 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Live Support / Objection Buster Card */}
        <div className="mt-14 bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Have a specific launch question or custom directory need?</h4>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Speak directly with a Launchdir strategist. Average response time under 15 minutes.
              </p>
            </div>
          </div>

          <a
            href="mailto:support@launchdir.com?subject=Launchdir%20Question"
            className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap border border-zinc-700"
          >
            Chat With A Strategist
          </a>
        </div>
      </div>
    </section>
  );
};
