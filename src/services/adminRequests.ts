import type { FoundationRequestAdmin, NecesitaVoluntarios, RequestStatus, Urgencia, VictimRequestAdmin } from "@/types";
import { supabase } from "@/services/supabaseClient";

interface FoundationRequestRow {
  id: string;
  status: RequestStatus;
  nombre_organizacion: string;
  direccion: string;
  localidad: string | null;
  necesita_voluntarios: NecesitaVoluntarios;
  necesita_donaciones: boolean;
  tipo_donaciones: string | null;
  horarios: string | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  instagram: string | null;
  link_inscripcion: string | null;
  notas: string | null;
  created_at: string;
}

interface VictimRequestRow {
  id: string;
  status: RequestStatus;
  nombre_contacto: string | null;
  departamento: string;
  municipio: string;
  barrio_vereda: string | null;
  direccion_exacta: string;
  alcaldia_cercana: string | null;
  numero_personas_afectadas: number | null;
  tipo_ayuda: string;
  urgencia: Urgencia;
  telefono_contacto: string | null;
  recibio_ayuda_antes: boolean | null;
  notas: string | null;
  created_at: string;
}

export type FoundationRequestEdits = Partial<
  Pick<
    FoundationRequestAdmin,
    | "nombreOrganizacion"
    | "direccion"
    | "localidad"
    | "necesitaVoluntarios"
    | "necesitaDonaciones"
    | "tipoDonaciones"
    | "horarios"
    | "contactoNombre"
    | "contactoTelefono"
    | "instagram"
    | "linkInscripcion"
    | "notas"
  >
>;

export type VictimRequestEdits = Partial<
  Pick<
    VictimRequestAdmin,
    | "nombreContacto"
    | "departamento"
    | "municipio"
    | "barrioVereda"
    | "direccionExacta"
    | "alcaldiaCercana"
    | "numeroPersonasAfectadas"
    | "tipoAyuda"
    | "urgencia"
    | "telefonoContacto"
    | "recibioAyudaAntes"
    | "notas"
  >
>;

export async function fetchAllFoundationRequests(): Promise<FoundationRequestAdmin[]> {
  const { data, error } = await supabase.from("foundation_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as FoundationRequestRow[]).map(foundationRowToAdmin);
}

export async function fetchAllVictimRequests(): Promise<VictimRequestAdmin[]> {
  const { data, error } = await supabase.from("victim_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as VictimRequestRow[]).map(victimRowToAdmin);
}

export async function setFoundationRequestStatus(id: string, status: RequestStatus): Promise<void> {
  const { error } = await supabase.from("foundation_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function setVictimRequestStatus(id: string, status: RequestStatus): Promise<void> {
  const { error } = await supabase.from("victim_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateFoundationRequest(id: string, edits: FoundationRequestEdits): Promise<void> {
  const { error } = await supabase
    .from("foundation_requests")
    .update({
      nombre_organizacion: edits.nombreOrganizacion,
      direccion: edits.direccion,
      localidad: edits.localidad || null,
      necesita_voluntarios: edits.necesitaVoluntarios,
      necesita_donaciones: edits.necesitaDonaciones,
      tipo_donaciones: edits.tipoDonaciones || null,
      horarios: edits.horarios || null,
      contacto_nombre: edits.contactoNombre || null,
      contacto_telefono: edits.contactoTelefono || null,
      instagram: edits.instagram || null,
      link_inscripcion: edits.linkInscripcion || null,
      notas: edits.notas || null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function updateVictimRequest(id: string, edits: VictimRequestEdits): Promise<void> {
  const { error } = await supabase
    .from("victim_requests")
    .update({
      nombre_contacto: edits.nombreContacto || null,
      departamento: edits.departamento,
      municipio: edits.municipio,
      barrio_vereda: edits.barrioVereda || null,
      direccion_exacta: edits.direccionExacta,
      alcaldia_cercana: edits.alcaldiaCercana || null,
      numero_personas_afectadas: edits.numeroPersonasAfectadas,
      tipo_ayuda: edits.tipoAyuda,
      urgencia: edits.urgencia,
      telefono_contacto: edits.telefonoContacto || null,
      recibio_ayuda_antes: edits.recibioAyudaAntes,
      notas: edits.notas || null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFoundationRequest(id: string): Promise<void> {
  const { error } = await supabase.from("foundation_requests").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteVictimRequest(id: string): Promise<void> {
  const { error } = await supabase.from("victim_requests").delete().eq("id", id);
  if (error) throw error;
}

function foundationRowToAdmin(row: FoundationRequestRow): FoundationRequestAdmin {
  return {
    id: row.id,
    status: row.status,
    nombreOrganizacion: row.nombre_organizacion,
    direccion: row.direccion,
    localidad: row.localidad ?? "",
    necesitaVoluntarios: row.necesita_voluntarios,
    necesitaDonaciones: row.necesita_donaciones,
    tipoDonaciones: row.tipo_donaciones ?? "",
    horarios: row.horarios ?? "",
    contactoNombre: row.contacto_nombre ?? "",
    contactoTelefono: row.contacto_telefono ?? "",
    instagram: row.instagram ?? "",
    linkInscripcion: row.link_inscripcion ?? "",
    notas: row.notas ?? "",
    createdAt: row.created_at,
  };
}

function victimRowToAdmin(row: VictimRequestRow): VictimRequestAdmin {
  return {
    id: row.id,
    status: row.status,
    nombreContacto: row.nombre_contacto ?? "",
    departamento: row.departamento,
    municipio: row.municipio,
    barrioVereda: row.barrio_vereda ?? "",
    direccionExacta: row.direccion_exacta,
    alcaldiaCercana: row.alcaldia_cercana ?? "",
    numeroPersonasAfectadas: row.numero_personas_afectadas,
    tipoAyuda: row.tipo_ayuda,
    urgencia: row.urgencia,
    telefonoContacto: row.telefono_contacto ?? "",
    recibioAyudaAntes: row.recibio_ayuda_antes ?? false,
    notas: row.notas ?? "",
    createdAt: row.created_at,
  };
}
