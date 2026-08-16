import type { Urgencia, VictimRequestPublic } from "@/types";
import { supabase } from "@/services/supabaseClient";

interface VictimRequestPublicRow {
  id: string;
  departamento: string;
  municipio: string;
  numero_personas_afectadas: number | null;
  tipo_ayuda: string;
  urgencia: Urgencia;
  recibio_ayuda_antes: boolean | null;
  created_at: string;
}

/** Lee victim_requests_public: nunca trae dirección exacta, barrio/vereda, teléfono ni coordenadas (son privados). */
export async function fetchVictimRequests(): Promise<VictimRequestPublic[]> {
  const { data, error } = await supabase.from("victim_requests_public").select("*");
  if (error) throw error;
  return (data as VictimRequestPublicRow[]).map((row) => ({
    id: row.id,
    departamento: row.departamento,
    municipio: row.municipio,
    numeroPersonasAfectadas: row.numero_personas_afectadas,
    tipoAyuda: row.tipo_ayuda,
    urgencia: row.urgencia,
    recibioAyudaAntes: row.recibio_ayuda_antes,
    createdAt: row.created_at,
  }));
}
