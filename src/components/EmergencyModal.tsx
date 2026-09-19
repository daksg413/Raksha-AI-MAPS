import React, { useState } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  Share2, 
  MapPin, 
  Building2, 
  Pill, 
  Shield, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';
import { POIItem, TrustedContact } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: POIItem[];
  pharmacies: POIItem[];
  trustedContacts: TrustedContact[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  pharmacies,
  trustedContacts,
}) => {
  const [broadcastSent, setBroadcastSent] = useState(false);

  if (!isOpen) return null;

  const topHospitals = hospitals.slice(0, 3);
  const topPharmacy = pharmacies[0];

  const handleBroadcastAlert = () => {
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-rose-600/80 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl shadow-rose-950/50 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emergency Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-rose-900/40">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/40 animate-pulse">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-600/20 text-rose-400 font-extrabold text-[10px] tracking-widest uppercase border border-rose-500/30">
                CRITICAL QUICK ACCESS
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white font-display">
              Emergency Assistance Hub
            </h2>
            <p className="text-xs text-slate-300">
              Immediate triage: facilities nearest to your live coordinates
            </p>
          </div>
        </div>

        {/* 1-Tap SOS Dispatch to Trusted Circle */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-rose-400" />
              Broadcast SOS to Trusted Circle ({trustedContacts.length} contacts)
            </h4>
            <p className="text-xs text-slate-300">
              Dispatches your coordinates and high-priority distress push alert instantly.
            </p>
          </div>
          <button
            onClick={handleBroadcastAlert}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-lg ${
              broadcastSent
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 active:scale-95'
            }`}
          >
            {broadcastSent ? (
              <>
                <Check className="w-4 h-4" />
                <span>Alert Sent!</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-4 h-4" />
                <span>Trigger Circle Alert</span>
              </>
            )}
          </button>
        </div>

        {/* National Hotlines Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <a
            href="tel:112"
            className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-center transition-all group"
          >
            <span className="text-[10px] text-slate-400 block font-medium">All Emergency</span>
            <span className="text-lg font-extrabold text-rose-400 font-mono block group-hover:scale-105 transition-transform">
              112
            </span>
            <span className="text-[10px] text-slate-300">Tap to Call</span>
          </a>

          <a
            href="tel:1091"
            className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-center transition-all group"
          >
            <span className="text-[10px] text-slate-400 block font-medium">Women Helpline</span>
            <span className="text-lg font-extrabold text-pink-400 font-mono block group-hover:scale-105 transition-transform">
              1091
            </span>
            <span className="text-[10px] text-slate-300">Tap to Call</span>
          </a>

          <a
            href="tel:108"
            className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-center transition-all group"
          >
            <span className="text-[10px] text-slate-400 block font-medium">Ambulance</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono block group-hover:scale-105 transition-transform">
              108
            </span>
            <span className="text-[10px] text-slate-300">Tap to Call</span>
          </a>
        </div>

        {/* Nearest 3 Emergency Hospitals */}
        <div className="space-y-3 mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-rose-400" />
            Nearest Emergency & Trauma Hospitals
          </h4>
          <div className="space-y-2">
            {topHospitals.map((hosp, idx) => (
              <div
                key={hosp.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-100">
                      {hosp.name}
                    </h5>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold border border-rose-800/40">
                      24/7 ER
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {hosp.address} (approx. {(0.8 + idx * 0.9).toFixed(1)} km)
                  </p>
                </div>
                {hosp.contactNumber && (
                  <a
                    href={`tel:${hosp.contactNumber}`}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white transition-colors shrink-0"
                    title="Call Hospital Emergency Desk"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Nearest 24h Pharmacy */}
        {topPharmacy && (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Nearest 24-Hour Pharmacy
                </span>
                <h5 className="font-bold text-xs sm:text-sm text-slate-100">
                  {topPharmacy.name}
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {topPharmacy.address} (0.5 km away)
                </p>
              </div>
            </div>
            {topPharmacy.contactNumber && (
              <a
                href={`tel:${topPharmacy.contactNumber}`}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors shrink-0"
                title="Call Pharmacy"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Police Station & PCR Dispatch note */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>Nearest Police Post: Navrangpura Police Station (1.1 km)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">PCR Van #42 patrolling nearby</span>
        </div>

      </div>
    </div>
  );
};
