export type PointSource = "foundation" | "victim";

export interface HelpPoint {
  id: string;
  source: PointSource;
  lugar: string;
  direccion: string;
  seNecesitanVoluntarios: string;
  horarios: string;
  horaActualizacion: string;
  notas: string;
  linkInscripcion: string;
  contactoClave: string;
  grupoWhatsapp: string;
  instagram: string;
  funcionesVoluntarios: string;
  lat: number | null;
  lng: number | null;
  /** ISO. Mejor timestamp disponible para el semáforo de frescura (no es una "confirmación" real, es el mejor proxy que hay hoy). */
  updatedAt: string | null;
}

export type PointFilter = "todos" | "acopio" | "pedidos" | "manos";

export type RequestStatus = "pendiente" | "aprobado" | "rechazado";

export type Urgencia = "alta" | "media" | "baja";

export interface VictimRequestPublic {
  id: string;
  departamento: string;
  municipio: string;
  numeroPersonasAfectadas: number | null;
  tipoAyuda: string;
  urgencia: Urgencia;
  recibioAyudaAntes: boolean | null;
  createdAt: string;
}

export type NecesitaVoluntarios = "si" | "no" | "revisando";

export interface FoundationRequestAdmin {
  id: string;
  status: RequestStatus;
  nombreOrganizacion: string;
  direccion: string;
  localidad: string;
  necesitaVoluntarios: NecesitaVoluntarios;
  necesitaDonaciones: boolean;
  tipoDonaciones: string;
  horarios: string;
  contactoNombre: string;
  contactoTelefono: string;
  instagram: string;
  linkInscripcion: string;
  notas: string;
  createdAt: string;
}

export interface VictimRequestAdmin {
  id: string;
  status: RequestStatus;
  nombreContacto: string;
  departamento: string;
  municipio: string;
  barrioVereda: string;
  direccionExacta: string;
  alcaldiaCercana: string;
  numeroPersonasAfectadas: number | null;
  tipoAyuda: string;
  urgencia: Urgencia;
  telefonoContacto: string;
  recibioAyudaAntes: boolean;
  notas: string;
  createdAt: string;
}

export interface MunicipioZoneCount {
  departamento: string;
  municipio: string;
  count: number;
  lat: number;
  lng: number;
}
