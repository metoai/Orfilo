import React from 'react';
import { OrfiloIcon } from '../OrfiloBrand.tsx';

/**
 * OrfiloHeroMatrix Component
 * 5x5 AI ecosystem matrix with authentic vector SVG brand icons for all 24 platforms,
 * plus an elevated translucent glass central vault tile for Orfilo (no harsh pure white cutout).
 *
 * Adheres strictly to design rules:
 * - No space-x-* or space-y-*; all flex/grid with gap-*
 * - size-* utility for equal dimensions
 * - cubic-bezier(0.23, 1, 0.32, 1) physical easing curve
 * - Micro-interactions with tactile active:scale-[0.97]
 */

// ============================================================================
// AUTHENTIC VECTOR SVG BRAND ICONS (24 AI Platforms)
// ============================================================================

const OpenAiIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22.28 9.37a6.29 6.29 0 0 0-.53-5.18 6.45 6.45 0 0 0-6.42-3.14 6.32 6.32 0 0 0-4.75 2.12 6.3 6.3 0 0 0-4.63-.58 6.44 6.44 0 0 0-4.75 4.54 6.28 6.28 0 0 0 .9 6.24 6.31 6.31 0 0 0 .53 5.18 6.45 6.45 0 0 0 6.42 3.14 6.33 6.33 0 0 0 4.75-2.12 6.31 6.31 0 0 0 4.63.58 6.44 6.44 0 0 0 4.75-4.54 6.28 6.28 0 0 0-.9-6.23zm-8.8 12.35a4.7 4.7 0 0 1-3.23-1.28l.16-.09 5.34-3.08a.86.86 0 0 0 .43-.75v-7.5l2.25 1.3a.81.81 0 0 1 .43.62v6.17a4.77 4.77 0 0 1-5.38 4.61zm-8.7-3.66a4.72 4.72 0 0 1-.61-3.41l.16.1 5.34 3.08a.84.84 0 0 0 .86 0l6.5-3.75v2.6a.82.82 0 0 1-.32.69l-5.34 3.09a4.77 4.77 0 0 1-6.59-2.4zm-2.02-9.3a4.73 4.73 0 0 1 2.62-2.13v6.36a.84.84 0 0 0 .43.75l6.5 3.75-2.25 1.3a.83.83 0 0 1-.75 0l-5.34-3.08a4.76 4.76 0 0 1-1.21-6.95zm14.88 2.21l-6.5-3.75 2.25-1.3a.83.83 0 0 1 .75 0l5.34 3.08a4.76 4.76 0 0 1 1.21 6.95 4.73 4.73 0 0 1-2.62 2.13v-6.36a.84.84 0 0 0-.43-.75zm2.63-2.92l-.16-.1-5.34-3.08a.84.84 0 0 0-.86 0l-6.5 3.75v-2.6a.82.82 0 0 1 .32-.69l5.34-3.09a4.77 4.77 0 0 1 7.2 5.81zm-9.76 5.61l-2.6-1.5 2.6-1.5 2.6 1.5-2.6 1.5z" />
  </svg>
);

const ClaudeIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={className} aria-hidden="true">
    <line x1="12" y1="2.5" x2="12" y2="21.5" />
    <line x1="2.5" y1="12" x2="21.5" y2="12" />
    <line x1="5.3" y1="5.3" x2="18.7" y2="18.7" />
    <line x1="5.3" y1="18.7" x2="18.7" y2="5.3" />
    <circle cx="12" cy="12" r="3.2" fill="currentColor" />
  </svg>
);

const GeminiIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" />
  </svg>
);

const CursorIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
    <path d="M12 22V12" />
    <path d="M21 7L12 12L3 7" />
  </svg>
);

const MidjourneyIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M3 16l9-13 4 8-13 5z" />
    <path d="M12 3v13" />
    <path d="M2 19c3 1.5 6 1.5 10 0s7-1.5 10 0" />
    <path d="M16 11l5 5-9 3" />
  </svg>
);

const V0Icon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 8l4 8 4-8" />
    <rect x="14" y="8" width="6" height="8" rx="3" strokeWidth="2.2" />
  </svg>
);

const BoltIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
  </svg>
);

const ReplitIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="3" y="4" width="7" height="4.5" rx="1.2" />
    <rect x="3" y="10" width="13" height="4.5" rx="1.2" />
    <rect x="3" y="16" width="7" height="4.5" rx="1.2" />
  </svg>
);

const ElevenLabsIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="7" y="3.5" width="3.5" height="17" rx="1.75" />
    <rect x="13.5" y="3.5" width="3.5" height="17" rx="1.75" />
  </svg>
);

const RunwayIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M5 4h7a5 5 0 0 1 5 5c0 3-2 5-5 5H5V4z" />
    <path d="M12 14l6 7" />
    <path d="M5 14v7" />
  </svg>
);

const PerplexityIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M7 7L3 3" />
    <path d="M17 7l4-4" />
    <path d="M7 17l-4 4" />
    <path d="M17 17l4 4" />
    <line x1="12" y1="2" x2="12" y2="7" />
    <line x1="12" y1="17" x2="12" y2="22" />
    <line x1="2" y1="12" x2="7" y2="12" />
    <line x1="17" y1="12" x2="22" y2="12" />
  </svg>
);

const LovableIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const GrokIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DeepSeekIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M21 12c0-4.97-4.03-9-9-9-3.1 0-5.83 1.57-7.44 3.96L3 9c3 0 5 2 6 5 1 3 4 5 7 5 2.76 0 5-2.24 5-5z" />
    <circle cx="8" cy="10" r="1.5" fill="currentColor" />
    <path d="M17 19c-1.5 2-4 3-7 3" />
  </svg>
);

const HuggingFaceIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 10h.01" strokeWidth="3" />
    <path d="M15 10h.01" strokeWidth="3" />
    <path d="M9 14.5c1 1.5 2 2 3 2s2-.5 3-2" />
    <path d="M2 13c1.5-1 3 0 4 2" />
    <path d="M22 13c-1.5-1-3 0-4 2" />
  </svg>
);

const CopilotIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="4" y="6" width="16" height="12" rx="4" />
    <path d="M8 12h8" strokeWidth="2.5" />
    <path d="M12 2v4" />
    <circle cx="12" cy="2" r="1.5" fill="currentColor" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
  </svg>
);

const MistralIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="3" y="4" width="4" height="4" rx="0.5" />
    <rect x="17" y="4" width="4" height="4" rx="0.5" />
    <rect x="6.5" y="10" width="4" height="4" rx="0.5" />
    <rect x="13.5" y="10" width="4" height="4" rx="0.5" />
    <rect x="10" y="16" width="4" height="4" rx="0.5" />
  </svg>
);

const SupabaseIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.9 2.1c-.5-.8-1.7-.5-1.7.5v8.9H3.7c-.8 0-1.3.9-.9 1.6l8.3 12.1c.5.8 1.7.5 1.7-.5v-8.9h7.5c.8 0 1.3-.9.9-1.6L12.9 2.1z" />
  </svg>
);

const DevinIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M7 9l4 3-4 3" />
    <line x1="13" y1="15" x2="17" y2="15" strokeWidth="2.2" />
  </svg>
);

const SoraIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const SunoIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <line x1="12" y1="3" x2="12" y2="1" />
    <line x1="12" y1="23" x2="12" y2="21" />
    <line x1="3" y1="12" x2="1" y2="12" />
    <line x1="23" y1="12" x2="21" y2="12" />
  </svg>
);

const WhisperIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className} aria-hidden="true">
    <line x1="4" y1="12" x2="4" y2="12.01" />
    <line x1="8" y1="8" x2="8" y2="16" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="16" y1="7" x2="16" y2="17" />
    <line x1="20" y1="10" x2="20" y2="14" />
  </svg>
);

const IdeogramIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" strokeWidth="2.4" />
    <path d="M9 7h6" />
    <path d="M9 17h6" />
  </svg>
);

const LeonardoIcon: React.FC<{ className?: string }> = ({ className = 'size-6 sm:size-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

// ============================================================================
// 5x5 TILE DEFINITION
// ============================================================================

interface AiPlatformTile {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  opacity: string;
  hoverColor: string;
  isSpecial?: boolean;
}

const AI_PLATFORM_TILES: AiPlatformTile[] = [
  // Row 1
  { id: '1-1', name: 'ChatGPT', icon: OpenAiIcon, opacity: 'opacity-45', hoverColor: 'hover:text-[#10A37F]' },
  { id: '1-2', name: 'Claude', icon: ClaudeIcon, opacity: 'opacity-45', hoverColor: 'hover:text-[#D97706]' },
  { id: '1-3', name: 'Gemini', icon: GeminiIcon, opacity: 'opacity-40', hoverColor: 'hover:text-[#4285F4]' },
  { id: '1-4', name: 'Cursor', icon: CursorIcon, opacity: 'opacity-35', hoverColor: 'hover:text-[#121212]' },
  { id: '1-5', name: 'Midjourney', icon: MidjourneyIcon, opacity: 'opacity-25', hoverColor: 'hover:text-[#5865F2]' },
  // Row 2
  { id: '2-1', name: 'v0.dev', icon: V0Icon, opacity: 'opacity-40', hoverColor: 'hover:text-[#121212]' },
  { id: '2-2', name: 'Bolt.new', icon: BoltIcon, opacity: 'opacity-40', hoverColor: 'hover:text-[#F59E0B]' },
  { id: '2-3', name: 'Replit', icon: ReplitIcon, opacity: 'opacity-35', hoverColor: 'hover:text-[#F26207]' },
  { id: '2-4', name: 'ElevenLabs', icon: ElevenLabsIcon, opacity: 'opacity-30', hoverColor: 'hover:text-[#121212]' },
  { id: '2-5', name: 'Runway', icon: RunwayIcon, opacity: 'opacity-25', hoverColor: 'hover:text-[#121212]' },
  // Row 3 (Center is Orfilo)
  { id: '3-1', name: 'Perplexity', icon: PerplexityIcon, opacity: 'opacity-35', hoverColor: 'hover:text-[#20B2AA]' },
  { id: '3-2', name: 'Lovable', icon: LovableIcon, opacity: 'opacity-35', hoverColor: 'hover:text-[#F43F5E]' },
  { id: '3-3', name: 'Orfilo', icon: OpenAiIcon, opacity: 'opacity-100', hoverColor: '', isSpecial: true },
  { id: '3-4', name: 'Grok / xAI', icon: GrokIcon, opacity: 'opacity-35', hoverColor: 'hover:text-[#121212]' },
  { id: '3-5', name: 'DeepSeek', icon: DeepSeekIcon, opacity: 'opacity-25', hoverColor: 'hover:text-[#1E88E5]' },
  // Row 4
  { id: '4-1', name: 'Hugging Face', icon: HuggingFaceIcon, opacity: 'opacity-30', hoverColor: 'hover:text-[#FFD21E]' },
  { id: '4-2', name: 'GitHub Copilot', icon: CopilotIcon, opacity: 'opacity-30', hoverColor: 'hover:text-[#1F2328]' },
  { id: '4-3', name: 'Mistral AI', icon: MistralIcon, opacity: 'opacity-25', hoverColor: 'hover:text-[#FF7000]' },
  { id: '4-4', name: 'Supabase', icon: SupabaseIcon, opacity: 'opacity-25', hoverColor: 'hover:text-[#3ECF8E]' },
  { id: '4-5', name: 'Devin', icon: DevinIcon, opacity: 'opacity-20', hoverColor: 'hover:text-[#0F172A]' },
  // Row 5
  { id: '5-1', name: 'Sora', icon: SoraIcon, opacity: 'opacity-25', hoverColor: 'hover:text-[#0A84FF]' },
  { id: '5-2', name: 'Suno', icon: SunoIcon, opacity: 'opacity-25', hoverColor: 'hover:text-[#EC4899]' },
  { id: '5-3', name: 'Whisper', icon: WhisperIcon, opacity: 'opacity-20', hoverColor: 'hover:text-[#10A37F]' },
  { id: '5-4', name: 'Ideogram', icon: IdeogramIcon, opacity: 'opacity-18', hoverColor: 'hover:text-[#8B5CF6]' },
  { id: '5-5', name: 'Leonardo AI', icon: LeonardoIcon, opacity: 'opacity-15', hoverColor: 'hover:text-[#A855F7]' },
];

export const OrfiloHeroMatrix: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Radiant Mint/Emerald Ambient Aura */}
      <div
        className="pointer-events-none absolute size-80 sm:size-96 rounded-full bg-gradient-to-tr from-[#19A974]/35 via-[#2CD59B]/20 to-transparent blur-[65px]"
        aria-hidden="true"
      />

      {/* 5x5 Matrix Grid */}
      <div className="relative grid grid-cols-5 gap-3 sm:gap-3.5 p-4 rounded-3xl">
        {AI_PLATFORM_TILES.map((tile) => {
          if (tile.isSpecial) {
            return (
              <div
                key={tile.id}
                className="relative size-12 sm:size-14 flex items-center justify-center"
              >
                {/* Soft Mint Breathing Glow behind the central card */}
                <div
                  className="pointer-events-none absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-[#19A974]/35 via-[#2CD59B]/25 to-transparent blur-lg"
                  aria-hidden="true"
                />

                {/* Sleek Translucent Frosted Glass Central Vault Card (No stark pure white cutout) */}
                <button
                  type="button"
                  onClick={onCtaClick}
                  aria-label="Orfilo Central AI Deliverables Vault"
                  className="group/center absolute z-20 size-20 sm:size-24 rounded-[22px] bg-[#FAF9F5]/75 backdrop-blur-md border border-[#19A974]/35 shadow-[0_20px_45px_-8px_rgba(25,169,116,0.32),0_0_0_1px_rgba(255,255,255,0.85)_inset] flex items-center justify-center text-[#19A974] transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-6px_rgba(25,169,116,0.45)] hover:border-[#19A974]/60 active:scale-[0.97] cursor-pointer"
                >
                  <div className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/center:scale-108">
                    <OrfiloIcon size={46} theme="light" />
                  </div>
                </button>
              </div>
            );
          }

          const IconComponent = tile.icon;

          return (
            <div
              key={tile.id}
              title={tile.name}
              aria-label={tile.name}
              className={`group relative size-12 sm:size-14 rounded-2xl bg-[#ECE7E1]/80 backdrop-blur-xs border border-white/60 flex items-center justify-center text-[#3A3A3A] select-none transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/95 hover:scale-110 hover:shadow-md hover:border-[#19A974]/30 ${tile.opacity} hover:opacity-100 ${tile.hoverColor} cursor-pointer`}
            >
              <IconComponent className="size-6 sm:size-7 transition-transform duration-150 group-hover:scale-105" />

              {/* Instant Hover Tooltip for Platform Name */}
              <div
                className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-md bg-[#121212] px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 whitespace-nowrap z-30"
                aria-hidden="true"
              >
                {tile.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
