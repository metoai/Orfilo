import React, { useState } from 'react';
import { Clock, DollarSign, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export const OrfiloRoiCalculator: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  const [promptsPerDay, setPromptsPerDay] = useState(25);
  const [hourlyRate, setHourlyRate] = useState(75);

  // Math: 4 minutes wasted per AI deliverable (locating, renaming, moving, or re-prompting lost assets)
  // Working days per month: 22
  const monthlyAssets = promptsPerDay * 22;
  const hoursSavedPerMonth = Math.round((monthlyAssets * 4) / 60);
  const monthlySavings = hoursSavedPerMonth * hourlyRate;
  const contextSwitchesPrevented = monthlyAssets;

  return (
    <div className="relative rounded-[28px] bg-white border border-[#ECE7E1] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.04)] p-8 sm:p-12 overflow-hidden">
      {/* Background radial accent */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gradient-to-bl from-[#19A974]/20 via-[#2CD59B]/10 to-transparent blur-[70px]"
        aria-hidden="true"
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#19A974]">
              Developer & Creator ROI Calculator
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-tight">
              Calculate how much time you lose <br />
              digging through Downloads
            </h3>
            <p className="text-[14px] text-[#636363] leading-relaxed">
              Every un-named AI code snippet, render, and schema incurs context switching.
              See your personal productivity return with Orfilo.
            </p>
          </div>

          <div className="flex flex-col gap-6 pt-2">
            {/* Slider 1: Prompts / Deliverables per day */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="font-medium text-[#2E2E2E]">
                  AI Prompts & Deliverables per Day
                </span>
                <span className="font-bold text-[#19A974] font-mono text-base">
                  {promptsPerDay} prompts
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={promptsPerDay}
                onChange={(e) => setPromptsPerDay(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-[#EFECE6] accent-[#19A974] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#888888]">
                <span>5 / day (casual)</span>
                <span>40 / day (power user)</span>
                <span>80 / day (AI engineer)</span>
              </div>
            </div>

            {/* Slider 2: Hourly Rate */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="font-medium text-[#2E2E2E]">
                  Your Estimated Hourly Value
                </span>
                <span className="font-bold text-[#19A974] font-mono text-base">
                  ${hourlyRate}/hr
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-[#EFECE6] accent-[#19A974] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#888888]">
                <span>$30/hr</span>
                <span>$100/hr</span>
                <span>$200/hr+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Savings Card */}
        <div className="lg:col-span-5 relative flex flex-col gap-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DD] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EAE5DE] pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Monthly Value Recovered
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#19A974] bg-[#E8F7F0] px-2.5 py-1 rounded-full">
              <Zap className="size-3.5 fill-[#19A974]" />
              <span>Instant ROI</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 py-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-[#121212] tracking-tight font-mono">
              ${monthlySavings.toLocaleString()}
            </span>
            <span className="text-xs text-[#777777]">
              estimated engineering value saved each month
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex flex-col gap-1 rounded-xl bg-white p-3 border border-[#E8E3DD]">
              <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                <Clock className="size-3.5 text-[#19A974]" />
                <span>Hours Saved</span>
              </div>
              <span className="text-xl font-bold text-[#141414] font-mono">
                {hoursSavedPerMonth} hrs
              </span>
              <span className="text-[10px] text-[#888888]">per month</span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-white p-3 border border-[#E8E3DD]">
              <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                <CheckCircle2 className="size-3.5 text-[#19A974]" />
                <span>Context Kept</span>
              </div>
              <span className="text-xl font-bold text-[#141414] font-mono">
                {contextSwitchesPrevented}
              </span>
              <span className="text-[10px] text-[#888888]">interruptions spared</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCtaClick}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#121212] px-5 py-3 text-[13.5px] font-medium text-white shadow-sm transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black active:scale-[0.97] cursor-pointer"
          >
            <span>Claim Your Time Back</span>
            <ArrowRight className="size-3.5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
