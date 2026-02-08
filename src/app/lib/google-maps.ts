/**
 * Load Google Maps JavaScript API and Places library.
 * Use VITE_GOOGLE_MAPS_API_KEY in .env for the API key.
 */
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';
const PLACES_SCRIPT_ID = 'google-places-script';

declare global {
  interface Window {
    __googleMapsLoaded?: () => void;
    __googleMapsReject?: (err: Error) => void;
    google?: typeof google;
  }
}

let loadPromise: Promise<void> | null = null;

export function getGoogleMapsApiKey(): string {
  return (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';
}

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not set (VITE_GOOGLE_MAPS_API_KEY)'));
  }
  if (typeof window === 'undefined') return Promise.reject(new Error('Window is undefined'));
  if (window.google?.maps?.places) return Promise.resolve();

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existing) {
      if (window.google?.maps?.places) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Maps script failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    const callbackName = `__googleMapsInit_${Date.now()}`;
    (window as unknown as Record<string, () => void>)[callbackName] = () => {
      if (window.google?.maps?.places) resolve();
      else reject(new Error('Google Maps Places not available'));
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps?.places) resolve();
    };
    script.onerror = () => reject(new Error('Google Maps script failed to load'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.google?.maps?.places;
}
