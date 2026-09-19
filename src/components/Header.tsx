import React, { useState } from 'react';
import { 
  Shield, 
  CloudRain, 
  Sun, 
  Cloud, 
  Clock, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  Navigation,
  Activity,
  Award
} from 'lucide-react';
import { WeatherType } from '../types';
import { CITIES } from '../data/mockCityData';

interface HeaderProps {
  currentCityId: string;
  onCityChange: (cityId: string) => void;
  currentHour: number;
  onHourChange: (hour: number) => void;
  weather: WeatherType;
  onWeatherChange: (weather: WeatherType) => void;
  onOpenFlagModal: () => void;
  onOpenEmergencyModal: () => void;
  onOpenTrustedCircle: () => void;
  onOpenInsights: () => void;
  onOpenAICapstone: () => void;
  onToggleRoutePlanner: () => void;
  isRoutePlannerOpen: boolean;
  activeSignalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCityId,
  onCityChange,
  currentHour,
  onHourChange,
  weather,
  onWeatherChange,
  onOpenFlagModal,
  onOpenEmergencyModal,
  onOpenTrustedCircle,
  onOpenInsights,
  onOpenAICapstone,
  onToggleRoutePlanner,
  isRoutePlannerOpen,
  activeSignalsCount,
}) => {
  const [holdingEmergency, setHoldingEmergency] = useState(false);
  const [emergencyProgress, setEmergencyProgress] = useState(0);

  // Time formatting
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
  };

  // 2-second hold handler for Emergency SOS
  let holdInterval: any = null;
  const startEmergencyHold = () => {
    setHoldingEmergency(true);
    let progress = 0;
    holdInterval = setInterval(() => {
      progress += 10;
      setEmergencyProgress(progress);
      if (progress >= 100) {
        clearInterval(holdInterval);
        setHoldingEmergency(false);
        setEmergencyProgress(0);
        onOpenEmergencyModal();
      }
    }, 100);
  };

  const cancelEmergencyHold = () => {
    if (holdInterval) clearInterval(holdInterval);
    setHoldingEmergency(false);
    setEmergencyProgress(0);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5 sm:px-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        
        {/* Brand & City Selector */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 shadow-md shadow-sky-500/20 text-white font-bold">
              <Shield className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-display">
                  RAKSHA
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  <Award className="w-3 h-3 text-cyan-400" />
                  CBSE AI Capstone 2025–26
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                The City That Watches Over You
              </p>
            </div>
          </div>

          {/* City Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={currentCityId}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-slate-800/90 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  📍 {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Simulator & Weather Control Bar */}
        <div className="flex flex-wrap items-center justify-between sm:justify-center gap-2 text-xs bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/60">
          
          {/* Live / Simulated Hour */}
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-slate-200 text-xs min-w-[68px]">
              {formatHour(currentHour)}
            </span>
            <input
              type="range"
              min="0"
              max="23"
              value={currentHour}
              onChange={(e) => onHourChange(parseInt(e.target.value))}
              className="w-16 sm:w-24 accent-sky-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              title="Drag to simulate time changes across 24 hours"
            />
          </div>

          {/* Weather Simulation Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onWeatherChange('clear')}
              className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-medium transition-all ${
                weather === 'clear'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simulate Clear Conditions"
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={() => onWeatherChange('overcast')}
              className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-medium transition-all ${
                weather === 'overcast'
                  ? 'bg-slate-700 text-slate-100 border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simulate Overcast Weather"
            >
              <Cloud className="w-3 h-3 text-slate-300" />
              <span className="hidden sm:inline">Cloudy</span>
            </button>
            <button
              onClick={() => onWeatherChange('monsoon_downpour')}
              className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-medium transition-all ${
                weather === 'monsoon_downpour'
                  ? 'bg-sky-500/25 text-sky-300 border border-sky-500/50 shadow-sm shadow-sky-500/20 animate-pulse'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simulate Heavy Monsoon Downpour (Activates Flood Intelligence)"
            >
              <CloudRain className="w-3 h-3 text-sky-400" />
              <span className="font-semibold text-sky-300">Monsoon</span>
            </button>
          </div>
        </div>

        {/* Action Controls: Routes, Flag, Circle, SOS */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
          
          {/* Route Planner Toggle */}
          <button
            onClick={onToggleRoutePlanner}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isRoutePlannerOpen
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Safe Routes</span>
          </button>

          {/* Silent Community Flagging */}
          <button
            onClick={onOpenFlagModal}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800/90 text-amber-300 border border-amber-500/30 hover:bg-amber-950/40 hover:border-amber-500/60 transition-all relative"
            title="Silent Community Flagging - 1 tap to anonymously signal unsafe spot"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Silent Flag</span>
            {activeSignalsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Trusted Circle */}
          <button
            onClick={onOpenTrustedCircle}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all"
            title="Trusted Circle & Silent Check-In"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Trusted Circle</span>
          </button>

          {/* Personal Insights & AI Inspector */}
          <button
            onClick={onOpenInsights}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
            title="Monthly Movement & Safety Insights"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">Insights</span>
          </button>

          {/* AI Capstone & Model Spec */}
          <button
            onClick={onOpenAICapstone}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-indigo-950/60 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900/70 transition-all"
            title="CBSE AI Capstone Architecture & Anomaly Models"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">AI Model</span>
          </button>

          {/* Emergency SOS Quick-Access (Hold 2 Seconds) */}
          <div className="relative">
            <button
              onMouseDown={startEmergencyHold}
              onMouseUp={cancelEmergencyHold}
              onMouseLeave={cancelEmergencyHold}
              onTouchStart={startEmergencyHold}
              onTouchEnd={cancelEmergencyHold}
              className="relative overflow-hidden px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all active:scale-95 flex items-center gap-1"
              title="Hold 2 seconds for Emergency SOS quick access"
            >
              {holdingEmergency && (
                <span
                  className="absolute inset-0 bg-rose-950/80 transition-all duration-100"
                  style={{ width: `${emergencyProgress}%` }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>SOS</span>
                <span className="text-[10px] opacity-80 hidden sm:inline">(Hold 2s)</span>
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
