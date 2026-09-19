import React, { useState } from 'react';
import { 
  AlertTriangle, 
  EyeOff, 
  ShieldAlert, 
  Waves, 
  HelpCircle, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { FlagCategory, CityZone } from '../types';

interface SilentFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: CityZone[];
  onSubmitSignal: (category: FlagCategory, zoneId: string, note: string) => void;
}

export const SilentFlagModal: React.FC<SilentFlagModalProps> = ({
  isOpen,
  onClose,
  zones,
  onSubmitSignal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FlagCategory>('felt_unsafe');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const [quickNote, setQuickNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const categories: {
    id: FlagCategory;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    border: string;
  }[] = [
    {
      id: 'felt_unsafe',
      title: 'Felt Unsafe Here',
      description: 'Dark alley, isolated corridor, stalking concern, or lack of illumination.',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      color: 'bg-rose-950/30 text-rose-300',
      border: 'border-rose-500/40',
    },
    {
      id: 'suspicious',
      title: 'Something Unusual',
      description: 'Sudden deserted street, suspicious grouping, commotion, or erratic crowd behavior.',
      icon: <HelpCircle className="w-5 h-5 text-amber-400" />,
      color: 'bg-amber-950/30 text-amber-300',
      border: 'border-amber-500/40',
    },
    {
      id: 'flood_route_issue',
      title: 'Route Issue / Flooding',
      description: 'Flooded road, submerged underpass, fallen tree, broken streetlights.',
      icon: <Waves className="w-5 h-5 text-sky-400" />,
      color: 'bg-sky-950/30 text-sky-300',
      border: 'border-sky-500/40',
    },
  ];

  const handleSubmit = () => {
    onSubmitSignal(selectedCategory, selectedZoneId, quickNote);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setQuickNote('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Signal Logged Silently
            </h3>
            <p className="text-xs text-slate-300 max-w-xs">
              Your anonymous signal was aggregated into RAKSHA's AI Anomaly Detection engine. Nearby users' Safety Index updated in real-time.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-mono pt-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collective protection network reinforced</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  Silent Community Flag
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    100% Anonymous
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  No forms, no sign-ups. One tap protects the next person walking here.
                </p>
              </div>
            </div>

            {/* Zone Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Flagging Location / Zone:
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    📍 {z.name} (Current Base Score: {z.baseSafetyScore})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Options */}
            <div className="space-y-2.5 mb-4">
              <label className="text-xs font-semibold text-slate-300 block">
                Select Nature of Signal:
              </label>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? `${cat.color} ${cat.border} ring-1 ring-white/20 shadow-md`
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{cat.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-xs text-white flex items-center justify-between">
                        <span>{cat.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional note */}
            <div className="mb-5">
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Optional Quick Detail (e.g., "Streetlights off near ATM"):
              </label>
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Optional - tap submit directly if in a hurry"
                className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Transmit Signal Silently</span>
            </button>

            {/* Privacy footnote */}
            <div className="mt-3 text-center text-[10px] text-slate-500">
              Zero GPS tracing, IP masking enabled. Signals decay automatically after 4 hours.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
