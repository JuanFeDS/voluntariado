import { GEOCODE_REGION_HINT } from "@/config";

export function buildGeocodeQuery(direccion: string): string {
  return `${direccion}, ${GEOCODE_REGION_HINT}`;
}
