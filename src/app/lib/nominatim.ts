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

const SWISS_AIRPORTS: NominatimResult[] = [
  {
    display_name: 'Zurich Airport (ZRH), 8302 Kloten, Switzerland',
    lat: '47.4582',
    lon: '8.5555',
    type: 'airport',
  },
  {
    display_name: 'Geneva Airport (GVA), 1215 Genève, Switzerland',
    lat: '46.2328',
    lon: '6.1090',
    type: 'airport',
  },
  {
    display_name: 'EuroAirport Basel-Mulhouse-Freiburg (BSL), 4030 Basel, Switzerland',
    lat: '47.59',
    lon: '7.5299',
    type: 'airport',
  },
  {
    display_name: 'Bern Airport (BRN), 3123 Belp, Switzerland',
    lat: '46.9120',
    lon: '7.4998',
    type: 'airport',
  },
  {
    display_name: 'Lugano Airport (LUG), 6982 Agno, Switzerland',
    lat: '46.0043',
    lon: '8.9106',
    type: 'airport',
  },
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

function isIataQuery(query: string): boolean {
  const qTrimmed = query.trim();
  return /^[A-Z]{3}$/i.test(qTrimmed);
}

function findSwissAirportsForQuery(query: string): NominatimResult[] {
  const tokens = tokenizeNormalized(query);
  const hasAirport = tokens.some((t) => AIRPORT_KEYWORDS.includes(t));
  if (!hasAirport) return [];

  const cityTokens = tokens.filter((t) => !AIRPORT_KEYWORDS.includes(t));
  if (cityTokens.length === 0) {
    // Query like just "airport" → show major airports
    return SWISS_AIRPORTS;
  }

  const normalizedCityTokens = new Set(cityTokens);

  const matches: NominatimResult[] = [];

  for (const airport of SWISS_AIRPORTS) {
    const nameNorm = tokenizeNormalized(airport.display_name);
    const nameSet = new Set(nameNorm);

    const hasCityMatch = [...normalizedCityTokens].some((t) => nameSet.has(t));
    if (hasCityMatch) {
      matches.push(airport);
    }
  }

  // If nothing matched city specifically, fall back to all airports
  return matches.length > 0 ? matches : SWISS_AIRPORTS;
}

function prependSwissAirports(
  results: NominatimResult[],
  query: string
): NominatimResult[] {
  const airportMatches = findSwissAirportsForQuery(query);
  if (airportMatches.length === 0) return results;

  const seen = new Set<string>();

  const normalizedKey = (item: NominatimResult) =>
    `${stripDiacritics(item.display_name).toLowerCase()}|${item.lat}|${item.lon}`;

  const ordered: NominatimResult[] = [];

  for (const a of airportMatches) {
    const key = normalizedKey(a);
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(a);
  }

  for (const r of results) {
    const key = normalizedKey(r);
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(r);
  }

  return ordered.slice(0, 8);
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
  const iataLike = isIataQuery(qTrimmed);

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

  if (iataLike && isAirportLike && placeNameUpper.includes(qUpper)) {
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
      const hasAirportKeyword = hasAirportKeywordInQuery(q);
      const iataLike = isIataQuery(q);

      // First, try an airport-focused query when intent is clearly airport-related
      if (hasAirportKeyword || iataLike) {
        const airportParams = new URLSearchParams({
          access_token: mapboxToken,
          autocomplete: 'true',
          country: 'ch',
          limit: '8',
          bbox: MAPBOX_SWISS_BBOX,
          language: 'en,de,fr,it',
          types: 'poi',
          categories: 'airport,airfield',
        });
        const airportRes = await fetch(
          `${MAPBOX_GEOCODING_BASE}/${encodeURIComponent(q)}.json?${airportParams.toString()}`
        );
        if (airportRes.ok) {
          const airportData = await airportRes.json();
          if (Array.isArray(airportData.features) && airportData.features.length > 0) {
            const airportRanked = rankMapboxFeatures(airportData.features, q);
            const airportResults: NominatimResult[] = airportRanked
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

            if (airportResults.length > 0) {
              return airportResults;
            }
          }
        }
      }

      // Generic Swiss address/POI search (previous behaviour, but ranked)
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
          if (results.length > 0) return prependSwissAirports(results, q);
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

  const combined: NominatimResult[] = [...withAirport, ...withoutAirport];
  return prependSwissAirports(combined, q);
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
