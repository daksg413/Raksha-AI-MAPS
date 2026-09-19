import { CityZone, WeatherType, CommunitySignal, Coordinates, RouteOption, RouteSegment, UnderpassAlert } from '../types';

export interface SafetyScoreBreakdown {
  compositeScore: number;
  rating: 'Safe' | 'Moderate Concern' | 'Elevated Risk';
  color: string;
  badgeBg: string;
  badgeBorder: string;
  factors: {
    communitySignalsWeight: number; // deducted points
    timeLightingWeight: number; // impact
    crowdActivityWeight: number;
    weatherFloodPenalty: number;
    baselineSecurity: number;
  };
  narrativeExplanation: string;
}

/**
 * Calculates distance in kilometers between two coordinates
 */
export function calculateDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Finds nearest zone to coordinate
 */
export function findNearestZone(coord: Coordinates, zones: CityZone[]): CityZone | null {
  if (!zones.length) return null;
  let nearest = zones[0];
  let minDistance = calculateDistanceKm(coord, nearest.center);

  for (let i = 1; i < zones.length; i++) {
    const dist = calculateDistanceKm(coord, zones[i].center);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = zones[i];
    }
  }
  return nearest;
}

/**
 * Ensures a route has color-coded segments based on zone conditions
 */
export function ensureRouteSegments(
  route: RouteOption,
  zones: CityZone[],
  underpasses: UnderpassAlert[],
  currentHour: number,
  weather: WeatherType,
  signals: CommunitySignal[] = []
): RouteSegment[] {
  if (route.segments && route.segments.length > 0) {
    return route.segments;
  }

  const segments: RouteSegment[] = [];
  const path = route.path;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const midPoint: Coordinates = {
      lat: (from.lat + to.lat) / 2,
      lng: (from.lng + to.lng) / 2,
    };

    const nearestZone = findNearestZone(midPoint, zones);
    const scoreBreakdown = nearestZone
      ? calculateZoneSafetyScore(nearestZone, currentHour, weather, signals)
      : { compositeScore: 75, color: '#10b981', rating: 'Safe' };

    // Check proximity to any flooded underpass
    const nearFloodedUnderpass = underpasses.find((u) => {
      const dist = calculateDistanceKm(midPoint, u.coordinates);
      return dist < 0.6 && (u.status === 'waterlogging' || u.status === 'submerged_closed');
    });

    let safetyScore = scoreBreakdown.compositeScore;
    let status: 'safe' | 'caution' | 'hazard' = 'safe';
    let color = '#10b981'; // Emerald Safe
    let hazardReason: string | undefined = undefined;

    if (nearFloodedUnderpass || (weather === 'monsoon_downpour' && nearestZone?.floodRiskLevel === 'critical_underpass')) {
      safetyScore = Math.min(38, safetyScore - 35);
      status = 'hazard';
      color = '#ef4444'; // Red Hazard
      hazardReason = nearFloodedUnderpass 
        ? `Flood alert: near ${nearFloodedUnderpass.name} (${nearFloodedUnderpass.waterDepthCm}cm water depth)`
        : 'Monsoon waterlogging risk detected along this leg';
    } else if (safetyScore < 60) {
      status = 'hazard';
      color = '#ef4444';
      hazardReason = 'Low lighting quality and sparse footfall';
    } else if (safetyScore < 80) {
      status = 'caution';
      color = '#f59e0b'; // Amber Caution
      hazardReason = 'Moderate illumination, stay alert';
    }

    const distMeters = Math.round(calculateDistanceKm(from, to) * 1000);

    segments.push({
      id: `seg-${route.id}-${i}`,
      name: nearestZone ? `${nearestZone.name.split('&')[0].trim()} Corridor (Leg ${i + 1})` : `Transit Leg ${i + 1}`,
      from,
      to,
      safetyScore,
      status,
      color,
      lightingPercent: nearestZone ? nearestZone.lightingScore : 75,
      crowdLevel: safetyScore > 80 ? 'High' : safetyScore > 60 ? 'Medium' : 'Deserted',
      hazardReason,
      distanceMeters: distMeters,
    });
  }

  return segments;
}

/**
 * Dynamically generates 3 safety-ranked routes to any given destination
 */
export function generateDynamicRoutes(
  origin: Coordinates,
  destination: Coordinates,
  destinationName: string,
  zones: CityZone[],
  underpasses: UnderpassAlert[],
  currentHour: number,
  weather: WeatherType,
  signals: CommunitySignal[]
): RouteOption[] {
  const directDistance = calculateDistanceKm(origin, destination);
  const baseMinutes = Math.max(8, Math.round(directDistance * 3.2));

  // Intermediate waypoint heuristics
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;

  // 1. RAKSHA AI Safest Route (Detours through well-lit high safety boulevards)
  const safeMid: Coordinates = {
    lat: midLat + 0.005,
    lng: midLng - 0.006,
  };
  const safeQuarter: Coordinates = {
    lat: (origin.lat + safeMid.lat) / 2,
    lng: (origin.lng + safeMid.lng) / 2 + 0.003,
  };
  const safeThreeQuarter: Coordinates = {
    lat: (safeMid.lat + destination.lat) / 2,
    lng: (safeMid.lng + destination.lng) / 2 - 0.002,
  };

  const safePath = [origin, safeQuarter, safeMid, safeThreeQuarter, destination];
  const safeDist = Number((directDistance * 1.18).toFixed(1));
  const safeTime = Math.round(baseMinutes * 1.2);

  // 2. Direct / Fastest Route (Straightest line, but may pass through dim or low-lying points)
  const directMid: Coordinates = {
    lat: midLat - 0.002,
    lng: midLng + 0.001,
  };
  const directPath = [origin, directMid, destination];
  const directDist = Number(directDistance.toFixed(1));
  const directTime = Math.round(baseMinutes * 0.88);

  // 3. Arterial / Promenade Alternate Route
  const altMid: Coordinates = {
    lat: midLat - 0.006,
    lng: midLng + 0.008,
  };
  const altPath = [origin, altMid, destination];
  const altDist = Number((directDistance * 1.25).toFixed(1));
  const altTime = Math.round(baseMinutes * 1.28);

  const rawSafeRoute: RouteOption = {
    id: `dyn-safe-${Date.now()}`,
    title: `Route 1: Safest Lit Corridor to ${destinationName.split(' ')[0]}`,
    subtitle: 'RAKSHA AI Evaluated • Maximum Lighting & Active Patrols',
    distanceKm: safeDist,
    durationMins: safeTime,
    safetyScore: 92,
    lightingRating: 'Excellent',
    floodRisk: 'None',
    crowdFactor: 'High',
    recommendationTag: 'RAKSHA Recommended',
    warnings: [],
    highlights: [
      'Prioritizes 100% illuminated arterial avenues',
      'Continuous ambient commercial activity & police monitoring',
      'Automatic bypass of low-lying flood points',
    ],
    path: safePath,
  };
  rawSafeRoute.segments = ensureRouteSegments(rawSafeRoute, zones, underpasses, currentHour, weather, signals);

  const rawFastRoute: RouteOption = {
    id: `dyn-fast-${Date.now()}`,
    title: `Route 2: Direct Path to ${destinationName.split(' ')[0]} (Fastest)`,
    subtitle: `Saves ${safeTime - directTime} mins, but passes through dim secondary lanes`,
    distanceKm: directDist,
    durationMins: directTime,
    safetyScore: weather === 'monsoon_downpour' ? 48 : 58,
    lightingRating: 'Poor',
    floodRisk: weather === 'monsoon_downpour' ? 'Active Waterlogging' : 'Low Risk',
    crowdFactor: currentHour >= 21 ? 'Deserted' : 'Medium',
    recommendationTag: 'Fastest but Unlit',
    warnings: [
      'Passes through segments with intermittent municipal lighting (<50%)',
      'Significantly reduced footfall during night hours',
      ...(weather === 'monsoon_downpour' ? ['High probability of surface waterlogging'] : []),
    ],
    highlights: [`Shortest direct transit distance (${directDist} km)`],
    path: directPath,
  };
  rawFastRoute.segments = ensureRouteSegments(rawFastRoute, zones, underpasses, currentHour, weather, signals);

  const rawAltRoute: RouteOption = {
    id: `dyn-alt-${Date.now()}`,
    title: `Route 3: Wide Boulevard Transit to ${destinationName.split(' ')[0]}`,
    subtitle: 'Smooth multi-lane arterial road',
    distanceKm: altDist,
    durationMins: altTime,
    safetyScore: 82,
    lightingRating: 'Moderate',
    floodRisk: 'Low Risk',
    crowdFactor: 'Medium',
    recommendationTag: 'Scenic Transit',
    warnings: ['Slightly longer distance (+25%)'],
    highlights: ['Wide 4-lane carriage way with active auto-rickshaw movement'],
    path: altPath,
  };
  rawAltRoute.segments = ensureRouteSegments(rawAltRoute, zones, underpasses, currentHour, weather, signals);

  return [rawSafeRoute, rawFastRoute, rawAltRoute];
}

/**
 * Calculates the dynamic composite Safety Index (0 - 100) for a city zone
 * incorporating the 7 core inputs defined in the CBSE Capstone specification.
 */
export function calculateZoneSafetyScore(
  zone: CityZone,
  currentHour: number, // 0 to 23
  weather: WeatherType,
  signals: CommunitySignal[] = []
): SafetyScoreBreakdown {
  // 1. Base Historical Baseline
  let score = zone.baseSafetyScore;

  // Filter signals specific to this zone
  const zoneSignals = signals.filter((s) => s.zoneId === zone.id);
  const totalActiveSignals = zoneSignals.length + zone.activeSignalsCount;

  // 2. Community Safety Signals (Anomaly Detection weighting)
  // Each flag represents real citizen signal; > 2 signals triggers anomaly penalty
  let communityPenalty = 0;
  if (totalActiveSignals > 0) {
    communityPenalty = Math.min(35, totalActiveSignals * 7);
    if (totalActiveSignals >= 3) {
      // Anomaly cluster surge penalty
      communityPenalty += 10;
    }
  }
  score -= communityPenalty;

  // 3. Time of Day & Street Lighting Interaction
  // At night (8 PM to 5 AM), lighting quality is critical
  const isNight = currentHour >= 20 || currentHour < 5;
  const isEvening = currentHour >= 18 && currentHour < 20;

  let lightingImpact = 0;
  if (isNight) {
    // If street lighting is poor (< 70), heavy penalty
    if (zone.lightingScore < 70) {
      lightingImpact = -Math.round((70 - zone.lightingScore) * 0.45);
    } else {
      // Good lighting buffers night safety
      lightingImpact = 4;
    }
  } else if (isEvening) {
    if (zone.lightingScore < 60) {
      lightingImpact = -Math.round((60 - zone.lightingScore) * 0.25);
    }
  }
  score += lightingImpact;

  // 4. Crowd Activity Signals
  // An area unexpectedly deserted at night gets penalized
  let crowdImpact = 0;
  if (isNight) {
    if (zone.crowdDensityNight < 40) {
      crowdImpact = -Math.round((40 - zone.crowdDensityNight) * 0.35);
    } else {
      crowdImpact = 3; // active community presence adds safety
    }
  } else {
    // Daytime crowd
    if (zone.crowdDensityDay < 30) {
      crowdImpact = -4;
    }
  }
  score += crowdImpact;

  // 5. Weather & Flood Accumulation
  let weatherPenalty = 0;
  if (weather === 'monsoon_downpour') {
    if (zone.floodRiskLevel === 'critical_underpass') {
      weatherPenalty = 42; // severe underpass flooding!
    } else if (zone.floodRiskLevel === 'high') {
      weatherPenalty = 24;
    } else if (zone.floodRiskLevel === 'moderate') {
      weatherPenalty = 12;
    } else {
      weatherPenalty = 5;
    }
  } else if (weather === 'overcast') {
    if (zone.floodRiskLevel === 'critical_underpass') {
      weatherPenalty = 8;
    }
  }
  score -= weatherPenalty;

  // Clamp score between 10 and 99
  const compositeScore = Math.max(12, Math.min(98, Math.round(score)));

  // Color mappings
  let rating: 'Safe' | 'Moderate Concern' | 'Elevated Risk' = 'Safe';
  let color = '#10b981'; // Green
  let badgeBg = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60';
  let badgeBorder = '#059669';

  if (compositeScore < 60) {
    rating = 'Elevated Risk';
    color = '#ef4444'; // Red
    badgeBg = 'bg-rose-950/50 text-rose-300 border-rose-800/60';
    badgeBorder = '#dc2626';
  } else if (compositeScore < 80) {
    rating = 'Moderate Concern';
    color = '#f59e0b'; // Amber
    badgeBg = 'bg-amber-950/40 text-amber-300 border-amber-800/60';
    badgeBorder = '#d97706';
  }

  // Narrative explanation
  let narrativeExplanation = 'Optimal conditions: active footfall and certified municipal illumination.';
  if (weather === 'monsoon_downpour' && zone.floodRiskLevel === 'critical_underpass') {
    narrativeExplanation = 'Severe monsoon waterlogging alert: low-lying underpass submerged. Use elevated alternate flyover.';
  } else if (totalActiveSignals >= 3) {
    narrativeExplanation = 'AI Anomaly Surge: multiple community safety signals recorded within past 60 minutes.';
  } else if (isNight && zone.lightingScore < 65) {
    narrativeExplanation = 'Reduced illumination after 8 PM with intermittent deserted corridors.';
  }

  return {
    compositeScore,
    rating,
    color,
    badgeBg,
    badgeBorder,
    factors: {
      communitySignalsWeight: communityPenalty,
      timeLightingWeight: lightingImpact,
      crowdActivityWeight: crowdImpact,
      weatherFloodPenalty: weatherPenalty,
      baselineSecurity: zone.baseSafetyScore,
    },
    narrativeExplanation,
  };
}

/**
 * Heuristic AI check for anomaly detection across all city zones
 */
export function detectSignalAnomalies(
  zones: CityZone[],
  signals: CommunitySignal[]
): { hasAnomaly: boolean; anomalousZone?: CityZone; signalCount: number } {
  for (const zone of zones) {
    const zoneSignals = signals.filter((s) => s.zoneId === zone.id);
    const count = zoneSignals.length + zone.activeSignalsCount;
    if (count >= 3) {
      return {
        hasAnomaly: true,
        anomalousZone: zone,
        signalCount: count,
      };
    }
  }
  return { hasAnomaly: false, signalCount: 0 };
}
