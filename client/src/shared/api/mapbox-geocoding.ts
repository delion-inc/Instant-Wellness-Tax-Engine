import { MAPBOX_ACCESS_TOKEN, NY_BOUNDS } from "@/shared/config/mapbox";

export interface GeocodingResult {
  id: string;
  placeName: string;
  coordinates: [number, number];
}

const GEOCODING_BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

const RESULT_TYPES = "place,locality,neighborhood,address,poi";

const bbox = [
  (NY_BOUNDS as [[number, number], [number, number]])[0][0],
  (NY_BOUNDS as [[number, number], [number, number]])[0][1],
  (NY_BOUNDS as [[number, number], [number, number]])[1][0],
  (NY_BOUNDS as [[number, number], [number, number]])[1][1],
].join(",");

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    bbox,
    limit: "5",
    types: RESULT_TYPES,
  });

  const url = `${GEOCODING_BASE_URL}/${encodeURIComponent(query)}.json?${params}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Geocoding request failed");
  }

  const data = await response.json();

  return (data.features ?? []).map(
    (feature: { id: string; place_name: string; center: [number, number] }) => ({
      id: feature.id,
      placeName: feature.place_name,
      coordinates: feature.center as [number, number],
    }),
  );
}
