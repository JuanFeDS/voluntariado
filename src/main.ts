import "@/styles/main.css";
import type { HelpPoint, VolunteerFilter } from "@/types";
import { loadHelpPoints, filterPoints } from "@/services/points";
import { fetchAffectedZones } from "@/services/zoneMap";
import { renderFilters } from "@/ui/filters";
import { renderList } from "@/ui/list";
import { renderMap } from "@/ui/map";
import { renderViewToggle } from "@/ui/viewToggle";
import type { MobileView } from "@/ui/viewToggle";
import { renderZoneToggle } from "@/ui/zoneToggle";
import { hasCoords } from "@/utils/pointFormat";

async function init(): Promise<void> {
  const layout = document.querySelector<HTMLElement>(".app-layout")!;
  const filtersContainer = document.getElementById("filters")!;
  const viewToggleContainer = document.getElementById("view-toggle")!;
  const listContainer = document.getElementById("list")!;
  const mapContainer = document.getElementById("map")!;
  const zoneToggleContainer = document.getElementById("zone-toggle")!;

  let allPoints: HelpPoint[] = [];
  let activeFilter: VolunteerFilter = "todos";

  const mapController = renderMap(mapContainer);
  const viewToggleController = renderViewToggle(viewToggleContainer);

  // Solo tiene efecto visual en mobile (el atributo se lee en la media query
  // de main.css); en desktop cambiarlo es inofensivo porque ambos paneles
  // están siempre visibles ahí.
  function activateView(view: MobileView, onReady?: () => void): void {
    layout.dataset.activeView = view;
    viewToggleController.setActiveView(view);
    if (view === "map") {
      // El contenedor pasa de display:none a visible recién ahora; hay que
      // esperar el siguiente frame antes de medir el mapa (invalidateSize)
      // o de centrarlo (onReady) — si no, Leaflet mide un contenedor de
      // tamaño 0 y el popup queda mal posicionado.
      requestAnimationFrame(() => {
        mapController.invalidateSize();
        onReady?.();
      });
    } else {
      onReady?.();
    }
  }

  layout.dataset.activeView = "list";
  viewToggleController.onChange((view) => activateView(view));

  function renderVisiblePoints(): void {
    const visible = filterPoints(allPoints, activeFilter);
    const listController = renderList(listContainer, visible);
    listController.onSelect((point) => {
      if (!hasCoords(point)) return;
      activateView("map", () => mapController.focusPoint(point));
    });
    mapController.setPoints(visible);
  }

  const filtersController = renderFilters(filtersContainer);
  filtersController.onChange((filter) => {
    activeFilter = filter;
    renderVisiblePoints();
  });

  const zoneToggleController = renderZoneToggle(zoneToggleContainer);
  let zonesLoaded = false;
  zoneToggleController.onChange(async (visible) => {
    if (visible && !zonesLoaded) {
      zonesLoaded = true;
      try {
        mapController.setZones(await fetchAffectedZones());
      } catch {
        zonesLoaded = false;
      }
    }
    mapController.setZonesVisible(visible);
  });

  try {
    allPoints = await loadHelpPoints();
    renderVisiblePoints();
  } catch (error) {
    listContainer.innerHTML = `<p class="list-empty">Error cargando los datos: ${(error as Error).message}</p>`;
  }
}

init();
