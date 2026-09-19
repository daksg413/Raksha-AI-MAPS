import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  CityZone, 
  POIItem, 
  RouteOption, 
  UnderpassAlert, 
  WeatherType, 
  CommunitySignal,
  PreferenceMode,
  MapTileTheme,
  Coordinates
} from '../types';
import { calculateZoneSafetyScore, ensureRouteSegments } from '../services/safetyEngine';
import { CityConfig } from '../data/mockCityData';
import { MapOptionsPanel } from './MapOptionsPanel';

interface MapEngineProps {
  currentCity: CityConfig;
  zones: CityZone[];
  pois: POIItem[];
  underpasses: UnderpassAlert[];
  currentHour: number;
  weather: WeatherType;
  communitySignals: CommunitySignal[];
  activeMode: PreferenceMode;
  showLightingOverlay: boolean;
  showFloodOverlay: boolean;
  selectedRoute: RouteOption | null;
  mapTheme: MapTileTheme;
  onSelectMapTheme: (theme: MapTileTheme) => void;
  isPinDropMode: boolean;
  onTogglePinDropMode: () => void;
  customDestination: { name: string; coordinates: Coordinates } | null;
  onMapClick: (coords: Coordinates) => void;
  onSelectZone: (zone: CityZone) => void;
  onSelectPOI: (poi: POIItem) => void;
  onSelectUnderpass: (underpass: UnderpassAlert) => void;
  onOpenCustomAPIModal: () => void;
  onOpenAddDestinationModal: () => void;
  onShareLiveBeacon: () => void;
}

export const MapEngine: React.FC<MapEngineProps> = ({
  currentCity,
  zones,
  pois,
  underpasses,
  currentHour,
  weather,
  communitySignals,
  activeMode,
  showLightingOverlay,
  showFloodOverlay,
  selectedRoute,
  mapTheme,
  onSelectMapTheme,
  isPinDropMode,
  onTogglePinDropMode,
  customDestination,
  onMapClick,
  onSelectZone,
  onSelectPOI,
  onSelectUnderpass,
  onOpenCustomAPIModal,
  onOpenAddDestinationModal,
  onShareLiveBeacon,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCity.center.lat, currentCity.center.lng],
        zoom: currentCity.zoom,
        zoomControl: false,
        attributionControl: true,
      });

      // Default Dark Tactical Tile Layer
      const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO | RAKSHA Safety',
      }).addTo(map);
      tileLayerRef.current = tile;

      // Custom positioned zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Map Click listener for dynamic destination placement
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    return () => {
      // Do not destroy on every render, cleanup on actual unmount
    };
  }, []);

  // Update Tile Layer when mapTheme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

    if (mapTheme === 'street_navigation') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png';
    } else if (mapTheme === 'satellite_hybrid') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye';
    } else if (mapTheme === 'lighting_heatmap') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png';
    }

    const newTileLayer = L.tileLayer(url, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [mapTheme]);

  // Update map center when city changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [currentCity.center.lat, currentCity.center.lng],
        currentCity.zoom,
        { animate: true }
      );
    }
  }, [currentCity]);

  // Re-render Dynamic Layers when state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous dynamic layers
    layerGroup.clearLayers();

    // 1. Render Zone Polygons with Dynamic Safety Index
    zones.forEach((zone) => {
      const scoreData = calculateZoneSafetyScore(zone, currentHour, weather, communitySignals);
      const polygonCoords = zone.coordinates.map((c) => [c.lat, c.lng] as [number, number]);

      // Dynamic styling based on composite score
      const fillColor = scoreData.color;
      const fillOpacity = weather === 'monsoon_downpour' && zone.floodRiskLevel === 'critical_underpass' 
        ? 0.52 
        : mapTheme === 'satellite_hybrid' ? 0.22 : 0.28;

      const polygon = L.polygon(polygonCoords, {
        color: fillColor,
        weight: 2,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        dashArray: zone.activeSignalsCount > 0 ? '6, 6' : undefined,
      });

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectZone(zone);
      });

      polygon.bindTooltip(
        `<div class="text-xs p-1 font-sans">
          <div class="font-bold flex items-center gap-1.5">
            <span style="color:${fillColor}">●</span> ${zone.name}
          </div>
          <div class="text-slate-300 mt-0.5">Safety Index: <strong style="color:${fillColor}">${scoreData.compositeScore}/100</strong> (${scoreData.rating})</div>
          ${zone.activeSignalsCount > 0 ? `<div class="text-amber-400 font-semibold text-[10px] mt-1">⚠️ ${zone.activeSignalsCount} community flags active</div>` : ''}
          ${weather === 'monsoon_downpour' && zone.floodRiskLevel === 'critical_underpass' ? `<div class="text-rose-400 font-semibold text-[10px] mt-1">🌊 Underpass waterlogged</div>` : ''}
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      layerGroup.addLayer(polygon);

      // Zone Center Label Badge
      const zoneBadgeIcon = L.divIcon({
        className: 'custom-zone-badge',
        html: `
          <div class="cursor-pointer -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-lg border backdrop-blur-md flex items-center gap-1 text-white select-none transition-transform hover:scale-110"
               style="background-color: ${fillColor}22; border-color: ${fillColor}; color: #f8fafc;">
            <span class="w-2 h-2 rounded-full" style="background-color: ${fillColor};"></span>
            <span>${zone.name.split('&')[0].trim()}</span>
            <span class="px-1 py-0.1 text-[10px] rounded font-mono font-bold" style="background-color: ${fillColor}; color: #000;">
              ${scoreData.compositeScore}
            </span>
          </div>
        `,
        iconSize: [0, 0],
      });

      const centerMarker = L.marker([zone.center.lat, zone.center.lng], {
        icon: zoneBadgeIcon,
      });
      centerMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectZone(zone);
      });
      layerGroup.addLayer(centerMarker);
    });

    // 2. Lighting / Lux Heat Halos (if overlay active or in heatmap mode)
    if (showLightingOverlay || mapTheme === 'lighting_heatmap') {
      zones.forEach((zone) => {
        const isNight = currentHour >= 20 || currentHour < 5;
        const radius = isNight ? 380 + (zone.lightingScore * 4) : 250;
        const haloColor = zone.lightingScore > 80 ? '#38bdf8' : zone.lightingScore > 60 ? '#facc15' : '#fb7185';
        
        const lightCircle = L.circle([zone.center.lat, zone.center.lng], {
          radius: radius,
          color: haloColor,
          weight: 1,
          opacity: 0.25,
          fillColor: haloColor,
          fillOpacity: mapTheme === 'lighting_heatmap' ? 0.35 : 0.12,
        });
        layerGroup.addLayer(lightCircle);
      });
    }

    // 3. Flood & Underpass Sensors
    if (showFloodOverlay || weather === 'monsoon_downpour') {
      underpasses.forEach((underpass) => {
        const isFlooded = underpass.status === 'waterlogging' || underpass.status === 'submerged_closed';
        const markerColor = isFlooded ? '#ef4444' : '#0ea5e9';

        const underpassIcon = L.divIcon({
          className: 'underpass-marker',
          html: `
            <div class="cursor-pointer -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg shadow-xl border text-[11px] font-bold select-none ${
              isFlooded ? 'bg-rose-950/90 text-rose-200 border-rose-500 animate-pulse' : 'bg-slate-900/90 text-sky-300 border-sky-500'
            }">
              <span>🌊</span>
              <span>${underpass.name.split('(')[0].trim()}</span>
              <span class="px-1 py-0.2 rounded font-mono text-[10px] ${isFlooded ? 'bg-rose-600 text-white' : 'bg-slate-800 text-sky-400'}">
                ${underpass.waterDepthCm}cm
              </span>
            </div>
          `,
          iconSize: [0, 0],
        });

        const underpassMarker = L.marker([underpass.coordinates.lat, underpass.coordinates.lng], {
          icon: underpassIcon,
        });
        underpassMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectUnderpass(underpass);
        });
        layerGroup.addLayer(underpassMarker);

        // Water ripple perimeter circle if flooded
        if (isFlooded) {
          const floodCircle = L.circle([underpass.coordinates.lat, underpass.coordinates.lng], {
            radius: 360,
            color: '#ef4444',
            weight: 2,
            opacity: 0.6,
            fillColor: '#ef4444',
            fillOpacity: 0.2,
            dashArray: '4, 4',
          });
          layerGroup.addLayer(floodCircle);
        }
      });
    }

    // 4. Points of Interest (POIs) based on Active Preference Mode
    const filteredPois = pois.filter((poi) => {
      if (activeMode === 'emergency') return poi.category === 'emergency' || poi.open24Hours;
      if (activeMode === 'night') return poi.category === 'night' || poi.open24Hours;
      return poi.category === activeMode;
    });

    filteredPois.forEach((poi) => {
      let iconSymbol = '📍';
      let borderCol = '#38bdf8';

      if (poi.category === 'emergency') {
        iconSymbol = '🏥';
        borderCol = '#ef4444';
      } else if (poi.category === 'foodie') {
        iconSymbol = '🍲';
        borderCol = '#f59e0b';
      } else if (poi.category === 'student') {
        iconSymbol = '📚';
        borderCol = '#8b5cf6';
      } else if (poi.category === 'night') {
        iconSymbol = '🌙';
        borderCol = '#38bdf8';
      } else if (poi.category === 'family') {
        iconSymbol = '🌳';
        borderCol = '#ec4899';
      } else if (poi.category === 'fitness') {
        iconSymbol = '🏃';
        borderCol = '#10b981';
      }

      const poiIcon = L.divIcon({
        className: 'poi-custom-marker',
        html: `
          <div class="cursor-pointer -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 text-sm text-white transition-transform hover:scale-125"
               style="background-color: #0f172a; border-color: ${borderCol}; box-shadow: 0 0 10px ${borderCol}66;">
            <span>${iconSymbol}</span>
            ${poi.open24Hours ? `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-900 text-[8px] flex items-center justify-center font-bold">24</span>` : ''}
          </div>
        `,
        iconSize: [0, 0],
      });

      const poiMarker = L.marker([poi.coordinates.lat, poi.coordinates.lng], {
        icon: poiIcon,
      });

      poiMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectPOI(poi);
      });
      layerGroup.addLayer(poiMarker);
    });

    // 5. COLOR-CODED ROUTE SEGMENTS MAP RENDERING
    if (selectedRoute) {
      const segments = ensureRouteSegments(
        selectedRoute,
        zones,
        underpasses,
        currentHour,
        weather,
        communitySignals
      );

      // Render each individual segment with its distinct safety color
      segments.forEach((seg, idx) => {
        const segCoords: [number, number][] = [
          [seg.from.lat, seg.from.lng],
          [seg.to.lat, seg.to.lng],
        ];

        // Glowing backdrop polyline for segment
        const segGlow = L.polyline(segCoords, {
          color: seg.color,
          weight: 10,
          opacity: 0.38,
        });
        layerGroup.addLayer(segGlow);

        // Core polyline for segment with solid or dashed styling
        const segLine = L.polyline(segCoords, {
          color: seg.color,
          weight: 5,
          opacity: 0.95,
          dashArray: seg.status === 'hazard' ? '6, 6' : undefined,
        });

        segLine.bindTooltip(
          `<div class="text-xs p-1 font-sans">
            <div class="font-bold flex items-center gap-1.5" style="color: ${seg.color}">
              <span>●</span> ${seg.name}
            </div>
            <div class="text-slate-300 mt-1 flex items-center justify-between gap-3 text-[11px]">
              <span>Safety Score: <strong style="color: ${seg.color}">${seg.safetyScore}/100</strong> (${seg.status.toUpperCase()})</span>
              <span>${seg.distanceMeters}m</span>
            </div>
            <div class="text-slate-400 text-[10px] mt-0.5">
              💡 Illumination: ${seg.lightingPercent}% • Crowd: ${seg.crowdLevel}
            </div>
            ${seg.hazardReason ? `<div class="mt-1 text-rose-300 bg-rose-950/80 p-1 rounded border border-rose-800 text-[10px] font-semibold">⚠️ ${seg.hazardReason}</div>` : ''}
          </div>`,
          { sticky: true, opacity: 0.95 }
        );

        layerGroup.addLayer(segLine);

        // If this segment is a hazard, put an alert marker icon at the midpoint!
        if (seg.status === 'hazard') {
          const midLat = (seg.from.lat + seg.to.lat) / 2;
          const midLng = (seg.from.lng + seg.to.lng) / 2;
          const hazardIcon = L.divIcon({
            className: 'seg-hazard-icon',
            html: `
              <div class="-translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-rose-600/50 border border-white animate-bounce">
                ⚠️
              </div>
            `,
            iconSize: [0, 0],
          });
          const hazardMarker = L.marker([midLat, midLng], { icon: hazardIcon });
          hazardMarker.bindTooltip(
            `<div class="text-xs text-rose-300 font-bold p-1 bg-rose-950/90 rounded border border-rose-700">
              ⚠️ Hazard Segment: ${seg.hazardReason || 'Low lighting / waterlogging alert'}
            </div>`
          );
          layerGroup.addLayer(hazardMarker);
        }
      });

      // Origin Marker (Start)
      const origin = selectedRoute.path[0];
      const originIcon = L.divIcon({
        className: 'origin-marker',
        html: `
          <div class="-translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xl flex items-center gap-1 border-2 border-white">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>Start</span>
          </div>
        `,
        iconSize: [0, 0],
      });
      layerGroup.addLayer(L.marker([origin.lat, origin.lng], { icon: originIcon }));

      // Destination Marker (Finish)
      const dest = selectedRoute.path[selectedRoute.path.length - 1];
      const destIcon = L.divIcon({
        className: 'dest-marker',
        html: `
          <div class="-translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-sky-600 text-white font-bold text-[10px] shadow-xl flex items-center gap-1 border-2 border-white">
            <span>🏁 Destination</span>
          </div>
        `,
        iconSize: [0, 0],
      });
      layerGroup.addLayer(L.marker([dest.lat, dest.lng], { icon: destIcon }));
    }

    // 6. Custom Destination Pin Marker (if user added one or clicked map)
    if (customDestination) {
      const customPinIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div class="-translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-[11px] shadow-2xl flex items-center gap-1.5 border-2 border-white">
            <span class="animate-ping w-2 h-2 rounded-full bg-white"></span>
            <span>📍 ${customDestination.name}</span>
          </div>
        `,
        iconSize: [0, 0],
      });
      layerGroup.addLayer(
        L.marker([customDestination.coordinates.lat, customDestination.coordinates.lng], {
          icon: customPinIcon,
        })
      );
    }

    // 7. User Location Marker (Pulsating Blue Dot)
    const userLocation: [number, number] = [currentCity.center.lat + 0.006, currentCity.center.lng - 0.008];
    const userLocationIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div class="w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-lg z-10"></div>
          <div class="absolute w-8 h-8 rounded-full bg-sky-400/40 animate-ping"></div>
        </div>
      `,
      iconSize: [0, 0],
    });
    layerGroup.addLayer(L.marker(userLocation, { icon: userLocationIcon }));

  }, [
    zones,
    pois,
    underpasses,
    currentHour,
    weather,
    communitySignals,
    activeMode,
    showLightingOverlay,
    showFloodOverlay,
    selectedRoute,
    mapTheme,
    customDestination,
  ]);

  // Recenter map button
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [currentCity.center.lat, currentCity.center.lng],
        currentCity.zoom,
        { animate: true }
      );
    }
  };

  return (
    <div className={`relative w-full h-[62vh] sm:h-[68vh] lg:h-[72vh] overflow-hidden bg-slate-950 ${isPinDropMode ? 'cursor-crosshair' : ''}`}>
      
      {/* Map Element */}
      <div id="map-container" ref={mapContainerRef} className="w-full h-full" />

      {/* Pin Drop Mode Floating Hint Banner */}
      {isPinDropMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border-2 border-white">
          <span>🎯</span>
          <span>Click anywhere on the map to drop Destination Pin</span>
          <button
            onClick={onTogglePinDropMode}
            className="ml-2 px-2 py-0.5 rounded bg-slate-950 text-white text-[10px] font-mono hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      )}

      {/* Floating Map Overlay Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-slate-200 text-xs shadow-xl hidden sm:block max-w-[260px]">
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Safety & Route Colors</span>
          <span className="text-[10px] text-sky-400 font-mono">LIVE MATRIX</span>
        </div>
        
        {/* Route Segment Colors */}
        <div className="space-y-1.5 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-slate-200 text-[11px] font-semibold">Green: Well-Lit Safe Leg (&gt;80)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="text-slate-300 text-[11px]">Amber: Dim / Moderate Leg (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="text-slate-300 text-[11px]">Red / Dashed: Waterlogged / Low Light</span>
          </div>
        </div>

        {weather === 'monsoon_downpour' && (
          <div className="mt-2 text-[10px] text-sky-300 flex items-center gap-1.5">
            <span className="animate-pulse">🌊</span>
            <span>Monsoon radar active: underpass tracking enabled</span>
          </div>
        )}
      </div>

      {/* Floating Top Controls: Map Options Panel & Recenter */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <MapOptionsPanel
          mapTheme={mapTheme}
          onSelectMapTheme={onSelectMapTheme}
          isPinDropMode={isPinDropMode}
          onTogglePinDropMode={onTogglePinDropMode}
          onOpenCustomAPIModal={onOpenCustomAPIModal}
          onOpenAddDestinationModal={onOpenAddDestinationModal}
          onShareLiveBeacon={onShareLiveBeacon}
        />

        <button
          onClick={handleRecenter}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 p-2.5 rounded-xl border border-slate-700/80 shadow-xl transition-transform active:scale-95 text-xs font-semibold flex items-center gap-1.5"
          title="Recenter Map to City Center"
        >
          <span>🎯</span>
          <span className="hidden sm:inline">Recenter</span>
        </button>
      </div>

    </div>
  );
};
