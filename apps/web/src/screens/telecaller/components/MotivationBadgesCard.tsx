import React from 'react';
import { Award, Rocket, ArrowRight } from 'lucide-react';
import { TelecallerBadge } from '../telecaller.api';

interface MotivationBadgesCardProps {
  badges: TelecallerBadge[];
}

export const MotivationBadgesCard: React.FC<MotivationBadgesCardProps> = ({ badges }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-full min-h-[300px]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Motivation & Achievements</h3>
          </div>
        </div>

        {/* Motivational Header Snippet */}
        <div className="text-center py-1.5 px-3 bg-purple-50/60 border border-purple-100 rounded-xl mb-3">
          <p className="text-xs font-black text-purple-900 flex items-center justify-center gap-1">
            You are ahead of yesterday by 12% <Rocket className="w-3.5 h-3.5 text-purple-600 inline" />
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-0.5">Consistency today, success tomorrow!</p>
        </div>

        {/* 4 Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] shadow-2xs ${badge.color}`}
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <h4 className="font-extrabold text-xs">{badge.title}</h4>
              <span className="text-[10px] opacity-80 font-bold mt-0.5">{badge.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Link */}
      <div className="mt-3 pt-2 border-t border-slate-100 text-center">
        <button
          type="button"
          className="text-xs font-extrabold text-slate-600 hover:text-red-600 flex items-center justify-center gap-1 w-full transition-colors"
        >
          <span>View All Badges</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
