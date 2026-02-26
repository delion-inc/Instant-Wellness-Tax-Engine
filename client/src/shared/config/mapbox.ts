import type { LngLatBoundsLike, LngLatLike } from "mapbox-gl";

export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAPBOX_STYLE =
  "mapbox://styles/hryntar/cmm3qfq2e002o01qy3jss7zy5";

export const DEFAULT_ZOOM = 13;

/** Geographic center of New York State */
export const NY_CENTER: LngLatLike = [-75.5, 43.0];

export const NY_BOUNDS: LngLatBoundsLike = [
  [-80.0, 40.4], // SW
  [-71.5, 45.1], // NE
];
