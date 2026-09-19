import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Activity, 
  CloudRain, 
  GitBranch, 
  Award, 
  CheckCircle2, 
  X, 
  BookOpen, 
  Layers,
  Database
} from 'lucide-react';
import { CityZone } from '../types';

interface AIEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: CityZone[];
}

export const AIEngineModal: React.FC<AIEngineModalProps> = ({
  isOpen,
  onClose,
  zones,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80 uppercase tracking-widest">
                CBSE CLASS 12 AI CAPSTONE PROJECT · 2025–26
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              RAKSHA AI Engine & Architecture
            </h2>
            <p className="text-xs text-slate-300">
              Four purposeful, non-decorative machine learning components powering urban safety
            </p>
          </div>
        </div>

        {/* The 4 Core AI Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          
          {/* 1. Anomaly Detection */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400">
              <Activity className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white font-display">1. Anomaly Detection</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monitors continuous streams of silent community flags. When signal arrivals deviate by &gt;2.5σ from historical Poisson baseline for that hour, an anomaly surge is flagged and zone safety drops in real-time.
            </p>
            <span className="text-[10px] font-mono text-slate-400 block bg-slate-900 px-2 py-1 rounded">
              Algorithm: Kernel Density Estimation + Z-Score Cluster Drift
            </span>
          </div>

          {/* 2. Time-Series Pattern Recognition */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Layers className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white font-display">2. Time-Series Safety Curves</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesizes 24-hour periodic cycles. Learns that commercial centers (e.g. Navrangpura) drop in footfall at 10 PM, elevating the importance of street illumination and verified transit corridors.
            </p>
            <span className="text-[10px] font-mono text-slate-400 block bg-slate-900 px-2 py-1 rounded">
              Algorithm: Fourier Decomposed Multi-Seasonal Regression
            </span>
          </div>

          {/* 3. Flood Zone Prediction */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <CloudRain className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white font-display">3. Predictive Monsoon Flooding</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Combines live millimeter rainfall rate, soil drainage saturation, and underpass depression elevation to predict impassable roads 45 to 90 minutes <em>before</em> vehicle submergence happens.
            </p>
            <span className="text-[10px] font-mono text-slate-400 block bg-slate-900 px-2 py-1 rounded">
              Algorithm: Hydrological Runoff Machine Learning Model
            </span>
          </div>

          {/* 4. Multi-Variable Route Optimization */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <GitBranch className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white font-display">4. Multi-Factor Route Scorer</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlike ordinary GPS navigation that optimizes purely for shortest travel time, RAKSHA solves a Pareto-optimal multi-objective function factoring illumination, active flags, and flood risk.
            </p>
            <span className="text-[10px] font-mono text-slate-400 block bg-slate-900 px-2 py-1 rounded">
              Cost = α·Time + β·(100 - Safety) + γ·FloodRisk + δ·Darkness
            </span>
          </div>

        </div>

        {/* Live Zone Feature Vector Inspector */}
        {activeZone && (
          <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-sky-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live AI Feature Vector Inspector
                </h4>
              </div>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    Inspect: {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Base Baseline</span>
                <span className="text-sm font-bold text-emerald-400">{activeZone.baseSafetyScore}/100</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Municipal Lighting</span>
                <span className="text-sm font-bold text-amber-400">{activeZone.lightingScore}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Crowd Density Night</span>
                <span className="text-sm font-bold text-sky-400">{activeZone.crowdDensityNight}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Flood Risk Class</span>
                <span className={`text-xs font-bold uppercase ${activeZone.floodRiskLevel === 'critical_underpass' ? 'text-rose-400' : 'text-slate-300'}`}>
                  {activeZone.floodRiskLevel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SDG Alignment Section */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              United Nations Sustainable Development Goals (SDG) Alignment
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px]">
                SDG 11
              </span>
              <span><strong>Sustainable Cities & Communities:</strong> Climate-resilient urban navigation and proactive waterlogging warnings.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold font-mono text-[10px]">
                SDG 5
              </span>
              <span><strong>Gender Equality:</strong> Empowering women with well-lit corridors, silent flagging, and anxiety-free transit.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[10px]">
                SDG 3
              </span>
              <span><strong>Good Health & Wellbeing:</strong> Instantaneous 1-tap dispatch to trauma hospitals, blood banks, and 24h medicine.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold font-mono text-[10px]">
                SDG 16
              </span>
              <span><strong>Peace, Justice & Institutions:</strong> Grassroots community intelligence augmenting municipal safety agencies.</span>
            </div>
          </div>
        </div>

        {/* Quotation Footnote */}
        <div className="text-center text-xs text-slate-400 italic pt-1">
          "Every safety app ever built waits for something to go wrong. RAKSHA works hardest in the hours when nothing has happened yet."
        </div>

      </div>
    </div>
  );
};
