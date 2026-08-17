import type { HelpPoint } from "@/types";
import { escapeHtml } from "@/utils/html";
import { renderLinksHtml, hasCoords, pointTypeVariant, POINT_TYPE_LABEL, freshnessVariant, freshnessLabel } from "@/utils/pointFormat";

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
    item.className = "point-row";
    item.dataset.type = pointTypeVariant(point);

    item.innerHTML = `
      <div class="point-row__head">
        <span class="point-row__type">${POINT_TYPE_LABEL[pointTypeVariant(point)]}</span>
      </div>
      <h3 class="point-row__title">${escapeHtml(point.lugar)}</h3>
      <p class="point-row__address">${escapeHtml(point.direccion)}</p>
      ${point.horarios ? `<p class="point-row__detail"><strong>Horario:</strong> ${escapeHtml(point.horarios)}</p>` : ""}
      ${point.funcionesVoluntarios ? `<p class="point-row__detail"><strong>Funciones:</strong> ${escapeHtml(point.funcionesVoluntarios)}</p>` : ""}
      ${point.notas ? `<p class="point-row__detail">${escapeHtml(point.notas)}</p>` : ""}
      <div class="point-row__fresh" data-fresh="${freshnessVariant(point)}">
        <span class="point-row__dot"></span>
        <span>${escapeHtml(freshnessLabel(point))}</span>
      </div>
      ${renderLinksHtml(point)}
      ${hasCoords(point) ? `<button type="button" class="point-row__map-link">Ver en el mapa →</button>` : ""}
    `;

    item.addEventListener("click", () => handlers.forEach((handler) => handler(point)));
    list.appendChild(item);
  });

  container.appendChild(list);
  return { onSelect: (handler) => handlers.push(handler) };
}
