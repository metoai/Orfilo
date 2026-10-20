import React, { useState } from 'react';

export const RoiCalculator: React.FC = () => {
  const [directoryCount, setDirectoryCount] = useState<number>(90);
  const [hourlyRate, setHourlyRate] = useState<number>(75);

  // Average time to register, verify email, resize screenshot, write custom description, and submit: 35 minutes (0.58 hours)
  const hoursRequired = Math.round((directoryCount * 35) / 60);
  const founderTimeCost = hoursRequired * hourlyRate;
  const launchdirCost = directoryCount <= 40 ? 49 : directoryCount <= 90 ? 99 : 199;
  const netSavings = Math.max(0, founderTimeCost - launchdirCost);
  const estimatedDrGain = directoryCount <= 40 ? '+15 to +20 DR' : directoryCount <= 90 ? '+24 to +32 DR' : '+35 to +48 DR';

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white border-t border-zinc-900">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-indigo-950/40 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Background subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Interactive ROI Calculator
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
              Calculate What Your Time Is Actually Worth
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2">
              Manual submissions take 30–45 mins per directory. See how much engineering capital you save with Launchdir.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1: Target Directories */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-zinc-300">Directories to Submit</span>
                  <span className="text-indigo-400 font-bold text-base">{directoryCount} Directories</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="160"
                  step="10"
                  value={directoryCount}
                  onChange={(e) => setDirectoryCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>Starter (40)</span>
                  <span>Growth (90)</span>
                  <span>Scale (160)</span>
                </div>
              </div>

              {/* Slider 2: Founder Hourly Rate */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-zinc-300">Your Hourly Value / Developer Rate</span>
                  <span className="text-emerald-400 font-bold text-base">${hourlyRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="250"
                  step="25"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>$25/hr</span>
                  <span>$75/hr</span>
                  <span>$150/hr</span>
                  <span>$250/hr</span>
                </div>
              </div>

              {/* Calculation Breakdown Micro-list */}
              <div className="bg-zinc-950/70 rounded-2xl p-4 border border-zinc-800/80 space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Hours spent doing manual submissions:</span>
                  <strong className="text-white">{hoursRequired} hours of grueling work</strong>
                </div>
                <div className="flex justify-between">
                  <span>Opportunity cost of your dev time:</span>
                  <strong className="text-rose-400">${founderTimeCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Launchdir Done-For-You price:</span>
                  <strong className="text-emerald-400">${launchdirCost} one-time</strong>
                </div>
              </div>
            </div>

            {/* Right Result Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-indigo-950/60 to-zinc-950 p-6 sm:p-7 rounded-2xl border border-indigo-500/40 text-center shadow-xl">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                Your Direct Return On Investment
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-white my-3 tracking-tight">
                ${netSavings.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-400 font-semibold mb-4">
                Saved in valuable engineering & founder hours
              </p>

              <div className="border-t border-indigo-500/20 pt-4 text-xs space-y-2 text-zinc-300 text-left mb-6">
                <div className="flex items-center justify-between">
                  <span>Time Reclaimed:</span>
                  <strong className="text-white">{hoursRequired} hours</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Est. Domain Authority Boost:</span>
                  <strong className="text-indigo-400">{estimatedDrGain}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Submission Stress:</span>
                  <strong className="text-emerald-400">0% (100% Done-For-You)</strong>
                </div>
              </div>

              <a
                href="#pricing"
                className="block w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02]"
              >
                Reclaim Your {hoursRequired} Hours Now →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
