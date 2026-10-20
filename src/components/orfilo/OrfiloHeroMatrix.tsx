import React from 'react';
import { OrfiloIcon } from '../OrfiloBrand.tsx';

interface AiPlatformTile {
  id: string;
  name: string;
  glyph: string;
  opacity: string;
  isSpecial?: boolean;
}

const AI_PLATFORM_TILES: AiPlatformTile[] = [
  // Row 1
  { id: '1-1', name: 'ChatGPT', glyph: 'GPT', opacity: 'opacity-40' },
  { id: '1-2', name: 'Claude', glyph: 'Claude', opacity: 'opacity-40' },
  { id: '1-3', name: 'Gemini', glyph: 'Gemini', opacity: 'opacity-35' },
  { id: '1-4', name: 'Cursor', glyph: 'Cursor', opacity: 'opacity-30' },
  { id: '1-5', name: 'Midjourney', glyph: 'MJ', opacity: 'opacity-25' },
  // Row 2
  { id: '2-1', name: 'v0.dev', glyph: 'v0', opacity: 'opacity-35' },
  { id: '2-2', name: 'Bolt.new', glyph: 'Bolt', opacity: 'opacity-35' },
  { id: '2-3', name: 'Replit', glyph: 'Replit', opacity: 'opacity-30' },
  { id: '2-4', name: 'ElevenLabs', glyph: '11Labs', opacity: 'opacity-25' },
  { id: '2-5', name: 'Runway', glyph: 'Runway', opacity: 'opacity-20' },
  // Row 3 (Center is Orfilo)
  { id: '3-1', name: 'Perplexity', glyph: 'Perp', opacity: 'opacity-30' },
  { id: '3-2', name: 'Lovable', glyph: 'Lovable', opacity: 'opacity-30' },
  { id: '3-3', name: 'Orfilo', glyph: 'ORF', opacity: 'opacity-100', isSpecial: true },
  { id: '3-4', name: 'Grok', glyph: 'Grok', opacity: 'opacity-30' },
  { id: '3-5', name: 'DeepSeek', glyph: 'DeepSeek', opacity: 'opacity-20' },
  // Row 4
  { id: '4-1', name: 'Whisper', glyph: 'Whisper', opacity: 'opacity-25' },
  { id: '4-2', name: 'Flux', glyph: 'Flux', opacity: 'opacity-25' },
  { id: '4-3', name: 'Sora', glyph: 'Sora', opacity: 'opacity-20' },
  { id: '4-4', name: 'Devin', glyph: 'Devin', opacity: 'opacity-20' },
  { id: '4-5', name: 'Suno', glyph: 'Suno', opacity: 'opacity-15' },
  // Row 5
  { id: '5-1', name: 'GitHub Copilot', glyph: 'Copilot', opacity: 'opacity-20' },
  { id: '5-2', name: 'Mistral', glyph: 'Mistral', opacity: 'opacity-20' },
  { id: '5-3', name: 'Ideogram', glyph: 'Ideo', opacity: 'opacity-15' },
  { id: '5-4', name: 'Poe', glyph: 'Poe', opacity: 'opacity-15' },
  { id: '5-5', name: 'Leonardo', glyph: 'Leo', opacity: 'opacity-10' },
];

export const OrfiloHeroMatrix: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Radiant Mint/Emerald Ambient Aura */}
      <div
        className="pointer-events-none absolute size-80 sm:size-96 rounded-full bg-gradient-to-tr from-[#19A974]/35 via-[#2CD59B]/20 to-transparent blur-[65px]"
        aria-hidden="true"
      />

      <div className="relative grid grid-cols-5 gap-3 sm:gap-3.5 p-4 rounded-3xl">
        {AI_PLATFORM_TILES.map((tile) => {
          if (tile.isSpecial) {
            return (
              <div
                key={tile.id}
                className="relative size-12 sm:size-14 flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={onCtaClick}
                  aria-label="Orfilo Central Vault"
                  className="absolute z-20 size-20 sm:size-24 rounded-[22px] bg-white border border-white/80 shadow-[0_20px_45px_-8px_rgba(25,169,116,0.28),0_0_0_1px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#19A974] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-6px_rgba(25,169,116,0.38)] active:scale-[0.97] cursor-pointer"
                >
                  <OrfiloIcon size={46} theme="light" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={tile.id}
              title={tile.name}
              className={`size-12 sm:size-14 rounded-2xl bg-[#ECE7E1]/80 backdrop-blur-xs border border-white/60 flex items-center justify-center text-[#2A2A2A] font-bold text-xs sm:text-sm select-none transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white hover:scale-105 hover:shadow-sm ${tile.opacity}`}
            >
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight text-center px-1 truncate">
                {tile.glyph}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
