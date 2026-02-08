/**
 * Free geocoding/autocomplete via OpenStreetMap Nominatim (no API key).
 * Restricted to Switzerland (countrycodes=ch).
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const SWISS_BOUNDS = '5.956,45.818,10.492,47.808'; // rough CH bbox

export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export async function searchAddressSwitzerland(query: string): Promise<NominatimResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({
    q,
    format: 'json',
    addressdetails: '0',
    limit: '8',
    countrycodes: 'ch',
    bounded: '1',
    viewbox: SWISS_BOUNDS,
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ElegantLimoBooking/1.0 (Switzerland limousine booking)',
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
