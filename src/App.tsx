/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  CITIES, 
  AHMEDABAD_ZONES, 
  AHMEDABAD_POIS, 
  AHMEDABAD_UNDERPASSES, 
  DEFAULT_ROUTES, 
  DEFAULT_TRUSTED_CIRCLE, 
  INITIAL_USER_INSIGHTS 
} from './data/mockCityData';
import { 
  CityZone, 
  POIItem, 
  UnderpassAlert, 
  RouteOption, 
  TrustedContact, 
  PreferenceMode, 
  WeatherType, 
  FlagCategory, 
  CommunitySignal,
  MapTileTheme,
  CustomDestination,
  Coordinates
} from './types';
import { generateDynamicRoutes } from './services/safetyEngine';
import { Header } from './components/Header';
import { LayerSelector } from './components/LayerSelector';
import { MapEngine } from './components/MapEngine';
import { RoutePlanner } from './components/RoutePlanner';
import { SilentFlagModal } from './components/SilentFlagModal';
import { EmergencyModal } from './components/EmergencyModal';
import { TrustedCircleModal } from './components/TrustedCircleModal';
import { InsightsModal } from './components/InsightsModal';
import { AIEngineModal } from './components/AIEngineModal';
import { ZoneDetailsSheet } from './components/ZoneDetailsSheet';
import { FloodAlertBanner } from './components/FloodAlertBanner';
import { AddDestinationModal } from './components/AddDestinationModal';
import { CustomAPIModal } from './components/CustomAPIModal';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  // Core Application States
  const [currentCityId, setCurrentCityId] = useState<string>('ahmedabad');
  const [currentHour, setCurrentHour] = useState<number>(22); // 10:00 PM default to highlight night safety
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [activeMode, setActiveMode] = useState<PreferenceMode>('night');
  const [showLightingOverlay, setShowLightingOverlay] = useState<boolean>(true);
  const [showFloodOverlay, setShowFloodOverlay] = useState<boolean>(true);

  // Map Perspectives and Interactivity
  const [mapTheme, setMapTheme] = useState<MapTileTheme>('dark_tactical');
  const [isPinDropMode, setIsPinDropMode] = useState<boolean>(false);
  const [customDestination, setCustomDestination] = useState<{ name: string; coordinates: Coordinates } | null>(null);
  const [customSavedDestinations, setCustomSavedDestinations] = useState<CustomDestination[]>([]);
  const [activeDestinationName, setActiveDestinationName] = useState<string>('Navrangpura Commercial Hub');

  // Data Collections
  const [zones, setZones] = useState<CityZone[]>(AHMEDABAD_ZONES);
  const [pois] = useState<POIItem[]>(AHMEDABAD_POIS);
  const [underpasses, setUnderpasses] = useState<UnderpassAlert[]>(AHMEDABAD_UNDERPASSES);
  const [routes, setRoutes] = useState<RouteOption[]>(DEFAULT_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(DEFAULT_ROUTES[0]);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(DEFAULT_TRUSTED_CIRCLE);
  const [communitySignals, setCommunitySignals] = useState<CommunitySignal[]>([]);

  // Modals & Panels State
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isTrustedCircleOpen, setIsTrustedCircleOpen] = useState<boolean>(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState<boolean>(false);
  const [isAICapstoneOpen, setIsAICapstoneOpen] = useState<boolean>(false);
  const [isAddDestinationModalOpen, setIsAddDestinationModalOpen] = useState<boolean>(false);
  const [isCustomAPIModalOpen, setIsCustomAPIModalOpen] = useState<boolean>(false);

  // Inspector Sheet State
  const [inspectedZone, setInspectedZone] = useState<CityZone | null>(null);
  const [inspectedPOI, setInspectedPOI] = useState<POIItem | null>(null);
  const [inspectedUnderpass, setInspectedUnderpass] = useState<UnderpassAlert | null>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<{
    id: string;
    type: 'success' | 'alert' | 'ai';
    title: string;
    description: string;
  } | null>(null);

  // Active City Config
  const currentCity = useMemo(() => {
    return CITIES.find((c) => c.id === currentCityId) || CITIES[0];
  }, [currentCityId]);

  // Counts of POIs per mode for Layer badges
  const poiCounts = useMemo(() => {
    const counts: Record<PreferenceMode, number> = {
      emergency: 0,
      foodie: 0,
      student: 0,
      night: 0,
      family: 0,
      fitness: 0,
    };
    pois.forEach((poi) => {
      if (counts[poi.category] !== undefined) {
        counts[poi.category]++;
      }
      if (poi.category === 'night' || poi.open24Hours) {
        counts.night++;
      }
    });
    return counts;
  }, [pois]);

  const showToast = (type: 'success' | 'alert' | 'ai', title: string, description: string) => {
    setToastMessage({ id: Date.now().toString(), type, title, description });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Weather toggle with underpass status adjustment
  const handleWeatherChange = (newWeather: WeatherType) => {
    setWeather(newWeather);
    if (newWeather === 'monsoon_downpour') {
      setUnderpasses((prev) =>
        prev.map((u) =>
          u.id === 'u-akhbarnagar'
            ? { ...u, status: 'submerged_closed', waterDepthCm: 55 }
            : u
        )
      );
      showToast(
        'ai',
        'Monsoon Flood Intelligence Activated',
        'Akhbarnagar Underpass waterlogging detected (55cm). Routes re-evaluating via elevated flyovers.'
      );
    } else {
      setUnderpasses((prev) =>
        prev.map((u) =>
          u.id === 'u-akhbarnagar'
            ? { ...u, status: 'waterlogging', waterDepthCm: 25 }
            : u
        )
      );
    }
  };

  // Handle Destination Selection (from modal, POI, or landmark)
  const handleSelectDestination = (dest: { name: string; coordinates: Coordinates }) => {
    setCustomDestination(dest);
    setActiveDestinationName(dest.name);

    // User Origin
    const userOrigin: Coordinates = {
      lat: currentCity.center.lat + 0.006,
      lng: currentCity.center.lng - 0.008,
    };

    // Dynamically calculate 3 color-coded safety routes to this destination
    const dynamicRoutes = generateDynamicRoutes(
      userOrigin,
      dest.coordinates,
      dest.name,
      zones,
      underpasses,
      currentHour,
      weather,
      communitySignals
    );

    setRoutes(dynamicRoutes);
    setSelectedRoute(dynamicRoutes[0]);
    setIsRoutePlannerOpen(true);

    showToast(
      'ai',
      `Routes Generated to ${dest.name}`,
      `Computed 3 color-coded route corridors based on lighting, crowd density, and flood status.`
    );
  };

  // Handle Map Click to set destination
  const handleMapClick = (coords: Coordinates) => {
    if (isPinDropMode) {
      const pinName = `Custom Pin (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`;
      handleSelectDestination({ name: pinName, coordinates: coords });
      setIsPinDropMode(false);
      showToast('success', 'Destination Pin Placed', `Safe routing generated to your custom map coordinate.`);
    }
  };

  // Handle Silent Community Flag submission
  const handleSubmitSignal = (category: FlagCategory, targetZoneId: string, note: string) => {
    const newSignal: CommunitySignal = {
      id: `sig-${Date.now()}`,
      zoneId: targetZoneId,
      category,
      timestamp: 'Just now',
      coordinates: { lat: 23.0365, lng: 72.5510 },
      upvotes: 1,
      note: note || 'Community safety flag',
    };

    setCommunitySignals((prev) => [newSignal, ...prev]);

    setZones((prev) =>
      prev.map((z) => {
        if (z.id === targetZoneId) {
          const updatedCount = z.activeSignalsCount + 1;
          return {
            ...z,
            activeSignalsCount: updatedCount,
          };
        }
        return z;
      })
    );

    const affectedZone = zones.find((z) => z.id === targetZoneId);
    showToast(
      'ai',
      'AI Anomaly Cluster Updated',
      `Signal logged anonymously for ${affectedZone?.name || 'zone'}. Nearby user Safety Index adjusted.`
    );
  };

  // Handle Simulated Arrival Check-In to Trusted Circle
  const handleSimulateArrival = (destinationName: string) => {
    showToast(
      'success',
      'Trusted Circle Auto Check-In Fired',
      `Quiet arrival message delivered to Mom & Priya: "Reached ${destinationName} safely."`
    );
  };

  // Share Live Beacon link simulation
  const handleShareLiveBeacon = () => {
    const beaconUrl = `https://raksha.safecity.app/beacon?user=daksh&dest=${encodeURIComponent(activeDestinationName)}&score=94`;
    navigator.clipboard?.writeText?.(beaconUrl);
    showToast(
      'success',
      'Live Safety Beacon Link Copied',
      'Your real-time arrival status and encrypted safety trail link is ready to share with family.'
    );
  };

  // Inspector handlers
  const handleSelectZone = (zone: CityZone) => {
    setInspectedZone(zone);
    setInspectedPOI(null);
    setInspectedUnderpass(null);
  };

  const handleSelectPOI = (poi: POIItem) => {
    setInspectedPOI(poi);
    setInspectedZone(null);
    setInspectedUnderpass(null);
  };

  const handleSelectUnderpass = (underpass: UnderpassAlert) => {
    setInspectedUnderpass(underpass);
    setInspectedZone(null);
    setInspectedPOI(null);
  };

  const closeInspector = () => {
    setInspectedZone(null);
    setInspectedPOI(null);
    setInspectedUnderpass(null);
  };

  // Trusted Contact Management
  const handleAddContact = (newContact: Omit<TrustedContact, 'id'>) => {
    const contact: TrustedContact = {
      ...newContact,
      id: `tc-${Date.now()}`,
    };
    setTrustedContacts((prev) => [...prev, contact]);
    showToast('success', 'Contact Added', `${contact.name} added to your Trusted Circle.`);
  };

  const handleRemoveContact = (id: string) => {
    setTrustedContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleNotification = (id: string) => {
    setTrustedContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notifyOnArrival: !c.notifyOnArrival } : c))
    );
  };

  const handleTestCheckIn = (contactName: string) => {
    showToast(
      'success',
      'Silent Check-In Test',
      `Simulated discrete arrival notification sent to ${contactName}.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-300">
      
      {/* Top Header */}
      <Header
        currentCityId={currentCityId}
        onCityChange={(cityId) => {
          setCurrentCityId(cityId);
          showToast('ai', 'City Switched', `Switched map perspective to ${cityId.toUpperCase()}`);
        }}
        currentHour={currentHour}
        onHourChange={setCurrentHour}
        weather={weather}
        onWeatherChange={handleWeatherChange}
        onOpenFlagModal={() => setIsFlagModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenTrustedCircle={() => setIsTrustedCircleOpen(true)}
        onOpenInsights={() => setIsInsightsOpen(true)}
        onOpenAICapstone={() => setIsAICapstoneOpen(true)}
        onToggleRoutePlanner={() => setIsRoutePlannerOpen(!isRoutePlannerOpen)}
        isRoutePlannerOpen={isRoutePlannerOpen}
        activeSignalsCount={communitySignals.length}
      />

      {/* Monsoon Underpass Alert Banner */}
      <FloodAlertBanner
        underpasses={underpasses}
        isMonsoon={weather === 'monsoon_downpour'}
        onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
        onSelectUnderpass={handleSelectUnderpass}
      />

      {/* 6 Preference Mode Layer Selector */}
      <LayerSelector
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        showLightingOverlay={showLightingOverlay}
        onToggleLighting={() => setShowLightingOverlay(!showLightingOverlay)}
        showFloodOverlay={showFloodOverlay}
        onToggleFlood={() => setShowFloodOverlay(!showFloodOverlay)}
        poiCounts={poiCounts}
        currentHour={currentHour}
      />

      {/* Main Map Engine Stage */}
      <main className="flex-1 relative flex flex-col">
        <MapEngine
          currentCity={currentCity}
          zones={zones}
          pois={pois}
          underpasses={underpasses}
          currentHour={currentHour}
          weather={weather}
          communitySignals={communitySignals}
          activeMode={activeMode}
          showLightingOverlay={showLightingOverlay}
          showFloodOverlay={showFloodOverlay}
          selectedRoute={selectedRoute}
          mapTheme={mapTheme}
          onSelectMapTheme={setMapTheme}
          isPinDropMode={isPinDropMode}
          onTogglePinDropMode={() => {
            const next = !isPinDropMode;
            setIsPinDropMode(next);
            if (next) {
              showToast('ai', 'Pin Drop Active', 'Click anywhere on the map to set a custom destination.');
            }
          }}
          customDestination={customDestination}
          onMapClick={handleMapClick}
          onSelectZone={handleSelectZone}
          onSelectPOI={handleSelectPOI}
          onSelectUnderpass={handleSelectUnderpass}
          onOpenCustomAPIModal={() => setIsCustomAPIModalOpen(true)}
          onOpenAddDestinationModal={() => setIsAddDestinationModalOpen(true)}
          onShareLiveBeacon={handleShareLiveBeacon}
        />

        {/* Route Planner Expandable Tray */}
        {isRoutePlannerOpen && (
          <RoutePlanner
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={(route) => {
              setSelectedRoute(route);
              showToast('ai', 'Route Selected', `${route.title}: Safety Score ${route.safetyScore}/100`);
            }}
            onClose={() => setIsRoutePlannerOpen(false)}
            onSimulateArrival={handleSimulateArrival}
            currentDestinationName={activeDestinationName}
            onOpenAddDestinationModal={() => setIsAddDestinationModalOpen(true)}
          />
        )}
      </main>

      {/* Inspector Bottom Drawer (Zone / POI / Underpass) */}
      <ZoneDetailsSheet
        zone={inspectedZone}
        poi={inspectedPOI}
        underpass={inspectedUnderpass}
        currentHour={currentHour}
        weather={weather}
        communitySignals={communitySignals}
        onClose={closeInspector}
        onOpenFlagModal={() => {
          closeInspector();
          setIsFlagModalOpen(true);
        }}
        onSelectRouteWithDestination={(coords, name) => {
          handleSelectDestination({ name, coordinates: coords });
        }}
      />

      {/* Destination Selection & Creation Modal */}
      <AddDestinationModal
        isOpen={isAddDestinationModalOpen}
        onClose={() => setIsAddDestinationModalOpen(false)}
        onSelectDestination={handleSelectDestination}
        onSaveCustomDestination={(dest) => {
          setCustomSavedDestinations((prev) => [dest, ...prev]);
        }}
        customSavedDestinations={customSavedDestinations}
      />

      {/* Custom Routing API & Engine Configuration Modal */}
      <CustomAPIModal
        isOpen={isCustomAPIModalOpen}
        onClose={() => setIsCustomAPIModalOpen(false)}
        onSaveConfig={(cfg) => {
          showToast('success', 'Custom API Saved', `Configured ${cfg.provider.toUpperCase()} as active routing provider.`);
        }}
      />

      {/* Silent Community Flag Modal */}
      <SilentFlagModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        zones={zones}
        onSubmitSignal={handleSubmitSignal}
      />

      {/* Emergency Assistance Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        hospitals={pois.filter((p) => p.hasEmergencyDepartment || p.category === 'emergency')}
        pharmacies={pois.filter((p) => p.subType.includes('Pharmacy'))}
        trustedContacts={trustedContacts}
      />

      {/* Trusted Circle Modal */}
      <TrustedCircleModal
        isOpen={isTrustedCircleOpen}
        onClose={() => setIsTrustedCircleOpen(false)}
        contacts={trustedContacts}
        onAddContact={handleAddContact}
        onRemoveContact={handleRemoveContact}
        onToggleNotification={handleToggleNotification}
        onTestCheckIn={handleTestCheckIn}
      />

      {/* Personal Safety Insights Modal */}
      <InsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        insights={INITIAL_USER_INSIGHTS}
      />

      {/* CBSE AI Capstone Specification Modal */}
      <AIEngineModal
        isOpen={isAICapstoneOpen}
        onClose={() => setIsAICapstoneOpen(false)}
        zones={zones}
      />

      {/* Floating Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom duration-200">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex items-start gap-3 backdrop-blur-xl">
            <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0 mt-0.5">
              {toastMessage.type === 'ai' ? (
                <Sparkles className="w-4 h-4 text-sky-400" />
              ) : toastMessage.type === 'alert' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 pr-2">
              <h5 className="font-bold text-xs text-white">
                {toastMessage.title}
              </h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {toastMessage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <footer className="bg-slate-950 border-t border-slate-900 px-4 py-2.5 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 font-display">RAKSHA</span>
          <span>·</span>
          <span>CBSE Class 12 AI Capstone Project 2025–26</span>
          <span>·</span>
          <span className="text-slate-400">SDG 3, 5, 11, 16</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAICapstoneOpen(true)}
            className="hover:text-sky-400 transition-colors underline underline-offset-2"
          >
            AI Architecture Spec
          </button>
          <span>·</span>
          <button
            onClick={() => setIsInsightsOpen(true)}
            className="hover:text-sky-400 transition-colors underline underline-offset-2"
          >
            Personal Movement Insights
          </button>
        </div>
      </footer>

    </div>
  );
}
