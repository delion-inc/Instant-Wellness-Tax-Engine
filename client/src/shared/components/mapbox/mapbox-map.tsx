"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { cn } from "@/shared/lib/utils";
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE, NY_BOUNDS, DEFAULT_ZOOM } from "@/shared/config/mapbox";
import { createMapPinElement, injectPinStyles } from "./map-pin";

export interface MapMarker {
  /** [longitude, latitude] */
  coordinates: [number, number];
}

export interface MapboxMapProps {
  center: [number, number];
  zoom?: number;
  className?: string;
  interactive?: boolean;
  markers?: MapMarker[];
  showStateMask?: boolean;
  onMapLoad?: (map: mapboxgl.Map) => void;
}

export function MapboxMap({
  center,
  zoom = DEFAULT_ZOOM,
  className,
  interactive = true,
  markers = [],
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    injectPinStyles();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center,
      zoom,
      maxBounds: NY_BOUNDS,
      interactive,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchZoomRotate: interactive,
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const { coordinates } of markers) {
      const el = createMapPinElement();
      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(coordinates)
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({ center, zoom, duration: 800 });
  }, [center, zoom]);

  return <div ref={containerRef} className={cn("relative h-56 w-full rounded-lg", className)} />;
}
