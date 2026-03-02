import { useRef, useEffect } from 'react';
import mapboxgl, { type LngLatBoundsLike, type Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { LatLon } from '../contexts/BookingContext';
import { getMapboxAccessToken, getMapboxStyleId } from '../lib/mapbox-config';

const SWISS_CENTER: [number, number] = [46.8182, 8.2275];

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
  const mapRef = useRef<MapboxMap | null>(null);
  const routeSourceIdRef = useRef<string>('route');

  useEffect(() => {
    if (!containerRef.current) return;

    const mapboxToken = getMapboxAccessToken();
    const mapboxStyleId = getMapboxStyleId();

    if (!mapboxToken) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: `mapbox://styles/${mapboxStyleId}`,
      center: [SWISS_CENTER[1], SWISS_CENTER[0]],
      zoom: background ? 6.5 : 7.5,
      projection: 'mercator',
      attributionControl: true,
      cooperativeGestures: true,
    });

    if (background) {
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragRotate.disable();
      map.dragPan.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    }

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');

    mapRef.current = map;
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [background]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const draw = () => {
      // Clear existing pins & route layers if any
      const existingMarkers = (map as any)._elPins as mapboxgl.Marker[] | undefined;
      existingMarkers?.forEach((m) => m.remove());
      (map as any)._elPins = [];

      if (map.getLayer('route-highlight')) map.removeLayer('route-highlight');
      if (map.getLayer('route-main')) map.removeLayer('route-main');
      if (map.getLayer('route-casing')) map.removeLayer('route-casing');
      if (map.getSource(routeSourceIdRef.current)) map.removeSource(routeSourceIdRef.current);

      const pins: mapboxgl.Marker[] = [];
      const bounds = new mapboxgl.LngLatBounds();

      const createPin = (latLon: LatLon, isDrop: boolean) => {
        const el = document.createElement('div');
        el.className = `pin${isDrop ? ' drop' : ''}`;
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([
          latLon.lng,
          latLon.lat,
        ]);
        marker.addTo(map);
        pins.push(marker);
        bounds.extend([latLon.lng, latLon.lat]);
      };

      if (from) createPin(from, false);
      if (to) createPin(to, true);

      let lineGeometry: GeoJSON.LineString | null = null;

      if (geoJson && typeof geoJson === 'object') {
        const g = geoJson as any;
        if (g.type === 'LineString') {
          lineGeometry = g as GeoJSON.LineString;
        } else if (g.type === 'Feature' && g.geometry?.type === 'LineString') {
          lineGeometry = g.geometry as GeoJSON.LineString;
        }
      } else if (routePoints && routePoints.length >= 2) {
        lineGeometry = {
          type: 'LineString',
          coordinates: routePoints.map((p) => [p.lng, p.lat]),
        };
      }

      if (lineGeometry && lineGeometry.coordinates.length >= 2) {
        const sourceId = routeSourceIdRef.current;
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: lineGeometry,
            properties: {},
          },
        });

        map.addLayer({
          id: 'route-casing',
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-width': 10,
            'line-color': 'rgba(15,23,42,0.35)',
          },
        });

        map.addLayer({
          id: 'route-main',
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-width': 6,
            'line-color': '#2563eb',
          },
        });

        map.addLayer({
          id: 'route-highlight',
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-width': 2,
            'line-color': 'rgba(255,255,255,0.7)',
          },
        });

        lineGeometry.coordinates.forEach((c) => bounds.extend(c as [number, number]));
      }

      (map as any)._elPins = pins;

      if (!bounds.isEmpty()) {
        const fit: LngLatBoundsLike = bounds;
        map.fitBounds(fit, { padding: background ? 40 : 60, maxZoom: background ? 10 : 13 });
      }
    };

    if (!map.isStyleLoaded()) {
      map.once('load', draw);
      return;
    }

    draw();
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
