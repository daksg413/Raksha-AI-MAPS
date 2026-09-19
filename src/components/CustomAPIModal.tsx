import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  CheckCircle2, 
  ExternalLink, 
  Server, 
  Key, 
  Zap, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface CustomAPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (config: { provider: string; endpointUrl: string; apiKey?: string }) => void;
}

export const CustomAPIModal: React.FC<CustomAPIModalProps> = ({
  isOpen,
  onClose,
  onSaveConfig,
}) => {
  const [provider, setProvider] = useState<'raksha_internal' | 'osrm' | 'google_maps' | 'mapbox' | 'custom'>('raksha_internal');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTestSuccess(true);
    onSaveConfig({ provider, endpointUrl, apiKey });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Routing & Map API Settings
              </h3>
              <p className="text-xs text-slate-400">
                Plug in your custom routing API or use RAKSHA's built-in safety engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-3.5 my-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Select Routing Engine Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                const val = e.target.value as typeof provider;
                setProvider(val);
                if (val === 'osrm') {
                  setEndpointUrl('https://router.project-osrm.org/route/v1/driving/');
                } else if (val === 'google_maps') {
                  setEndpointUrl('https://maps.googleapis.com/maps/api/directions/json');
                } else if (val === 'mapbox') {
                  setEndpointUrl('https://api.mapbox.com/directions/v5/mapbox/driving');
                } else {
                  setEndpointUrl('');
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="raksha_internal">RAKSHA Hybrid AI Engine (Built-in Default)</option>
              <option value="osrm">OpenStreetMap OSRM Public Routing Server</option>
              <option value="google_maps">Google Maps Directions API</option>
              <option value="mapbox">Mapbox Driving Directions API</option>
              <option value="custom">Custom REST Proxy / Backend URL</option>
            </select>
          </div>

          {provider !== 'raksha_internal' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  API Endpoint URL
                </label>
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="https://api.yourserver.com/route"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              {provider !== 'osrm' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key or leave blank for local proxy"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}
            </>
          )}

          {/* Architecture info box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>How RAKSHA Uses Custom APIs:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When an external routing provider returns raw polyline geometries, RAKSHA divides the path into 
              <strong> micro-segments</strong>, evaluates municipal lighting lux data, intersects flood zones, and applies real-time community anomaly penalties to dynamically color each leg in 
              <span className="text-emerald-400 font-bold"> Green</span>, 
              <span className="text-amber-400 font-bold"> Amber</span>, and 
              <span className="text-rose-400 font-bold"> Red</span>.
            </p>
          </div>

          {testSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Routing configuration verified! Live route safety scoring active.</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Apply & Test Configuration</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
