import { useRef, useEffect, useState } from 'react';
import { loadGoogleMapsScript, getGoogleMapsApiKey, isGoogleMapsAvailable } from '../lib/google-maps';
import type { LatLon } from '../contexts/BookingContext';

const SWISS_CENTER = { lat: 46.8182, lng: 8.2275 };
const DEFAULT_ZOOM = 8;

interface BookingMapProps {
  /** Subtle background mode: dim/blur overlay */
  background?: boolean;
  /** From position – when set with to, route is drawn */
  from?: LatLon | null;
  /** To position */
  to?: LatLon | null;
  /** Route polyline points (from Directions API or simple A–B) */
  routePoints?: { lat: number; lng: number }[];
  className?: string;
}

export function BookingMap({
  background = false,
  from,
  to,
  routePoints,
  className = '',
}: BookingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      setError('Map unavailable (no API key)');
      return;
    }
    if (isGoogleMapsAvailable()) {
      setReady(true);
      return;
    }
    loadGoogleMapsScript(apiKey)
      .then(() => setReady(true))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load map'));
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: SWISS_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: true,
      zoomControl: !background,
      styles: background
        ? [
            { featureType: 'all', elementType: 'all', stylers: [{ saturation: 0.2 }, { lightness: 30 }] },
            { featureType: 'water', stylers: [{ visibility: 'simplified' }] },
          ]
        : undefined,
      gestureHandling: background ? 'none' : 'auto',
      draggable: !background,
      scrollwheel: !background,
    });

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      mapRef.current = null;
    };
  }, [ready, background]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    if (from) {
      const m = new window.google.maps.Marker({
        position: from,
        map,
        title: 'Pickup',
        icon: undefined,
      });
      markersRef.current.push(m);
      bounds.extend(from);
    }
    if (to) {
      const m = new window.google.maps.Marker({
        position: to,
        map,
        title: 'Dropoff',
        icon: undefined,
      });
      markersRef.current.push(m);
      bounds.extend(to);
    }

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    if (routePoints && routePoints.length >= 2) {
      const path = routePoints.map((p) => ({ lat: p.lat, lng: p.lng }));
      const poly = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#d4af37',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map,
      });
      path.forEach((p) => bounds.extend(p));
    } else if (from && to) {
      const service = new window.google.maps.DirectionsService();
      service.route(
        {
          origin: from,
          destination: to,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            const dr = new window.google.maps.DirectionsRenderer({
              map,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#d4af37',
                strokeWeight: 4,
              },
            });
            dr.setDirections(result);
            directionsRendererRef.current = dr;
            const r = result.routes[0];
            if (r?.bounds) map.fitBounds(r.bounds);
          } else {
            const line = new window.google.maps.Polyline({
              path: [from, to],
              geodesic: true,
              strokeColor: '#d4af37',
              strokeWeight: 4,
              map,
            });
            bounds.extend(from);
            bounds.extend(to);
            if (bounds.getNorthEast().lat() !== bounds.getSouthWest().lat()) map.fitBounds(bounds);
          }
        }
      );
    } else if (from || to) {
      if (bounds.getNorthEast().lat() !== bounds.getSouthWest().lat()) map.fitBounds(bounds);
      else map.setCenter(from || to || SWISS_CENTER);
    }
  }, [ready, from, to, routePoints]);

  if (error) {
    return (
      <div
        className={`bg-muted/30 flex items-center justify-center rounded-lg ${className}`}
        aria-hidden
      >
        <span className="text-muted-foreground text-sm">Map unavailable</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${background ? 'brightness-90 contrast-75' : ''} ${className}`}
      style={{ minHeight: background ? 280 : 320 }}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full" aria-hidden />
      {background && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" aria-hidden />
      )}
    </div>
  );
}
