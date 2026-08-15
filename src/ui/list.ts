import type { HelpPoint } from "@/types";
import { escapeHtml } from "@/utils/html";
import { statusVariant, renderLinksHtml, hasCoords } from "@/utils/pointFormat";

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
      ${renderLinksHtml(point)}
      ${hasCoords(point) ? `<button type="button" class="point-card__map-link">Ver en el mapa →</button>` : ""}
    `;

    item.addEventListener("click", () => handlers.forEach((handler) => handler(point)));
    list.appendChild(item);
  });

  container.appendChild(list);
  return { onSelect: (handler) => handlers.push(handler) };
}
