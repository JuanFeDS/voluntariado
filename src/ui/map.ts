import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import type { HelpPoint } from "@/types";
import { BOGOTA_CENTER } from "@/config";
import { escapeHtml } from "@/utils/html";
import { hasCoords, statusVariant, renderLinksHtml } from "@/utils/pointFormat";

// Icon.Default._getIconUrl antepone un imagePath auto-detectado del CSS
// incluso cuando mergeOptions ya trae una URL absoluta, duplicando la ruta
// y rompiendo el ícono. Hay que borrar el método para que use iconUrl tal cual.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface MapController {
  setPoints(points: HelpPoint[]): void;
  focusPoint(point: HelpPoint): void;
  invalidateSize(): void;
}

export function renderMap(container: HTMLElement): MapController {
  const map = L.map(container).setView([BOGOTA_CENTER.lat, BOGOTA_CENTER.lng], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  let markers: L.Marker[] = [];
  const markersById = new Map<string, L.Marker>();

  function clearMarkers(): void {
    markers.forEach((marker) => marker.remove());
    markers = [];
    markersById.clear();
  }

  function setPoints(points: HelpPoint[]): void {
    clearMarkers();

    markers = points.filter(hasCoords).map((point) => {
      const marker = L.marker([point.lat, point.lng]).addTo(map);
      marker.bindPopup(buildPopupContent(point), { maxWidth: 280 });
      markersById.set(point.id, marker);
      return marker;
    });
  }

  function focusPoint(point: HelpPoint): void {
    if (!hasCoords(point)) return;
    map.setView([point.lat, point.lng], 16);
    // Al llegar desde la lista, abrir el popup de una vez evita que haya
    // que volver a tocar el marcador para ver la info del punto.
    markersById.get(point.id)?.openPopup();
  }

  // Leaflet calcula el tamaño del mapa una sola vez al crearlo; si en ese
  // momento el contenedor tenía display:none (toggle mobile en "lista"),
  // el mapa queda con tamaño 0 hasta que se le avisa explícitamente.
  function invalidateSize(): void {
    map.invalidateSize();
  }

  return { setPoints, focusPoint, invalidateSize };
}

function buildPopupContent(point: HelpPoint): string {
  return `
    <div class="map-info">
      <div class="map-info__header">
        <strong>${escapeHtml(point.lugar)}</strong>
        <span class="badge badge--${statusVariant(point.seNecesitanVoluntarios)}">
          ${escapeHtml(point.seNecesitanVoluntarios || "Sin dato")}
        </span>
      </div>
      <p class="map-info__address">${escapeHtml(point.direccion)}</p>
      ${point.horarios ? `<p class="map-info__row"><strong>Horario:</strong> ${escapeHtml(point.horarios)}</p>` : ""}
      ${point.funcionesVoluntarios ? `<p class="map-info__row"><strong>Funciones:</strong> ${escapeHtml(point.funcionesVoluntarios)}</p>` : ""}
      ${point.notas ? `<p class="map-info__notes">${escapeHtml(point.notas)}</p>` : ""}
      ${renderLinksHtml(point)}
    </div>
  `;
}
