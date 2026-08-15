export type PointSource = "sheet" | "foundation";

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
}

export type VolunteerFilter = "todos" | "necesitan" | "revisando";

export type RequestStatus = "pendiente" | "aprobado" | "rechazado";

export type Urgencia = "alta" | "media" | "baja";

export interface VictimRequestPublic {
  id: string;
  localidadAprox: string;
  numeroPersonasAfectadas: number | null;
  tipoAyuda: string;
  urgencia: Urgencia;
  createdAt: string;
}
