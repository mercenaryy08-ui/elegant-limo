const SWISS_BBOX = '5.956,45.818,10.492,47.808'; // minLon,minLat,maxLon,maxLat (rough Switzerland bounds)

export const MAPBOX_SWISS_BBOX = SWISS_BBOX;

export function getMapboxAccessToken(): string {
  return (
    (import.meta as unknown as { env: Record<string, string> }).env?.VITE_MAPBOX_ACCESS_TOKEN ?? ''
  );
}

/**
 * Default Mapbox style for a clean, premium light basemap.
 * Can be overridden via VITE_MAPBOX_STYLE_ID.
 */
export function getMapboxStyleId(): string {
  return (
    (import.meta as unknown as { env: Record<string, string> }).env?.VITE_MAPBOX_STYLE_ID ||
    'mapbox/light-v11'
  );
}

export function isMapboxEnabled(): boolean {
  return !!getMapboxAccessToken();
}

