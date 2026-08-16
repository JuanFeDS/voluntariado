import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
// Política de uso de Nominatim: máx. 1 request/segundo + User-Agent identificable.
// https://operations.osmfoundation.org/policies/nominatim/
const REQUEST_DELAY_MS = 1100;
const USER_AGENT = "voluntariado-donaciones-bogota (app comunitaria sin fines de lucro)";

interface Coords {
  lat: number;
  lng: number;
}

const zoneKey = (departamento: string, municipio: string): string => `${departamento}|||${municipio}`;

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Se geocodifica por departamento+municipio (nunca por dirección exacta),
  // así el centroide de la zona no revela ninguna ubicación individual.
  const { data: zoneRows, error: zoneError } = await supabase.from("victim_requests").select("departamento, municipio");
  if (zoneError) throw zoneError;

  const zones = new Set<string>();
  for (const row of zoneRows ?? []) {
    if (row.departamento && row.municipio) zones.add(zoneKey(row.departamento, row.municipio));
  }

  const { data: cachedRows, error: cacheError } = await supabase.from("municipio_coords").select("departamento, municipio");
  if (cacheError) throw cacheError;

  const cached = new Set((cachedRows ?? []).map((row) => zoneKey(row.departamento, row.municipio)));
  const pending = [...zones].filter((key) => !cached.has(key));

  let geocodedCount = 0;

  for (const key of pending) {
    const [departamento, municipio] = key.split("|||");
    const coords = await geocodeMunicipio(departamento, municipio);
    if (!coords) {
      console.warn(`No se pudo geocodificar: ${municipio}, ${departamento}`);
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    const { error: upsertError } = await supabase
      .from("municipio_coords")
      .upsert({ departamento, municipio, lat: coords.lat, lng: coords.lng, geocoded_at: new Date().toISOString() }, { onConflict: "departamento,municipio" });
    if (upsertError) throw upsertError;

    geocodedCount++;
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`Geocoding de municipios completo: ${geocodedCount} zonas nuevas de ${pending.length} pendientes.`);
}

async function geocodeMunicipio(departamento: string, municipio: string): Promise<Coords | null> {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("q", `${municipio}, ${departamento}, Colombia`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "co");

  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const results = await response.json();
  const result = results?.[0];
  if (!result) return null;

  return { lat: Number.parseFloat(result.lat), lng: Number.parseFloat(result.lon) };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
