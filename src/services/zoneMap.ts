import type { MunicipioZoneCount } from "@/types";
import { supabase } from "@/services/supabaseClient";
import { fetchVictimRequests } from "@/services/victimRequests";

interface MunicipioCoordRow {
  departamento: string;
  municipio: string;
  lat: number;
  lng: number;
}

const zoneKey = (departamento: string, municipio: string): string => `${departamento}|||${municipio}`;

/**
 * Agrega solicitudes de damnificados por departamento+municipio (nunca por
 * dirección exacta) y las cruza con las coordenadas cacheadas del municipio.
 * Zonas sin coordenadas cacheadas todavía (el cron de geocoding corre cada
 * 6h) simplemente no aparecen hasta la próxima corrida.
 */
export async function fetchAffectedZones(): Promise<MunicipioZoneCount[]> {
  const [victimRequests, coordsResult] = await Promise.all([
    fetchVictimRequests(),
    supabase.from("municipio_coords").select("*"),
  ]);
  if (coordsResult.error) throw coordsResult.error;

  const coordsByZone = new Map<string, MunicipioCoordRow>();
  for (const row of coordsResult.data as MunicipioCoordRow[]) {
    coordsByZone.set(zoneKey(row.departamento, row.municipio), row);
  }

  const counts = new Map<string, number>();
  for (const request of victimRequests) {
    const key = zoneKey(request.departamento, request.municipio);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const zones: MunicipioZoneCount[] = [];
  for (const [key, count] of counts) {
    const coords = coordsByZone.get(key);
    if (!coords) continue;
    zones.push({ departamento: coords.departamento, municipio: coords.municipio, count, lat: coords.lat, lng: coords.lng });
  }
  return zones;
}
