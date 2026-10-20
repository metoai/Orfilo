import React, { useState, useMemo } from 'react';
import { DIRECTORIES_DATA, Directory } from '../../data/directories';

interface DirectoryExplorerProps {
  onSelectTier?: (tier: string) => void;
}

export const DirectoryExplorer: React.FC<DirectoryExplorerProps> = ({ onSelectTier }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minDr, setMinDr] = useState<number>(0);
  const [dofollowOnly, setDofollowOnly] = useState<boolean>(false);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dr' | 'traffic' | 'speed'>('dr');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories = ['All', 'SaaS', 'AI', 'Mobile', 'DevTools', 'Fintech'];

  // Parse traffic string to number for sorting (e.g. "5.4M" -> 5400000, "480K" -> 480000)
  const parseTraffic = (traffic: string): number => {
    const clean = traffic.toUpperCase().trim();
    if (clean.endsWith('M')) {
      return parseFloat(clean.replace('M', '')) * 1000000;
    }
    if (clean.endsWith('K')) {
      return parseFloat(clean.replace('K', '')) * 1000;
    }
    return parseFloat(clean) || 0;
  };

  const filteredDirectories = useMemo(() => {
    return DIRECTORIES_DATA.filter((dir) => {
      const matchesSearch =
        dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.categories.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dir.badge && dir.badge.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || dir.categories.includes(selectedCategory as any);

      const matchesDr = dir.domainRating >= minDr;

      const matchesDoFollow = !dofollowOnly || dir.backlinkType === 'Do-Follow';

      const matchesTier =
        selectedTierFilter === 'All' ||
        (selectedTierFilter === 'Starter' && dir.tier === 'Starter') ||
        (selectedTierFilter === 'Growth' && (dir.tier === 'Starter' || dir.tier === 'Growth')) ||
        (selectedTierFilter === 'Scale');

      return matchesSearch && matchesCategory && matchesDr && matchesDoFollow && matchesTier;
    }).sort((a, b) => {
      if (sortBy === 'dr') {
        return b.domainRating - a.domainRating;
      }
      if (sortBy === 'traffic') {
        return parseTraffic(b.monthlyTraffic) - parseTraffic(a.monthlyTraffic);
      }
      if (sortBy === 'speed') {
        const speedWeight = { Instant: 3, '24-48 hrs': 2, '3-5 days': 1 };
        return (speedWeight[b.submissionSpeed] || 0) - (speedWeight[a.submissionSpeed] || 0);
      }
      return 0;
    });
  }, [searchTerm, selectedCategory, minDr, dofollowOnly, selectedTierFilter, sortBy]);

  const totalDofollow = useMemo(() => {
    return filteredDirectories.filter((d) => d.backlinkType === 'Do-Follow').length;
  }, [filteredDirectories]);

  const avgDr = useMemo(() => {
    if (!filteredDirectories.length) return 0;
    const sum = filteredDirectories.reduce((acc, curr) => acc + curr.domainRating, 0);
    return Math.round(sum / filteredDirectories.length);
  }, [filteredDirectories]);

  return (
    <section id="directory-database" className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Verified Directory Database
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Explore 150+ High-Authority Directories
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Search our curated index of domain powerhouses. Filter by DR, category, and do-follow status. 
            Every single submission is hand-verified with live screenshot proof.
          </p>
        </div>

        {/* Live Filter Controls Bar */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl mb-8 shadow-2xl">
          {/* Top Row: Search + View Mode + Sort */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-5 border-b border-zinc-800/80">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name (e.g. Product Hunt, AlternativeTo, AI)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white text-xs font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Sort Dropdown & View Mode */}
            <div className="flex items-center gap-3 justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="dr">Highest DR</option>
                  <option value="traffic">Monthly Traffic</option>
                  <option value="speed">Submission Speed</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Category Chips & Secondary Filters */}
          <div className="pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-400'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Micro-Toggles: Min DR & Do-Follow */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium">
              {/* DR Threshold */}
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5">
                <span className="text-zinc-400">Min DR:</span>
                <div className="flex gap-1">
                  {[0, 75, 85].map((val) => (
                    <button
                      key={val}
                      onClick={() => setMinDr(val)}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        minDr === val
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {val === 0 ? 'All' : `${val}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Do-Follow Toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 hover:border-zinc-700 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={dofollowOnly}
                  onChange={(e) => setDofollowOnly(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <span className="text-zinc-300">Do-Follow Only</span>
              </label>

              {/* Package Tier Filter */}
              <select
                value={selectedTierFilter}
                onChange={(e) => setSelectedTierFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All Tiers</option>
                <option value="Starter">Starter (40)</option>
                <option value="Growth">Growth (90)</option>
                <option value="Scale">Scale (160+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl mb-6 text-xs sm:text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{filteredDirectories.length}</span> directories matched
            <span className="text-zinc-600">•</span>
            <span className="font-semibold text-emerald-400">{totalDofollow}</span> guaranteed Do-Follow
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Avg. Authority: <strong className="text-indigo-400">DR {avgDr}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> DR 90+
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> DR 80+
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> DR 70+
            </span>
          </div>
        </div>

        {/* Render Directories in Grid or Table */}
        {filteredDirectories.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-8">
            <svg className="w-12 h-12 mx-auto text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-1">No matching directories found</h3>
            <p className="text-zinc-500 text-sm mb-4">Try clearing your search terms or lowering the DR threshold.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setMinDr(0);
                setDofollowOnly(false);
                setSelectedTierFilter('All');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredDirectories.map((dir) => {
              const drBadgeColor =
                dir.domainRating >= 90
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : dir.domainRating >= 80
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

              return (
                <div
                  key={dir.id}
                  className="group relative bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/90 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Row: Icon + Name + Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${dir.accentColor}`}>
                          {dir.logoText}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-base group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            {dir.name}
                          </h4>
                          <span className="text-xs text-zinc-500 block">{dir.url.replace('https://', '')}</span>
                        </div>
                      </div>

                      {/* Domain Rating Badge */}
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${drBadgeColor} flex flex-col items-center leading-none`}>
                        <span className="text-[10px] text-zinc-400 font-normal">DR</span>
                        <span>{dir.domainRating}</span>
                      </div>
                    </div>

                    {/* Badge if special */}
                    {dir.badge && (
                      <div className="mb-3">
                        <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-indigo-300 border border-zinc-700/60">
                          ✦ {dir.badge}
                        </span>
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 my-2 border-y border-zinc-800/60">
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Monthly Visits</span>
                        <span className="text-zinc-200 font-medium">{dir.monthlyTraffic}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Backlink Type</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {dir.backlinkType}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Submission Speed</span>
                        <span className="text-zinc-300">{dir.submissionSpeed}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Approval Rate</span>
                        <span className="text-zinc-300">{dir.approvalRate}</span>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dir.categories.map((c) => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Tier indicator & Quick action */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      Included in:{' '}
                      <strong className={`font-semibold ${dir.tier === 'Starter' ? 'text-zinc-300' : dir.tier === 'Growth' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {dir.tier}+
                      </strong>
                    </span>
                    <button
                      onClick={() => onSelectTier ? onSelectTier(dir.tier) : null}
                      className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      Submit
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto bg-zinc-900/60 border border-zinc-800 rounded-2xl shadow-xl">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-5 font-semibold">Directory</th>
                  <th className="py-4 px-4 font-semibold text-center">Domain Rating</th>
                  <th className="py-4 px-4 font-semibold">Est. Monthly Visits</th>
                  <th className="py-4 px-4 font-semibold">Backlink</th>
                  <th className="py-4 px-4 font-semibold">Turnaround</th>
                  <th className="py-4 px-4 font-semibold">Categories</th>
                  <th className="py-4 px-4 font-semibold">Minimum Tier</th>
                  <th className="py-4 px-5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {filteredDirectories.map((dir) => (
                  <tr key={dir.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${dir.accentColor}`}>
                          {dir.logoText}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{dir.name}</div>
                          <div className="text-xs text-zinc-500">{dir.url.replace('https://', '')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                        dir.domainRating >= 90
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : dir.domainRating >= 80
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      }`}>
                        DR {dir.domainRating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-200">{dir.monthlyTraffic}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {dir.backlinkType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-400">{dir.submissionSpeed}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {dir.categories.map((c) => (
                          <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-semibold ${
                        dir.tier === 'Starter' ? 'text-zinc-300' : dir.tier === 'Growth' ? 'text-indigo-400' : 'text-emerald-400'
                      }`}>
                        {dir.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onSelectTier ? onSelectTier(dir.tier) : null}
                        className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        Launch
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* High-Converting Embedded CTA Banner inside Explorer */}
        <div className="mt-12 bg-gradient-to-r from-indigo-950/80 via-purple-950/50 to-zinc-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md mb-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fast Turnaround Guarantee
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Want your startup submitted to all {filteredDirectories.length} directories without typing a single form?
            </h3>
            <p className="text-zinc-400 text-sm">
              Our manual submission team formats logos, writes anti-duplicate copy variations, and handles all approval queues in under 72 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="#pricing"
              className="w-full sm:w-auto text-center px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm hover:scale-[1.02]"
            >
              Get Done-For-You Submissions →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
