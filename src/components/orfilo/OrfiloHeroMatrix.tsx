import React from 'react';
import { Icon } from '@iconify/react';
import { OrfiloIcon } from '../OrfiloBrand.tsx';

interface AiPlatformTile {
  id: string;
  name: string;
  icon: string;
  isSpecial?: boolean;
}

const AI_PLATFORM_TILES: AiPlatformTile[] = [
  // Row 1
  { id: '1-1', name: 'OpenAI / ChatGPT', icon: 'simple-icons:openai' },
  { id: '1-2', name: 'Anthropic / Claude', icon: 'logos:anthropic-icon' },
  { id: '1-3', name: 'Google Gemini', icon: 'logos:google-gemini' },
  { id: '1-4', name: 'Cursor', icon: 'simple-icons:cursor' },
  { id: '1-5', name: 'Midjourney', icon: 'logos:midjourney' },
  // Row 2
  { id: '2-1', name: 'v0.dev', icon: 'simple-icons:v0' },
  { id: '2-2', name: 'Bolt.new', icon: 'logos:bolt' },
  { id: '2-3', name: 'Replit', icon: 'logos:replit-icon' },
  { id: '2-4', name: 'ElevenLabs', icon: 'simple-icons:elevenlabs' },
  { id: '2-5', name: 'DeepSeek', icon: 'simple-icons:deepseek' },
  // Row 3 (Center is Orfilo)
  { id: '3-1', name: 'Perplexity', icon: 'simple-icons:perplexity' },
  { id: '3-2', name: 'Ollama', icon: 'simple-icons:ollama' },
  { id: '3-3', name: 'Orfilo', icon: 'orfilo', isSpecial: true },
  { id: '3-4', name: 'Grok / xAI', icon: 'simple-icons:x' },
  { id: '3-5', name: 'Figma', icon: 'simple-icons:figma' },
  // Row 4
  { id: '4-1', name: 'Hugging Face', icon: 'logos:hugging-face-icon' },
  { id: '4-2', name: 'GitHub Copilot', icon: 'logos:github-copilot' },
  { id: '4-3', name: 'Meta Llama', icon: 'logos:meta-icon' },
  { id: '4-4', name: 'Supabase', icon: 'logos:supabase-icon' },
  { id: '4-5', name: 'Docker', icon: 'simple-icons:docker' },
  // Row 5
  { id: '5-1', name: 'Notion AI', icon: 'simple-icons:notion' },
  { id: '5-2', name: 'OpenAI Whisper', icon: 'simple-icons:openai' },
  { id: '5-3', name: 'Anthropic Opus', icon: 'logos:anthropic-icon' },
  { id: '5-4', name: 'Google DeepMind', icon: 'logos:google-gemini' },
  { id: '5-5', name: 'Cursor Pro', icon: 'simple-icons:cursor' },
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
                {/* Elevated Translucent Frosted Glass Vault Card with No Pure White BG */}
                <button
                  type="button"
                  onClick={onCtaClick}
                  aria-label="Orfilo Central Vault"
                  className="group/center absolute z-20 size-20 sm:size-24 rounded-[22px] bg-[#FAF9F5]/85 backdrop-blur-md border border-[#19A974]/35 shadow-[0_20px_45px_-8px_rgba(25,169,116,0.32),0_0_0_1px_rgba(255,255,255,0.85)_inset] flex items-center justify-center text-[#19A974] transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-6px_rgba(25,169,116,0.45)] hover:border-[#19A974]/60 active:scale-[0.97] cursor-pointer"
                >
                  <div className="relative flex items-center justify-center transition-transform duration-200 group-hover/center:scale-110">
                    <OrfiloIcon size={46} theme="light" />
                  </div>
                </button>
              </div>
            );
          }

          return (
            <div
              key={tile.id}
              title={tile.name}
              className="group/tile relative size-12 sm:size-14 rounded-2xl bg-[#ECE7E1]/80 backdrop-blur-xs border border-white/60 flex items-center justify-center text-[#2A2A2A] transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white hover:scale-110 hover:shadow-md hover:border-[#19A974]/30 cursor-pointer"
            >
              <div className="flex items-center justify-center size-6 sm:size-6.5 text-[#333333] transition-transform duration-200 group-hover/tile:scale-110">
                <Icon
                  icon={tile.icon}
                  className="size-5 sm:size-5.5 text-current object-contain"
                />
              </div>

              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/tile:opacity-100 transition-opacity duration-150 rounded-md bg-[#121212] px-2 py-0.5 text-[10px] font-medium text-white shadow-xs whitespace-nowrap z-30">
                {tile.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
