import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { CSV_EXPORT_URL } from "@/config";
import { buildGeocodeQuery } from "@/utils/address";
import { parseSheetRows, COLUMN } from "@/utils/sheetRows";

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
// Política de uso de Nominatim: máx. 1 request/segundo + User-Agent identificable.
// https://operations.osmfoundation.org/policies/nominatim/
const REQUEST_DELAY_MS = 1100;
const USER_AGENT = "voluntariado-donaciones-bogota (app comunitaria sin fines de lucro)";

interface Coords {
  lat: number;
  lng: number;
}

interface ExistingRow {
  id: string;
  lugar: string;
  direccion: string;
  lat: number | null;
  lng: number | null;
}

interface SheetPointUpsert {
  lugar: string;
  direccion: string;
  se_necesitan_voluntarios: string;
  horarios: string;
  hora_actualizacion: string;
  notas: string;
  link_inscripcion: string;
  contacto_clave: string;
  grupo_whatsapp: string;
  instagram: string;
  funciones_voluntarios: string;
  lat: number | null;
  lng: number | null;
  synced_at: string;
}

const rowKey = (lugar: string, direccion: string): string => `${lugar}|||${direccion}`;

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const csvText = await (await fetch(CSV_EXPORT_URL)).text();
  const rows = parseSheetRows(csvText);

  const { data: existingRows, error: fetchError } = await supabase
    .from("sheet_points")
    .select("id, lugar, direccion, lat, lng");
  if (fetchError) throw fetchError;

  const existingByKey = new Map<string, ExistingRow>();
  for (const row of (existingRows ?? []) as ExistingRow[]) {
    existingByKey.set(rowKey(row.lugar, row.direccion), row);
  }

  const upserts: SheetPointUpsert[] = [];
  const currentKeys = new Set<string>();
  let geocodedCount = 0;

  for (const row of rows) {
    const lugar = row[COLUMN.lugar]?.trim() ?? "";
    const direccion = row[COLUMN.direccion]?.trim() ?? "";
    if (!lugar || !direccion) continue;

    const key = rowKey(lugar, direccion);
    currentKeys.add(key);

    let coords: Coords | null = existingByKey.get(key)?.lat != null
      ? { lat: existingByKey.get(key)!.lat!, lng: existingByKey.get(key)!.lng! }
      : null;

    if (!coords) {
      coords = await geocodeAddress(direccion);
      geocodedCount++;
      await sleep(REQUEST_DELAY_MS);
    }

    upserts.push({
      lugar,
      direccion,
      se_necesitan_voluntarios: row[COLUMN.seNecesitanVoluntarios]?.trim() ?? "",
      horarios: row[COLUMN.horarios]?.trim() ?? "",
      hora_actualizacion: row[COLUMN.horaActualizacion]?.trim() ?? "",
      notas: row[COLUMN.notas]?.trim() ?? "",
      link_inscripcion: row[COLUMN.linkInscripcion]?.trim() ?? "",
      contacto_clave: row[COLUMN.contactoClave]?.trim() ?? "",
      grupo_whatsapp: row[COLUMN.grupoWhatsapp]?.trim() ?? "",
      instagram: row[COLUMN.instagram]?.trim() ?? "",
      funciones_voluntarios: row[COLUMN.funcionesVoluntarios]?.trim() ?? "",
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      synced_at: new Date().toISOString(),
    });
  }

  if (upserts.length > 0) {
    const { error: upsertError } = await supabase
      .from("sheet_points")
      .upsert(upserts, { onConflict: "lugar,direccion" });
    if (upsertError) throw upsertError;
  }

  const staleIds = [...existingByKey.entries()]
    .filter(([key]) => !currentKeys.has(key))
    .map(([, row]) => row.id);

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase.from("sheet_points").delete().in("id", staleIds);
    if (deleteError) throw deleteError;
  }

  console.log(
    `Sync completo: ${upserts.length} puntos actualizados, ${geocodedCount} geocodificados de nuevo, ${staleIds.length} eliminados por ya no estar en la hoja.`,
  );
}

async function geocodeAddress(direccion: string): Promise<Coords | null> {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("q", buildGeocodeQuery(direccion));
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
