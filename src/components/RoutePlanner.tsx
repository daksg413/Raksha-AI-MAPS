import React, { useState } from 'react';
import { 
  Navigation, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  Waves, 
  X,
  Sparkles,
  ArrowRight,
  MapPin,
  Plus
} from 'lucide-react';
import { RouteOption } from '../types';

interface RoutePlannerProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onSelectRoute: (route: RouteOption) => void;
  onClose: () => void;
  onSimulateArrival: (destinationName: string) => void;
  currentDestinationName?: string;
  onOpenAddDestinationModal: () => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  onClose,
  onSimulateArrival,
  currentDestinationName = 'Navrangpura Commercial Hub',
  onOpenAddDestinationModal,
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStepIndex, setNavStepIndex] = useState(0);

  const navigationSteps = [
    `Head towards ${currentDestinationName} via high-illumination arterial corridors (95% Lit)`,
    'Bypassing dark secondary lanes — commercial camera surveillance verified',
    'Avoiding low-lying underpass; elevated flyover route locked in',
    `Approaching destination: ${currentDestinationName} — High footfall zone`,
    `Arrived safely at ${currentDestinationName}. Automated Trusted Circle check-in triggered!`,
  ];

  const handleStartSimulation = () => {
    setIsNavigating(true);
    setNavStepIndex(0);

    const stepInterval = setInterval(() => {
      setNavStepIndex((prev) => {
        if (prev >= navigationSteps.length - 1) {
          clearInterval(stepInterval);
          setIsNavigating(false);
          // Fire automatic arrival check-in to Trusted Circle!
          onSimulateArrival(currentDestinationName);
          return 0;
        }
        return prev + 1;
      });
    }, 2400);
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-5 shadow-2xl relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
                  Safe Route Navigator
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Multi-Color Route Segments
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <span>Destination:</span>
                <strong className="text-sky-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {currentDestinationName}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddDestinationModal}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Change / Add Destination</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Navigation Simulation Bar */}
        {isNavigating && (
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-sky-950 via-slate-900 to-emerald-950 border border-sky-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {navStepIndex + 1}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Active Safe Navigation Simulation
                </span>
                <p className="text-sm font-semibold text-slate-100">
                  {navigationSteps[navStepIndex]}
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-medium">
              Trusted Circle Auto-CheckIn Armed
            </span>
          </div>
        )}

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {routes.map((route) => {
            const isSelected = selectedRoute?.id === route.id;
            const isRecommended = route.recommendationTag?.includes('Recommended');
            const isLowSafety = route.safetyScore < 60;
            const segments = route.segments || [];

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route)}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-400 ring-1 ring-sky-400/40 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Badge Tag */}
                {isRecommended && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" />
                    RECOMMENDED SAFE
                  </div>
                )}
                {isLowSafety && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                    <AlertTriangle className="w-3 h-3" />
                    HIGH HAZARD LEG
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-100 leading-snug">
                      {route.title}
                    </h4>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 my-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Safety Score</span>
                      <span
                        className={`text-base font-extrabold font-mono ${
                          route.safetyScore >= 80
                            ? 'text-emerald-400'
                            : route.safetyScore >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {route.safetyScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Travel Time</span>
                      <span className="text-base font-bold text-slate-200">
                        {route.durationMins} mins
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Distance</span>
                      <span className="text-base font-bold text-slate-300">
                        {route.distanceKm} km
                      </span>
                    </div>
                  </div>

                  {/* Visual Route Segment Color Spectrum Bar */}
                  {segments.length > 0 && (
                    <div className="my-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Route Segment Spectrum:</span>
                        <span className="font-mono">{segments.length} Legs</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-950 flex overflow-hidden p-0.5 gap-0.5 border border-slate-800">
                        {segments.map((seg, sIdx) => (
                          <div
                            key={sIdx}
                            title={`${seg.name}: ${seg.safetyScore}/100 (${seg.status})`}
                            style={{
                              backgroundColor: seg.color,
                              flex: seg.distanceMeters || 1,
                            }}
                            className="h-full rounded-sm transition-opacity hover:opacity-80"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attributes list */}
                  <div className="space-y-1.5 text-xs text-slate-300 mt-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Lighting: <strong>{route.lightingRating}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        Flood Status:{' '}
                        <strong
                          className={
                            route.floodRisk.includes('Avoided') || route.floodRisk.includes('Active')
                              ? 'text-rose-400'
                              : 'text-slate-200'
                          }
                        >
                          {route.floodRisk}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Warnings / Highlights */}
                  {route.warnings.length > 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300 space-y-1">
                      {route.warnings.map((w, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {route.highlights.length > 0 && route.warnings.length === 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 space-y-1">
                      {route.highlights.slice(0, 2).map((h, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Select / Action Button */}
                <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-sky-400">
                    {isSelected ? '✓ Showing Colored Segments' : 'Click to preview on map'}
                  </span>
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSimulation();
                      }}
                      disabled={isNavigating}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 disabled:opacity-50"
                    >
                      <span>Simulate Safe Trip</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
