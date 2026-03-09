import { getMapboxAccessToken, MAPBOX_SWISS_BBOX } from './mapbox-config';

/**
 * Address autocomplete / geocoding for Switzerland.
 *
 * - Primary: Mapbox Geocoding API (when VITE_MAPBOX_ACCESS_TOKEN is set)
 * - Fallback: OpenStreetMap Nominatim (original implementation, no API key)
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const MAPBOX_GEOCODING_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

const AIRPORT_KEYWORDS = ['airport', 'flughafen', 'aeroport', 'aéroport', 'aeroporto'];

const CITY_AIRPORT_HINTS: { city: string; iata: string }[] = [
  { city: 'zurich', iata: 'ZRH' },
  { city: 'zuerich', iata: 'ZRH' },
  { city: 'zürich', iata: 'ZRH' },
  { city: 'geneva', iata: 'GVA' },
  { city: 'genf', iata: 'GVA' },
  { city: 'genève', iata: 'GVA' },
  { city: 'basel', iata: 'BSL' },
];

function stripDiacritics(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue');
}

function tokenizeNormalized(value: string): string[] {
  return stripDiacritics(value)
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter(Boolean);
}

function hasAirportKeywordInQuery(query: string): boolean {
  const tokens = tokenizeNormalized(query);
  return tokens.some((t) => AIRPORT_KEYWORDS.includes(t));
}

function isAirportLikeFeature(feature: any): boolean {
  const name = stripDiacritics(String(feature?.place_name ?? '')).toLowerCase();
  const category = stripDiacritics(String(feature?.properties?.category ?? '')).toLowerCase();
  return AIRPORT_KEYWORDS.some(
    (kw) => name.includes(kw) || (category && category.includes(kw))
  );
}

function scoreMapboxFeature(feature: any, query: string): number {
  const baseRelevance = typeof feature?.relevance === 'number' ? feature.relevance : 0;
  let score = baseRelevance * 10;

  const qTrimmed = query.trim();
  const qUpper = qTrimmed.toUpperCase();
  const isIataQuery = /^[A-Z]{3}$/i.test(qTrimmed);

  const hasAirportKeyword = hasAirportKeywordInQuery(query);
  const isAirportLike = isAirportLikeFeature(feature);

  const normalizedQueryTokens = tokenizeNormalized(query);
  const cityTokens = normalizedQueryTokens.filter((t) => !AIRPORT_KEYWORDS.includes(t));

  const placeName = String(feature?.place_name ?? '');
  const placeNameUpper = placeName.toUpperCase();
  const placeNameNorm = stripDiacritics(placeName).toLowerCase();

  if (hasAirportKeyword && isAirportLike) {
    score += 15;
  }

  if (isIataQuery && isAirportLike && placeNameUpper.includes(qUpper)) {
    score += 20;
  }

  for (const hint of CITY_AIRPORT_HINTS) {
    const hasCityInQuery = cityTokens.includes(hint.city);
    if (!hasCityInQuery) continue;

    if (isAirportLike && placeNameUpper.includes(hint.iata)) {
      score += 20;
    } else if (isAirportLike && placeNameNorm.includes(hint.city)) {
      score += 12;
    }
  }

  return score;
}

function rankMapboxFeatures(features: any[], query: string): any[] {
  if (!Array.isArray(features) || features.length === 0) return [];

  return features
    .map((f) => ({
      feature: f,
      score: scoreMapboxFeature(f, query),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.feature);
}

export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export async function searchAddressSwitzerland(query: string): Promise<NominatimResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const mapboxToken = getMapboxAccessToken();

  // Prefer Mapbox Geocoding when configured
  if (mapboxToken) {
    try {
      const params = new URLSearchParams({
        access_token: mapboxToken,
        autocomplete: 'true',
        country: 'ch',
        limit: '8',
        bbox: MAPBOX_SWISS_BBOX,
        language: 'en,de,fr,it',
        types: 'address,place,poi',
      });
      const res = await fetch(
        `${MAPBOX_GEOCODING_BASE}/${encodeURIComponent(q)}.json?${params.toString()}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.features)) {
          const rankedFeatures = rankMapboxFeatures(data.features, q);
          const results: NominatimResult[] = rankedFeatures
            .map((f: any) => {
              if (!Array.isArray(f.center) || f.center.length < 2) return null;
              const [lng, lat] = f.center as [number, number];
              if (typeof lat !== 'number' || typeof lng !== 'number') return null;
              const placeType =
                Array.isArray(f.place_type) && f.place_type.length > 0
                  ? String(f.place_type[0])
                  : 'place';
              return {
                display_name: String(f.place_name ?? ''),
                lat: String(lat),
                lon: String(lng),
                type: placeType,
              } satisfies NominatimResult;
            })
            .filter(Boolean);
          if (results.length > 0) return results;
        }
      }
    } catch {
      // swallow and fall back to Nominatim
    }
  }

  // Fallback: original Nominatim implementation (no API key, Switzerland-only)
  const params = new URLSearchParams({
    q,
    format: 'json',
    addressdetails: '0',
    limit: '8',
    countrycodes: 'ch',
    bounded: '1',
    viewbox: MAPBOX_SWISS_BBOX,
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ElegantLimoBooking/1.0 (Switzerland limousine booking)',
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const hasAirportKeyword = hasAirportKeywordInQuery(q);

  if (!hasAirportKeyword) {
    return data;
  }

  const withAirport: any[] = [];
  const withoutAirport: any[] = [];

  for (const item of data) {
    const name = stripDiacritics(String(item?.display_name ?? '')).toLowerCase();
    const isAirportLike = AIRPORT_KEYWORDS.some((kw) => name.includes(kw));
    if (isAirportLike) {
      withAirport.push(item);
    } else {
      withoutAirport.push(item);
    }
  }

  return [...withAirport, ...withoutAirport];
}

/**
 * Geocode a single address to get first result's lat/lon
 * (e.g. for map when user didn't select from autocomplete).
 */
export async function geocodeAddress(
  query: string
): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim();
  if (!q) return null;

  const mapboxToken = getMapboxAccessToken();

  if (mapboxToken) {
    try {
      const params = new URLSearchParams({
        access_token: mapboxToken,
        limit: '1',
        country: 'ch',
        bbox: MAPBOX_SWISS_BBOX,
      });
      const res = await fetch(
        `${MAPBOX_GEOCODING_BASE}/${encodeURIComponent(q)}.json?${params.toString()}`
      );
      if (res.ok) {
        const data = await res.json();
        const feature = Array.isArray(data.features) ? data.features[0] : null;
        if (feature && Array.isArray(feature.center) && feature.center.length >= 2) {
          const [lng, lat] = feature.center as [number, number];
          if (typeof lat === 'number' && typeof lng === 'number') {
            return { lat, lng };
          }
        }
      }
    } catch {
      // swallow and fall back to Nominatim
    }
  }

  // Fallback to Nominatim single-result geocode
  const params = new URLSearchParams({
    q: q + ' Switzerland',
    format: 'json',
    limit: '1',
    countrycodes: 'ch',
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ElegantLimoBooking/1.0 (Switzerland limousine booking)',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  if (!first?.lat || !first?.lon) return null;
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}
