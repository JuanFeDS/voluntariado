import type { HelpPoint } from "@/types";
import { escapeHtml, sanitizeHttpUrl } from "@/utils/html";

export type StatusVariant = "necesitan" | "revisando" | "otro";

export function hasCoords(point: HelpPoint): point is HelpPoint & { lat: number; lng: number } {
  return point.lat !== null && point.lng !== null;
}

export function statusVariant(status: string): StatusVariant {
  const normalized = status.trim().toUpperCase();
  if (normalized === "SI") return "necesitan";
  if (normalized.startsWith("REVISANDO")) return "revisando";
  return "otro";
}

export type PointTypeVariant = "acopio" | "pedido" | "voluntariado";

export function pointTypeVariant(point: HelpPoint): PointTypeVariant {
  if (point.source === "victim") return "pedido";
  if (statusVariant(point.seNecesitanVoluntarios) === "necesitan") return "voluntariado";
  return "acopio";
}

export const POINT_TYPE_LABEL: Record<PointTypeVariant, string> = {
  acopio: "Punto de acopio",
  pedido: "Pedido de ayuda",
  voluntariado: "Voluntariado",
};

export type FreshnessVariant = "verde" | "ambar" | "rojo";

/**
 * No es una "confirmación" real (nadie llama a verificar) — es solo qué tan
 * reciente es el mejor timestamp disponible (sync de la hoja, envío del
 * formulario). Sirve como proxy honesto, no como garantía de vigencia.
 */
export function freshnessVariant(point: HelpPoint): FreshnessVariant {
  if (!point.updatedAt) return "rojo";
  const hours = (Date.now() - new Date(point.updatedAt).getTime()) / 3_600_000;
  if (hours <= 6) return "verde";
  if (hours <= 24) return "ambar";
  return "rojo";
}

export function freshnessLabel(point: HelpPoint): string {
  if (!point.updatedAt) return "sin confirmar";
  const hours = (Date.now() - new Date(point.updatedAt).getTime()) / 3_600_000;
  if (hours < 1) return "hace menos de 1 h";
  if (hours < 24) return `hace ${Math.round(hours)} h`;
  return `hace ${Math.round(hours / 24)} d`;
}

export function renderLinksHtml(point: HelpPoint): string {
  const links = [
    point.linkInscripcion && { href: point.linkInscripcion, label: "Inscripción" },
    point.grupoWhatsapp && { href: point.grupoWhatsapp, label: "WhatsApp" },
    point.instagram && { href: point.instagram, label: "Instagram" },
  ]
    .filter((link): link is { href: string; label: string } => Boolean(link))
    .map((link) => ({ ...link, href: sanitizeHttpUrl(link.href) }))
    .filter((link): link is { href: string; label: string } => link.href !== null);

  if (links.length === 0) return "";

  const anchors = links
    .map((link) => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${link.label}</a>`)
    .join("");

  return `<div class="point-links">${anchors}</div>`;
}
