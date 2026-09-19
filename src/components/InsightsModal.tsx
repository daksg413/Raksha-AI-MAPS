import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Award, 
  ArrowRight, 
  Lightbulb, 
  X,
  Sparkles
} from 'lucide-react';
import { MonthlyUserInsight } from '../types';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: MonthlyUserInsight;
}

export const InsightsModal: React.FC<InsightsModalProps> = ({
  isOpen,
  onClose,
  insights,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
              Monthly Safety & Movement Insights
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Personal & Private
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero telemetry selling. An empowering private mirror of your urban movement.
            </p>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Km Protected
            </span>
            <span className="text-xl font-extrabold text-sky-400 font-mono">
              {insights.totalKmProtected}
            </span>
            <span className="text-[10px] text-slate-500 block">Total transit</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Average Safety
            </span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {insights.averageRouteSafetyScore}%
            </span>
            <span className="text-[10px] text-emerald-500/80 block">+14% vs direct</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Safer Alternatives
            </span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              {insights.saferAlternativeTakenCount}
            </span>
            <span className="text-[10px] text-slate-500 block">Underpasses bypassed</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Signals Shared
            </span>
            <span className="text-xl font-extrabold text-purple-400 font-mono">
              {insights.signalsContributed}
            </span>
            <span className="text-[10px] text-purple-400/80 block">380+ citizens helped</span>
          </div>
        </div>

        {/* Frequent Route Time Pattern Comparison */}
        <div className="mb-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
            <span>Your Most Frequent Commute: Day vs Night Delta</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </h4>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
              <span className="font-semibold text-sky-400">{insights.mostFrequentRoute.origin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-emerald-400">{insights.mostFrequentRoute.destination}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-emerald-400">Daytime Travel (09:00 AM)</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">{insights.mostFrequentRoute.daySafety}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${insights.mostFrequentRoute.daySafety}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                High ambient light, steady transit police, full footfall.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-400">Night Travel (10:15 PM)</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">{insights.mostFrequentRoute.nightSafety}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${insights.mostFrequentRoute.nightSafety}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Drops 22 points due to dim perimeter lighting and deserted flyover slip roads.
              </p>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-2 mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Personalised Proactive Suggestions
          </h4>
          <div className="space-y-2">
            {insights.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-slate-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-[11px] text-slate-400 text-center">
          Insights are compiled purely on-device from your local travel sessions. RAKSHA does not build ad profiles.
        </div>

      </div>
    </div>
  );
};
