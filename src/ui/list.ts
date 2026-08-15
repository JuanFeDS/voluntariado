import type { HelpPoint } from "@/types";
import { escapeHtml, sanitizeHttpUrl } from "@/utils/html";

export interface ListController {
  onSelect(handler: (point: HelpPoint) => void): void;
}

export function renderList(container: HTMLElement, points: HelpPoint[]): ListController {
  container.innerHTML = "";

  const handlers: ((point: HelpPoint) => void)[] = [];

  if (points.length === 0) {
    const empty = document.createElement("p");
    empty.className = "list-empty";
    empty.textContent = "No hay puntos que coincidan con el filtro.";
    container.appendChild(empty);
    return { onSelect: (handler) => handlers.push(handler) };
  }

  const list = document.createElement("ul");
  list.className = "point-list";

  points.forEach((point) => {
    const item = document.createElement("li");
    item.className = "point-card";
    item.dataset.status = statusVariant(point.seNecesitanVoluntarios);

    item.innerHTML = `
      <div class="point-card__header">
        <h3>${escapeHtml(point.lugar)}</h3>
        <span class="badge badge--${statusVariant(point.seNecesitanVoluntarios)}">
          ${escapeHtml(point.seNecesitanVoluntarios || "Sin dato")}
        </span>
      </div>
      <p class="point-card__address">${escapeHtml(point.direccion)}</p>
      ${point.horarios ? `<p class="point-card__row"><strong>Horario:</strong> ${escapeHtml(point.horarios)}</p>` : ""}
      ${point.funcionesVoluntarios ? `<p class="point-card__row"><strong>Funciones:</strong> ${escapeHtml(point.funcionesVoluntarios)}</p>` : ""}
      ${point.notas ? `<p class="point-card__notes">${escapeHtml(point.notas)}</p>` : ""}
      <p class="point-card__updated">Actualizado: ${escapeHtml(point.horaActualizacion || "sin dato")}</p>
      ${renderLinks(point)}
    `;

    item.addEventListener("click", () => handlers.forEach((handler) => handler(point)));
    list.appendChild(item);
  });

  container.appendChild(list);
  return { onSelect: (handler) => handlers.push(handler) };
}

function renderLinks(point: HelpPoint): string {
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

  return `<div class="point-card__links">${anchors}</div>`;
}

function statusVariant(status: string): "necesitan" | "revisando" | "otro" {
  const normalized = status.trim().toUpperCase();
  if (normalized === "SI") return "necesitan";
  if (normalized.startsWith("REVISANDO")) return "revisando";
  return "otro";
}
