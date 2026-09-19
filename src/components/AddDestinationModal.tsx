import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  Plus, 
  Building2, 
  Hospital, 
  GraduationCap, 
  Coffee, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Coordinates, CustomDestination } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockCityData';

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination: (dest: { name: string; coordinates: Coordinates }) => void;
  onSaveCustomDestination: (dest: CustomDestination) => void;
  customSavedDestinations: CustomDestination[];
}

export const AddDestinationModal: React.FC<AddDestinationModalProps> = ({
  isOpen,
  onClose,
  onSelectDestination,
  onSaveCustomDestination,
  customSavedDestinations,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');

  // Custom Form state
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Personal / Work');
  const [customAddress, setCustomAddress] = useState('');
  const [customLat, setCustomLat] = useState('23.0365');
  const [customLng, setCustomLng] = useState('72.5510');

  if (!isOpen) return null;

  const allDestinations = [
    ...customSavedDestinations,
    ...POPULAR_DESTINATIONS.map((d) => ({
      ...d,
      isCustom: false,
    })),
  ];

  const filteredDestinations = allDestinations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const latNum = parseFloat(customLat) || 23.0365;
    const lngNum = parseFloat(customLng) || 72.5510;

    const newDest: CustomDestination = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      address: customAddress.trim() || 'Custom Ahmedabad location',
      coordinates: { lat: latNum, lng: lngNum },
      isCustom: true,
    };

    onSaveCustomDestination(newDest);
    onSelectDestination({ name: newDest.name, coordinates: newDest.coordinates });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Choose or Add Destination
              </h3>
              <p className="text-xs text-slate-400">
                Select landmarks or enter a custom address to generate color-coded safe routes
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

        {/* Tab switcher */}
        <div className="flex gap-2 my-3 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Search Popular Destinations
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Add Custom Place
          </button>
        </div>

        {/* Tab 1: Search Destinations */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search college, hospital, market, or office..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredDestinations.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => {
                    onSelectDestination({ name: dest.name, coordinates: dest.coordinates });
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-sky-400 shrink-0 mt-0.5">
                      {dest.category.includes('Hospital') ? (
                        <Hospital className="w-4 h-4 text-rose-400" />
                      ) : dest.category.includes('Institutional') || dest.category.includes('Educational') ? (
                        <GraduationCap className="w-4 h-4 text-purple-400" />
                      ) : dest.category.includes('Food') ? (
                        <Coffee className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Building2 className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-white">
                          {dest.name}
                        </h4>
                        {dest.isCustom && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-bold">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {dest.address}
                      </p>
                      <span className="text-[10px] text-sky-400/80 font-medium">
                        {dest.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-sky-400 font-semibold shrink-0">
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Route</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Place Form */}
        {activeTab === 'custom' && (
          <form onSubmit={handleCreateCustom} className="space-y-3 flex-1 overflow-y-auto pr-1">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Destination Name *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. My College Dorm, Office Tower, Friend's House"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Personal / Work">Personal / Workplace</option>
                <option value="Education / Study">College / Tuition / Library</option>
                <option value="Hospital / Medical">Medical Clinic / Chemist</option>
                <option value="Transit / Station">Railway / Metro / Bus Terminal</option>
                <option value="Residential">Friend / Relative Residence</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Address / Landmark description
              </label>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="e.g. Near Sindhu Bhavan Road, Bodakdev"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              💡 Tip: You can also simply click anywhere directly on the map to set an immediate destination!
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
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
                <Plus className="w-3.5 h-3.5" />
                <span>Save & Plan Safest Route</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
