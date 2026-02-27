"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { cn } from "@/shared/lib/utils";
import {
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE,
  NY_BOUNDS,
  NY_CENTER,
  DEFAULT_ZOOM,
} from "@/shared/config/mapbox";
import { createMapPinElement, injectPinStyles } from "./map-pin";
import { MapSearchBox } from "./map-search-box";

export interface MapCoordinatePickerProps {
  coordinates: { latitude: number; longitude: number } | null;
  onCoordinateSelect: (latitude: number, longitude: number) => void;
  className?: string;
}

export function MapCoordinatePicker({
  coordinates,
  onCoordinateSelect,
  className,
}: MapCoordinatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const skipFlyRef = useRef(false);

  const placeMarker = useCallback(
    (lng: number, lat: number, fly = true) => {
      const map = mapRef.current;
      if (!map) return;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        injectPinStyles();
        const el = createMapPinElement();
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(map);

        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          skipFlyRef.current = true;
          onCoordinateSelect(lngLat.lat, lngLat.lng);
        });

        markerRef.current = marker;
      }

      if (fly) {
        map.flyTo({ center: [lng, lat], zoom: DEFAULT_ZOOM, duration: 800 });
      }
    },
    [onCoordinateSelect],
  );

  const removeMarker = useCallback(() => {
    markerRef.current?.remove();
    markerRef.current = null;
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const initialCenter = coordinates
      ? ([coordinates.longitude, coordinates.latitude] as [number, number])
      : (NY_CENTER as [number, number]);

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: initialCenter,
      zoom: coordinates ? DEFAULT_ZOOM : 7,
      maxBounds: NY_BOUNDS,
      interactive: true,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("click", (e) => {
      skipFlyRef.current = true;
      onCoordinateSelect(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;

    if (coordinates) {
      map.once("load", () => {
        placeMarker(coordinates.longitude, coordinates.latitude, false);
      });
    }

    return () => {
      removeMarker();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!coordinates) {
      removeMarker();
      map.flyTo({
        center: NY_CENTER as [number, number],
        zoom: 7,
        duration: 800,
      });
      return;
    }

    const { latitude, longitude } = coordinates;

    if (skipFlyRef.current) {
      skipFlyRef.current = false;
      placeMarker(longitude, latitude, false);
      return;
    }

    placeMarker(longitude, latitude, true);
  }, [coordinates, placeMarker, removeMarker]);

  const handleSearchSelect = useCallback(
    (coords: [number, number]) => {
      onCoordinateSelect(coords[1], coords[0]);
    },
    [onCoordinateSelect],
  );

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute top-3 left-3 right-3 z-10">
        <MapSearchBox onSelect={handleSearchSelect} className="max-w-sm" />
      </div>
    </div>
  );
}
