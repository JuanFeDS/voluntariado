import type { HelpPoint } from "@/types";
import { supabase } from "@/services/supabaseClient";

interface FoundationRequestRow {
  id: string;
  nombre_organizacion: string;
  direccion: string;
  necesita_voluntarios: "si" | "no" | "revisando";
  necesita_donaciones: boolean;
  tipo_donaciones: string | null;
  horarios: string | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  instagram: string | null;
  link_inscripcion: string | null;
  notas: string | null;
  lat: number | null;
  lng: number | null;
}

const VOLUNTEER_LABEL: Record<FoundationRequestRow["necesita_voluntarios"], string> = {
  si: "SI",
  no: "NO",
  revisando: "REVISANDO INFORMACIÓN",
};

/** Solo trae las aprobadas: RLS ya filtra por status='aprobado' para el rol anon. */
export async function fetchFoundationRequests(): Promise<HelpPoint[]> {
  const { data, error } = await supabase.from("foundation_requests").select("*");
  if (error) throw error;
  return (data as FoundationRequestRow[]).map(rowToHelpPoint);
}

function rowToHelpPoint(row: FoundationRequestRow): HelpPoint {
  const donaciones = row.necesita_donaciones ? `Donaciones: ${row.tipo_donaciones || "sí, tipo por confirmar"}` : "";

  return {
    id: row.id,
    source: "foundation",
    lugar: row.nombre_organizacion,
    direccion: row.direccion,
    seNecesitanVoluntarios: VOLUNTEER_LABEL[row.necesita_voluntarios],
    horarios: row.horarios ?? "",
    horaActualizacion: "",
    notas: [row.notas, donaciones].filter(Boolean).join("\n\n"),
    linkInscripcion: row.link_inscripcion ?? "",
    contactoClave: [row.contacto_nombre, row.contacto_telefono].filter(Boolean).join(" · "),
    grupoWhatsapp: "",
    instagram: row.instagram ?? "",
    funcionesVoluntarios: "",
    lat: row.lat,
    lng: row.lng,
  };
}
