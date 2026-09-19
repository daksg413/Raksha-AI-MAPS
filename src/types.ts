export type PreferenceMode = 
  | 'emergency'
  | 'foodie'
  | 'student'
  | 'night'
  | 'family'
  | 'fitness';

export type WeatherType = 'clear' | 'overcast' | 'monsoon_downpour';

export type FlagCategory = 'felt_unsafe' | 'suspicious' | 'flood_route_issue';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CityZone {
  id: string;
  name: string;
  city: string;
  coordinates: Coordinates[]; // polygon boundaries
  center: Coordinates;
  baseSafetyScore: number; // baseline 0 - 100
  lightingScore: number; // 0 - 100
  historicalIncidentDensity: number; // 0 - 100 (lower is better, or risk factor)
  crowdDensityDay: number; // 0 - 100
  crowdDensityNight: number; // 0 - 100
  floodRiskLevel: 'low' | 'moderate' | 'high' | 'critical_underpass';
  activeSignalsCount: number;
  description: string;
  notableAlert?: string;
}

export interface CommunitySignal {
  id: string;
  zoneId: string;
  category: FlagCategory;
  timestamp: string; // ISO or relative
  coordinates: Coordinates;
  upvotes: number;
  note: string;
}

export interface POIItem {
  id: string;
  name: string;
  category: PreferenceMode;
  subType: string;
  coordinates: Coordinates;
  address: string;
  rating: number;
  open24Hours?: boolean;
  openUntil?: string;
  hasEmergencyDepartment?: boolean;
  priceLevel?: '₹' | '₹₹' | '₹₹₹';
  description: string;
  tags: string[];
  contactNumber?: string;
}

export interface RouteSegment {
  id: string;
  name: string;
  from: Coordinates;
  to: Coordinates;
  safetyScore: number; // 0 - 100
  status: 'safe' | 'caution' | 'hazard';
  color: string; // e.g. '#10b981' for safe, '#f59e0b' for caution, '#ef4444' for hazard
  lightingPercent: number;
  crowdLevel: 'High' | 'Medium' | 'Low' | 'Deserted';
  hazardReason?: string;
  distanceMeters: number;
}

export type MapTileTheme = 'dark_tactical' | 'street_navigation' | 'satellite_hybrid' | 'lighting_heatmap';

export type RoutingPriority = 'safest_lit' | 'avoid_floods' | 'solo_commuter' | 'fastest_direct';

export interface RouteOption {
  id: string;
  title: string;
  subtitle: string;
  distanceKm: number;
  durationMins: number;
  safetyScore: number; // 0 - 100
  lightingRating: 'Excellent' | 'Moderate' | 'Poor';
  floodRisk: 'None' | 'Low Risk' | 'Flooded Underpass Avoided' | 'Active Waterlogging';
  crowdFactor: 'High' | 'Medium' | 'Deserted';
  path: Coordinates[];
  segments?: RouteSegment[];
  recommendationTag?: 'RAKSHA Recommended' | 'Fastest but Unlit' | 'Scenic Transit' | 'Custom Route';
  warnings: string[];
  highlights: string[];
}

export interface CustomDestination {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates: Coordinates;
  isCustom?: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notifyOnArrival: boolean;
}

export interface UnderpassAlert {
  id: string;
  name: string;
  coordinates: Coordinates;
  status: 'clear' | 'waterlogging' | 'submerged_closed';
  waterDepthCm: number;
  lastUpdated: string;
  trafficDivertedTo: string;
}

export interface MonthlyUserInsight {
  totalKmProtected: number;
  signalsContributed: number;
  saferAlternativeTakenCount: number;
  averageRouteSafetyScore: number;
  mostFrequentRoute: {
    origin: string;
    destination: string;
    daySafety: number;
    nightSafety: number;
  };
  recommendations: string[];
}
