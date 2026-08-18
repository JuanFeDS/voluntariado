import type { HelpPoint, PointFilter, VictimRequestPublic } from "@/types";
import { fetchFoundationRequests } from "@/services/foundationRequests";
import { fetchVictimRequests } from "@/services/victimRequests";
import { pointTypeVariant } from "@/utils/pointFormat";

export async function loadHelpPoints(): Promise<HelpPoint[]> {
  const [foundationPoints, victimPoints] = await Promise.all([
    fetchFoundationRequests(),
    fetchVictimRequests().then((requests) => requests.map(victimRequestToHelpPoint)),
  ]);
  return [...foundationPoints, ...victimPoints];
}

/**
 * Nunca trae dirección exacta ni coordenadas (son privadas) — por eso estos
 * puntos aparecen en la lista pero nunca como pin individual en el mapa.
 */
function victimRequestToHelpPoint(request: VictimRequestPublic): HelpPoint {
  return {
    id: request.id,
    source: "victim",
    lugar: request.tipoAyuda,
    direccion: `${request.municipio}, ${request.departamento}`,
    seNecesitanVoluntarios: "",
    horarios: "",
    horaActualizacion: "",
    notas: request.numeroPersonasAfectadas ? `${request.numeroPersonasAfectadas} persona(s) afectadas` : "",
    linkInscripcion: "",
    contactoClave: "",
    grupoWhatsapp: "",
    instagram: "",
    funcionesVoluntarios: "",
    lat: null,
    lng: null,
    updatedAt: request.createdAt,
  };
}

const FILTER_TYPE: Record<Exclude<PointFilter, "todos">, ReturnType<typeof pointTypeVariant>> = {
  acopio: "acopio",
  pedidos: "pedido",
  manos: "voluntariado",
};

export function filterPoints(points: HelpPoint[], filter: PointFilter): HelpPoint[] {
  if (filter === "todos") return points;
  return points.filter((point) => pointTypeVariant(point) === FILTER_TYPE[filter]);
}
