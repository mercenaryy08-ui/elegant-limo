import { getMapboxAccessToken } from './mapbox-config';

/**
 * Get distance (km) and duration (minutes) between two points.
 * Uses Google Directions API when available; otherwise fallback estimate.
 */
export interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
  routePoints?: { lat: number; lng: number }[];
  geoJson?: unknown; // raw GeoJSON geometry from OSRM for L.geoJSON()
}

const FALLBACK_KM_PER_DEGREE = 111; // rough

export function estimateRouteFromLatLon(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): RouteInfo {
  const dLat = (to.lat - from.lat) * (Math.PI / 180);
  const dLng = (to.lng - from.lng) * (Math.PI / 180) * Math.cos((from.lat * Math.PI) / 180);
  const km = Math.sqrt(dLat * dLat + dLng * dLng) * FALLBACK_KM_PER_DEGREE;
  const durationMinutes = Math.max(30, Math.ceil((km / 60) * 60) + 15);
  return { distanceKm: Math.round(km * 10) / 10, durationMinutes };
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
const MAPBOX_DIRECTIONS_BASE = 'https://api.mapbox.com/directions/v5/mapbox/driving';

/**
 * Fetch road route geometry and distance/duration from OSRM (free, no API key).
 * Coordinates: lon,lat;lon,lat (OSRM order, no encoding of the path).
 */
export function fetchOsrmRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<RouteInfo> {
  const path = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `${OSRM_BASE}/${path}?overview=full&geometries=geojson`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.code !== 'Ok' || !data.routes?.[0]) {
        const fallback = estimateRouteFromLatLon(from, to);
        return { ...fallback, routePoints: [from, to] };
      }
      const route = data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.max(30, Math.ceil(route.duration / 60) + 15);
      const routePoints: { lat: number; lng: number }[] =
        route.geometry?.coordinates?.map((c: [number, number]) => ({ lng: c[0], lat: c[1] })) ?? [
          from,
          to,
        ];
      return { distanceKm, durationMinutes, routePoints, geoJson: route.geometry };
    })
    .catch(() => {
      const fallback = estimateRouteFromLatLon(from, to);
      return { ...fallback, routePoints: [from, to] };
    });
}

/**
 * Preferred route fetcher:
 * - Uses Mapbox Directions API when VITE_MAPBOX_ACCESS_TOKEN is set
 * - Falls back to OSRM (and then simple haversine estimate) when Mapbox is unavailable
 */
export function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<RouteInfo> {
  const token = getMapboxAccessToken();
  if (!token) {
    return fetchOsrmRoute(from, to);
  }

  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const params = new URLSearchParams({
    access_token: token,
    alternatives: 'false',
    geometries: 'geojson',
    overview: 'full',
  });
  const url = `${MAPBOX_DIRECTIONS_BASE}/${coords}?${params.toString()}`;

  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Mapbox directions request failed');
      }
      return res.json();
    })
    .then((data) => {
      if (!data.routes || !data.routes[0]) {
        throw new Error('Mapbox directions: no routes in response');
      }
      const route = data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.max(30, Math.ceil(route.duration / 60) + 15);
      const coordinates: [number, number][] = route.geometry?.coordinates ?? [];
      const routePoints =
        coordinates.length > 0
          ? coordinates.map((c) => ({ lng: c[0], lat: c[1] }))
          : [from, to];
      return {
        distanceKm,
        durationMinutes,
        routePoints,
        geoJson: route.geometry,
      };
    })
    .catch(() => fetchOsrmRoute(from, to));
}

let directionsPromise: Promise<RouteInfo> | null = null;

export function fetchRouteDirections(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<RouteInfo> {
  if (typeof window === 'undefined' || !window.google?.maps) {
    return fetchOsrmRoute(from, to);
  }
  const service = new window.google.maps.DirectionsService();
  return new Promise((resolve) => {
    service.route(
      {
        origin: from,
        destination: to,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result?.routes?.[0]) {
          const leg = result.routes[0].legs[0];
          const distanceKm = (leg?.distance?.value ?? 0) / 1000;
          const durationMinutes = Math.ceil((leg?.duration?.value ?? 0) / 60) + 15;
          resolve({ distanceKm, durationMinutes });
        } else {
          fetchOsrmRoute(from, to).then(resolve);
        }
      }
    );
  });
}
