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
