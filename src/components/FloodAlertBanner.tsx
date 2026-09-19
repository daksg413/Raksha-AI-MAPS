import React from 'react';
import { CloudRain, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { UnderpassAlert } from '../types';

interface FloodAlertBannerProps {
  underpasses: UnderpassAlert[];
  isMonsoon: boolean;
  onOpenRoutePlanner: () => void;
  onSelectUnderpass: (underpass: UnderpassAlert) => void;
}

export const FloodAlertBanner: React.FC<FloodAlertBannerProps> = ({
  underpasses,
  isMonsoon,
  onOpenRoutePlanner,
  onSelectUnderpass,
}) => {
  const floodedUnderpass = underpasses.find(
    (u) => u.status === 'waterlogging' || u.status === 'submerged_closed'
  );

  if (!isMonsoon && !floodedUnderpass) return null;

  return (
    <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-rose-950 border-b border-sky-500/40 px-3 py-2 sm:px-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse shrink-0">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sky-300 uppercase tracking-wider text-[11px]">
                Monsoon Rainwater Alert
              </span>
              {floodedUnderpass && (
                <span className="px-1.5 py-0.2 rounded bg-rose-600/30 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/40">
                  {floodedUnderpass.waterDepthCm}cm Depth at {floodedUnderpass.name.split('(')[0]}
                </span>
              )}
            </div>
            <p className="text-slate-300 text-[11px]">
              {floodedUnderpass 
                ? `Traffic diverted via: ${floodedUnderpass.trafficDivertedTo}. All low-sedan vehicles advised to reroute.`
                : 'Heavy rain detected: low-lying underpasses under continuous predictive sensor monitoring.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {floodedUnderpass && (
            <button
              onClick={() => onSelectUnderpass(floodedUnderpass)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-sky-300 hover:bg-slate-700 text-[11px] font-semibold border border-slate-700 transition-colors"
            >
              Sensor Details
            </button>
          )}
          <button
            onClick={onOpenRoutePlanner}
            className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Switch to Flood-Free Route</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
