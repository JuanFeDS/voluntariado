import type { Urgencia, VictimRequestPublic } from "@/types";
import { supabase } from "@/services/supabaseClient";

interface VictimRequestPublicRow {
  id: string;
  localidad_aprox: string;
  numero_personas_afectadas: number | null;
  tipo_ayuda: string;
  urgencia: Urgencia;
  created_at: string;
}

/** Lee victim_requests_public: nunca trae dirección exacta, teléfono ni coordenadas (son privados). */
export async function fetchVictimRequests(): Promise<VictimRequestPublic[]> {
  const { data, error } = await supabase.from("victim_requests_public").select("*");
  if (error) throw error;
  return (data as VictimRequestPublicRow[]).map((row) => ({
    id: row.id,
    localidadAprox: row.localidad_aprox,
    numeroPersonasAfectadas: row.numero_personas_afectadas,
    tipoAyuda: row.tipo_ayuda,
    urgencia: row.urgencia,
    createdAt: row.created_at,
  }));
}
