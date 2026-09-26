import React from 'react';
import { Target, Flame, Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface TargetMissionCardProps {
  callsCompleted: number;
  dailyCallTarget: number;
  bestConnectingTime: string;
  streakDays: number;
  aiCoachTips: string[];
}

export const TargetMissionCard: React.FC<TargetMissionCardProps> = ({
  callsCompleted,
  dailyCallTarget,
  bestConnectingTime,
  streakDays,
  aiCoachTips,
}) => {
  const percentage = Math.min(100, Math.round((callsCompleted / dailyCallTarget) * 100));
  const remaining = Math.max(0, dailyCallTarget - callsCompleted);

  // SVG Circular Gauge parameters
  const strokeWidth = 14;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-4 h-full flex flex-col justify-between">
      {/* 1. Target Mission Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Target Mission</h3>
          </div>
          <button type="button" className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">
            View Details
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-1">
          {/* Circular Donut Chart */}
          <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-100"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-red-600 transition-all duration-700 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-[#0D1F3D] leading-none">{callsCompleted}</span>
              <span className="text-[10px] text-slate-400 font-bold mt-0.5">/ {dailyCallTarget}</span>
              <span className="text-[9px] font-extrabold text-slate-600 tracking-tight mt-0.5">Calls Completed</span>
            </div>
          </div>

          {/* Right Metrics & Best Time */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-xl font-black text-[#0D1F3D]">
                {remaining} <span className="text-xs font-semibold text-slate-500">more calls</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">to hit today's goal!</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>Daily Target Progress</span>
                <span className="text-red-600 font-black">{percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-[10px] text-amber-950 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 flex-shrink-0" />
              <span>Best time to push: <strong className="font-bold text-emerald-800">{bestConnectingTime}</strong></span>
            </div>
          </div>
        </div>

        {/* Streak Notification Banner */}
        <div className="mt-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-2.5 text-center text-xs font-black shadow-xs flex items-center justify-center gap-1.5">
          <Flame className="w-4 h-4 fill-white" />
          <span>{streakDays}-Day Target Streak! Keep it going!</span>
          <Flame className="w-4 h-4 fill-white" />
        </div>
      </div>

      {/* 2. AI Coach Tips Card */}
      <div className="bg-blue-50/50 border border-blue-200/70 rounded-2xl p-4 shadow-2xs flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-blue-100 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">AI Coach</h3>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
              Tips for You
            </span>
          </div>

          <div className="space-y-1.5">
            {aiCoachTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-blue-100/80 text-[11px] font-bold text-blue-800 flex items-center justify-center gap-1">
          <span>✨ You're doing great! Keep your energy high!</span>
        </div>
      </div>
    </div>
  );
};
