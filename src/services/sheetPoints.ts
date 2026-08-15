import type { HelpPoint } from "@/types";
import { supabase } from "@/services/supabaseClient";

interface SheetPointRow {
  id: string;
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
}

export async function fetchSheetPoints(): Promise<HelpPoint[]> {
  const { data, error } = await supabase.from("sheet_points").select("*");
  if (error) throw error;
  return (data as SheetPointRow[]).map(rowToHelpPoint);
}

function rowToHelpPoint(row: SheetPointRow): HelpPoint {
  return {
    id: row.id,
    source: "sheet",
    lugar: row.lugar,
    direccion: row.direccion,
    seNecesitanVoluntarios: row.se_necesitan_voluntarios,
    horarios: row.horarios,
    horaActualizacion: row.hora_actualizacion,
    notas: row.notas,
    linkInscripcion: row.link_inscripcion,
    contactoClave: row.contacto_clave,
    grupoWhatsapp: row.grupo_whatsapp,
    instagram: row.instagram,
    funcionesVoluntarios: row.funciones_voluntarios,
    lat: row.lat,
    lng: row.lng,
  };
}
