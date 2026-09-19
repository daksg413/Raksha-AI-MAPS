import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Compass, 
  Sun, 
  Moon, 
  Globe, 
  Volume2, 
  Share2, 
  Code2, 
  Sparkles,
  Check,
  Flame
} from 'lucide-react';
import { MapTileTheme } from '../types';

interface MapOptionsPanelProps {
  mapTheme: MapTileTheme;
  onSelectMapTheme: (theme: MapTileTheme) => void;
  isPinDropMode: boolean;
  onTogglePinDropMode: () => void;
  onOpenCustomAPIModal: () => void;
  onOpenAddDestinationModal: () => void;
  onShareLiveBeacon: () => void;
}

export const MapOptionsPanel: React.FC<MapOptionsPanelProps> = ({
  mapTheme,
  onSelectMapTheme,
  isPinDropMode,
  onTogglePinDropMode,
  onOpenCustomAPIModal,
  onOpenAddDestinationModal,
  onShareLiveBeacon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [copiedBeacon, setCopiedBeacon] = useState(false);

  // Web Audio API SOS Siren Simulator (Safety audible alarm demonstration)
  const handleTestSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);
      osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.9);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.4);
      setIsPlayingSiren(true);
      setTimeout(() => setIsPlayingSiren(false), 1400);
    } catch {
      // Audio context may be restricted in some iframe contexts
    }
  };

  const handleShareClick = () => {
    setCopiedBeacon(true);
    onShareLiveBeacon();
    setTimeout(() => setCopiedBeacon(false), 3000);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg border transition-all ${
          isOpen
            ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/20'
            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 backdrop-blur-md'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Map Options & Tools</span>
        {isPinDropMode && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute top-10 right-0 z-30 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 text-slate-200">
          
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Map Views & Interactivity</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* 1. Base Tile Theme Selector */}
          <div className="mb-3">
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
              Base Map Perspective
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onSelectMapTheme('dark_tactical')}
                className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-2 border transition-all ${
                  mapTheme === 'dark_tactical'
                    ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <div>
                  <div className="leading-tight">Dark Tactical</div>
                  <div className="text-[9px] text-slate-400 font-normal">Night Contrast</div>
                </div>
              </button>

              <button
                onClick={() => onSelectMapTheme('street_navigation')}
                className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-2 border transition-all ${
                  mapTheme === 'street_navigation'
                    ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <div className="leading-tight">Street Grid</div>
                  <div className="text-[9px] text-slate-400 font-normal">Day Clarity</div>
                </div>
              </button>

              <button
                onClick={() => onSelectMapTheme('satellite_hybrid')}
                className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-2 border transition-all ${
                  mapTheme === 'satellite_hybrid'
                    ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="leading-tight">Satellite Recon</div>
                  <div className="text-[9px] text-slate-400 font-normal">Aerial Terrain</div>
                </div>
              </button>

              <button
                onClick={() => onSelectMapTheme('lighting_heatmap')}
                className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-2 border transition-all ${
                  mapTheme === 'lighting_heatmap'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <div className="leading-tight">Lux Heatmap</div>
                  <div className="text-[9px] text-slate-400 font-normal">Light Density</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Destination Interactivity Tools */}
          <div className="mb-3 pt-2.5 border-t border-slate-800">
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
              Destination Actions
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onTogglePinDropMode();
                }}
                className={`w-full p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                  isPinDropMode
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <div>
                    <span>{isPinDropMode ? '● Click on Map Active' : 'Click on Map to Set Destination'}</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {isPinDropMode ? 'Click any point on the map now' : 'Drops custom pin & generates safe routes'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800">
                  {isPinDropMode ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddDestinationModal();
                }}
                className="w-full p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-2 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <div>
                  <span>Search or Bookmark Destination</span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    Search landmarks, institutions, hospitals, or custom address
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Safety Utilities (Audio Alarm & Live Beacon) */}
          <div className="pt-2.5 border-t border-slate-800 space-y-2">
            <label className="text-[11px] font-bold text-slate-300 block">
              Safety Sound & Sharing
            </label>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleTestSiren}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  isPlayingSiren
                    ? 'bg-rose-600 text-white border-rose-400 animate-bounce'
                    : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-rose-300'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                <span>{isPlayingSiren ? 'Sounding!' : '95dB Siren Test'}</span>
              </button>

              <button
                onClick={handleShareClick}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  copiedBeacon
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                {copiedBeacon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-sky-400" />}
                <span>{copiedBeacon ? 'Beacon Copied!' : 'Share Live Beacon'}</span>
              </button>
            </div>

            {/* Custom Routing API Option */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCustomAPIModal();
              }}
              className="w-full mt-1 p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-2 bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/80 text-sky-300 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <div>
                <span>Custom Routing API Endpoint</span>
                <span className="block text-[10px] text-slate-400 font-normal">
                  Connect custom directions API or Google Maps / OSRM endpoint
                </span>
              </div>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
