import React from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  Users, 
  Waves, 
  PhoneCall, 
  Navigation, 
  Star,
  Clock,
  ExternalLink
} from 'lucide-react';
import { CityZone, POIItem, UnderpassAlert, WeatherType, CommunitySignal } from '../types';
import { calculateZoneSafetyScore } from '../services/safetyEngine';

interface ZoneDetailsSheetProps {
  zone: CityZone | null;
  poi: POIItem | null;
  underpass: UnderpassAlert | null;
  currentHour: number;
  weather: WeatherType;
  communitySignals: CommunitySignal[];
  onClose: () => void;
  onOpenFlagModal: (zoneId?: string) => void;
  onSelectRouteWithDestination?: (poiCoords: { lat: number; lng: number }, name: string) => void;
}

export const ZoneDetailsSheet: React.FC<ZoneDetailsSheetProps> = ({
  zone,
  poi,
  underpass,
  currentHour,
  weather,
  communitySignals,
  onClose,
  onOpenFlagModal,
  onSelectRouteWithDestination,
}) => {
  if (!zone && !poi && !underpass) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/80 p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[75vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        
        {/* Close Button */}
        <div className="flex justify-end mb-1">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Zone Inspection View */}
        {zone && !poi && !underpass && (
          (() => {
            const scoreData = calculateZoneSafetyScore(zone, currentHour, weather, communitySignals);
            return (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                        📍 City Zone Inspector
                      </span>
                      {zone.activeSignalsCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
                          ⚠️ {zone.activeSignalsCount} active community flags
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1 font-display">
                      {zone.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {zone.description}
                    </p>
                  </div>

                  {/* Big Score Box */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Safety Index
                      </span>
                      <span className="text-xs font-bold" style={{ color: scoreData.color }}>
                        {scoreData.rating}
                      </span>
                    </div>
                    <div
                      className="text-2xl sm:text-3xl font-extrabold font-mono px-3 py-1 rounded-xl border"
                      style={{
                        backgroundColor: `${scoreData.color}22`,
                        borderColor: scoreData.color,
                        color: scoreData.color,
                      }}
                    >
                      {scoreData.compositeScore}
                    </div>
                  </div>
                </div>

                {/* Narrative Explanation */}
                <div className="my-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{scoreData.narrativeExplanation}</span>
                </div>

                {/* Sub Factors Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Street Lighting</span>
                    </div>
                    <span className="text-sm font-bold text-slate-200">
                      {zone.lightingScore}% Quality
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>Crowd Density</span>
                    </div>
                    <span className="text-sm font-bold text-slate-200">
                      {currentHour >= 20 || currentHour < 5 ? zone.crowdDensityNight : zone.crowdDensityDay}% Footfall
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                      <Waves className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Monsoon Risk</span>
                    </div>
                    <span className={`text-xs font-bold uppercase ${zone.floodRiskLevel === 'critical_underpass' ? 'text-rose-400' : 'text-slate-300'}`}>
                      {zone.floodRiskLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
                      <span>Citizen Signals</span>
                    </div>
                    <span className="text-sm font-bold text-purple-400">
                      {zone.activeSignalsCount} Verified
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onOpenFlagModal(zone.id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report Signal in this Zone</span>
                  </button>
                </div>
              </div>
            );
          })()
        )}

        {/* 2. POI Inspection View */}
        {poi && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    {poi.subType}
                  </span>
                  {poi.open24Hours && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ● Open 24/7
                    </span>
                  )}
                  {poi.hasEmergencyDepartment && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      🚨 Level 1 Trauma Care
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mt-1 font-display">
                  {poi.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {poi.address}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{poi.rating}</span>
                </div>
                {poi.priceLevel && (
                  <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs">
                    {poi.priceLevel}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 my-3 leading-relaxed">
              {poi.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {poi.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{poi.open24Hours ? 'Always Accessible' : `Open until ${poi.openUntil}`}</span>
              </div>
              <div className="flex items-center gap-2">
                {poi.contactNumber && (
                  <a
                    href={`tel:${poi.contactNumber}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Facility</span>
                  </a>
                )}
                {onSelectRouteWithDestination && (
                  <button
                    onClick={() => onSelectRouteWithDestination(poi.coordinates, poi.name)}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Find Safest Route</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Underpass Flood Inspection View */}
        {underpass && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  🌊 Monsoon Underpass Sensor
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1 font-display">
                  {underpass.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Last telemetry update: {underpass.lastUpdated}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-xl border text-center ${
                  underpass.status === 'clear'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-600 text-rose-300 animate-pulse'
                }`}>
                  <span className="text-[10px] uppercase font-bold block">Water Depth</span>
                  <span className="text-xl font-extrabold font-mono">
                    {underpass.waterDepthCm} cm
                  </span>
                </div>
              </div>
            </div>

            <div className="my-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-start gap-2 text-slate-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Active Traffic Advisory:</strong>
                  <p className="text-slate-400 mt-0.5">
                    {underpass.status === 'clear' 
                      ? 'No water accumulation detected. Normal vehicular movement permissible.'
                      : `Flooding exceeds safe clearance (30cm). Diverting vehicles to: ${underpass.trafficDivertedTo}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onOpenFlagModal()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <span>Report Road Status Update</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
