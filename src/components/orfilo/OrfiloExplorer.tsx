import React, { useState, useMemo } from 'react';
import {
  Search,
  FolderOpen,
  Filter,
  FileCode,
  FileImage,
  FileText,
  Database,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Bot,
} from 'lucide-react';
import { ORFILO_DELIVERABLES, DeliverableItem } from '../../data/orfilo/deliverables';

export const OrfiloExplorer: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'code' | 'image' | 'doc' | 'schema'>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDeliverables = useMemo(() => {
    return ORFILO_DELIVERABLES.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.promptSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subfolder.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesSource =
        selectedSource === 'all' || item.source === selectedSource;

      return matchesSearch && matchesCategory && matchesSource;
    });
  }, [searchQuery, selectedCategory, selectedSource]);

  const handleCopyName = (id: string, name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getCategoryIcon = (category: DeliverableItem['category']) => {
    switch (category) {
      case 'code':
        return <FileCode className="size-4 text-[#19A974]" />;
      case 'image':
        return <FileImage className="size-4 text-[#4285F4]" />;
      case 'doc':
        return <FileText className="size-4 text-[#10A37F]" />;
      case 'schema':
        return <Database className="size-4 text-[#7C3AED]" />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#19A974]">
            <Sparkles className="size-3.5 fill-[#19A974]" />
            <span>Interactive Deliverable Vault</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-tight">
            Explore live AI files <br />
            auto-named by Orfilo
          </h2>
          <p className="text-[14px] text-[#636363] leading-relaxed">
            Every deliverable below was captured directly from ChatGPT, Claude,
            Gemini, and Cursor with automatic kebab-case naming and subfolder categorization.
          </p>
        </div>

        <button
          type="button"
          onClick={onCtaClick}
          className="inline-flex items-center gap-2 rounded-full bg-[#121212] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-sm transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black active:scale-[0.97] cursor-pointer self-start md:self-end"
        >
          <span>Open Full Vault</span>
          <ExternalLink className="size-3.5" />
        </button>
      </div>

      {/* Control Bar: Search & Category Pills */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#ECE7E1] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8C8C8C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename, prompt, or project folder..."
            className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E3DD] pl-10 pr-4 py-2 text-[13.5px] text-[#1F1F1F] placeholder:text-[#999999] focus:outline-none focus:border-[#19A974] focus:ring-1 focus:ring-[#19A974] transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'code', label: 'Code & Hooks' },
            { id: 'image', label: 'Images & 3D' },
            { id: 'doc', label: 'Documents' },
            { id: 'schema', label: 'SQL & Schemas' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#19A974] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#555555] hover:text-black hover:bg-[#F2EFE9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredDeliverables.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-center">
            <Bot className="size-10 text-[#CCCCCC]" />
            <span className="text-sm font-medium text-[#777777]">
              No AI deliverables matched your search.
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSource('all');
              }}
              className="text-xs font-semibold text-[#19A974] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredDeliverables.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between gap-4 rounded-2xl bg-white border border-[#ECE7E1] p-5 shadow-xs transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.06)] hover:border-[#D5CFCE]"
            >
              {/* Card Top: Source Badge & Match Pill */}
              <div className="flex items-center justify-between">
                <span
                  style={{ backgroundColor: `${item.badgeColor}15`, color: item.badgeColor }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight"
                >
                  {item.source}
                </span>

                <span className="text-[10px] font-semibold text-[#19A974] bg-[#E8F7F0] px-2 py-0.5 rounded-full">
                  {item.confidence}% confidence
                </span>
              </div>

              {/* Filename & Route */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">{getCategoryIcon(item.category)}</div>
                  <h4 className="text-[13.5px] font-bold font-mono text-[#141414] leading-snug break-all group-hover:text-[#19A974] transition-colors">
                    {item.name}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 text-[11.5px] text-[#777777]">
                  <FolderOpen className="size-3 text-[#19A974] shrink-0" />
                  <span className="truncate">{item.subfolder}</span>
                </div>
              </div>

              {/* Prompt Snippet Preview */}
              <p className="text-[11.5px] text-[#555555] bg-[#FAF8F5] rounded-xl p-2.5 border border-[#F0EBE5] italic line-clamp-2">
                &ldquo;{item.promptSnippet}&rdquo;
              </p>

              {/* Card Bottom: Metadata & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F3EFEA] text-[11px] text-[#888888]">
                <span>{item.size} • {item.createdAt}</span>

                <button
                  type="button"
                  onClick={() => handleCopyName(item.id, item.name)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#444444] hover:text-[#19A974] transition-colors active:scale-[0.97] cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="size-3 text-[#19A974]" />
                      <span className="text-[#19A974] font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy Name</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
