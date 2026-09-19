import React from 'react';
import { 
  Cross, 
  Utensils, 
  GraduationCap, 
  Moon, 
  Heart, 
  Zap, 
  Lightbulb, 
  Waves
} from 'lucide-react';
import { PreferenceMode } from '../types';

interface LayerSelectorProps {
  activeMode: PreferenceMode;
  onSelectMode: (mode: PreferenceMode) => void;
  showLightingOverlay: boolean;
  onToggleLighting: () => void;
  showFloodOverlay: boolean;
  onToggleFlood: () => void;
  poiCounts: Record<PreferenceMode, number>;
  currentHour: number;
}

export const LayerSelector: React.FC<LayerSelectorProps> = ({
  activeMode,
  onSelectMode,
  showLightingOverlay,
  onToggleLighting,
  showFloodOverlay,
  onToggleFlood,
  poiCounts,
  currentHour,
}) => {
  const isNightTime = currentHour >= 21 || currentHour < 5;

  const modes: {
    id: PreferenceMode;
    label: string;
    icon: React.ReactNode;
    color: string;
    sublabel: string;
    badge?: string;
  }[] = [
    {
      id: 'emergency',
      label: 'Emergency & Health',
      icon: <Cross className="w-4 h-4 text-rose-400" />,
      color: 'hover:border-rose-500/50',
      sublabel: '24h Chemist & Trauma',
      badge: 'Always Active',
    },
    {
      id: 'night',
      label: 'Night Traveller',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      color: 'hover:border-indigo-500/50',
      sublabel: 'Lit Corridors & Transit',
      badge: isNightTime ? 'Recommended Now' : undefined,
    },
    {
      id: 'student',
      label: 'Student Hub',
      icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
      color: 'hover:border-amber-500/50',
      sublabel: 'Libraries, Mess & Wi-Fi',
    },
    {
      id: 'foodie',
      label: 'Foodie Explorer',
      icon: <Utensils className="w-4 h-4 text-orange-400" />,
      color: 'hover:border-orange-500/50',
      sublabel: 'Night Streets & Cafes',
    },
    {
      id: 'family',
      label: 'Family & Kids',
      icon: <Heart className="w-4 h-4 text-pink-400" />,
      color: 'hover:border-pink-500/50',
      sublabel: 'Parks & Paediatrics',
    },
    {
      id: 'fitness',
      label: 'Fitness & Tracks',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      color: 'hover:border-emerald-500/50',
      sublabel: 'Jogging & Cycling Corridors',
    },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-3 py-2 sm:px-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 overflow-x-auto pb-1 md:pb-0">
        
        {/* Preference Layers Carousel / Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 hidden xl:inline">
            Layers:
          </span>
          {modes.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all select-none ${
                  isActive
                    ? 'bg-slate-800 text-white border-sky-400 shadow-sm shadow-sky-500/10'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {mode.icon}
                <div className="text-left flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span>{mode.label}</span>
                    {mode.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                        {mode.badge}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded-md font-mono">
                  {poiCounts[mode.id] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Overlays Toggles (Street Lighting & Flood Radar) */}
        <div className="flex items-center gap-2 self-end md:self-auto pt-1 md:pt-0">
          <button
            onClick={onToggleLighting}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              showLightingOverlay
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/50'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle municipal street illumination corridors overlay"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${showLightingOverlay ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span className="text-[11px]">Street Lighting</span>
          </button>

          <button
            onClick={onToggleFlood}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              showFloodOverlay
                ? 'bg-cyan-950/50 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle historical & real-time flood zone overlays"
          >
            <Waves className={`w-3.5 h-3.5 ${showFloodOverlay ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[11px]">Flood Zones</span>
          </button>
        </div>

      </div>
    </div>
  );
};
