import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLon } from '../contexts/BookingContext';

const SWISS_CENTER: [number, number] = [46.8182, 8.2275];
const DEFAULT_ZOOM = 8;

// Fix default marker icons in Leaflet when using bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface BookingMapProps {
  background?: boolean;
  from?: LatLon | null;
  to?: LatLon | null;
  routePoints?: { lat: number; lng: number }[];
  geoJson?: unknown; // raw GeoJSON geometry for L.geoJSON rendering
  className?: string;
}

export function BookingMap({
  background = false,
  from,
  to,
  routePoints,
  geoJson,
  className = '',
}: BookingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: SWISS_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: !background,
      dragging: !background,
      scrollWheelZoom: !background,
      doubleClickZoom: !background,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);

    if (background) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
    }

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      polylineRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [background]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    polylineRef.current?.remove();

    const bounds: L.LatLngLiteral[] = [];

    if (from) {
      const m = L.marker([from.lat, from.lng]).addTo(map);
      markersRef.current.push(m);
      bounds.push({ lat: from.lat, lng: from.lng });
    }
    if (to) {
      const m = L.marker([to.lat, to.lng]).addTo(map);
      markersRef.current.push(m);
      bounds.push({ lat: to.lat, lng: to.lng });
    }

    if (geoJson) {
      // Use L.geoJSON for proper road geometry from OSRM
      const layer = L.geoJSON(geoJson as GeoJSON.GeoJsonObject, {
        style: { color: '#2563eb', weight: 5, opacity: 0.75 },
      }).addTo(map);
      polylineRef.current = layer as unknown as L.Polyline;
      const gjBounds = layer.getBounds();
      if (gjBounds.isValid()) {
        bounds.push(gjBounds.getSouthWest(), gjBounds.getNorthEast());
      }
    } else if (routePoints && routePoints.length >= 2) {
      const latlngs: [number, number][] = routePoints.map((p) => [p.lat, p.lng]);
      const poly = L.polyline(latlngs, {
        color: '#d4af37',
        weight: 4,
        opacity: 0.9,
      }).addTo(map);
      polylineRef.current = poly;
      latlngs.forEach((p) => bounds.push({ lat: p[0], lng: p[1] }));
    } else if (from && to) {
      const line = L.polyline(
        [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ],
        { color: '#d4af37', weight: 4, opacity: 0.9 }
      ).addTo(map);
      polylineRef.current = line;
      bounds.push({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
    }

    if (bounds.length >= 2) {
      map.fitBounds(bounds as L.LatLngBoundsLiteral, { padding: [20, 20], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 12);
    }
  }, [from, to, routePoints, geoJson]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${background ? 'brightness-90 contrast-[0.95]' : ''} ${className}`}
      style={{ minHeight: background ? 280 : 320 }}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" aria-hidden />
      {background && <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" aria-hidden />}
    </div>
  );
}
