import "@/styles/main.css";
import type { HelpPoint, VolunteerFilter } from "@/types";
import { loadHelpPoints, filterPoints } from "@/services/points";
import { renderFilters } from "@/ui/filters";
import { renderList } from "@/ui/list";
import { renderMap } from "@/ui/map";
import { renderViewToggle } from "@/ui/viewToggle";

async function init(): Promise<void> {
  const layout = document.querySelector<HTMLElement>(".app-layout")!;
  const filtersContainer = document.getElementById("filters")!;
  const viewToggleContainer = document.getElementById("view-toggle")!;
  const listContainer = document.getElementById("list")!;
  const mapContainer = document.getElementById("map")!;

  let allPoints: HelpPoint[] = [];
  let activeFilter: VolunteerFilter = "todos";

  const mapController = renderMap(mapContainer);

  layout.dataset.activeView = "list";
  const viewToggleController = renderViewToggle(viewToggleContainer);
  viewToggleController.onChange((view) => {
    layout.dataset.activeView = view;
    if (view === "map") {
      // El contenedor pasa de display:none a visible recién ahora;
      // Leaflet necesita el siguiente frame para medirlo bien.
      requestAnimationFrame(() => mapController.invalidateSize());
    }
  });

  function renderVisiblePoints(): void {
    const visible = filterPoints(allPoints, activeFilter);
    const listController = renderList(listContainer, visible);
    listController.onSelect((point) => mapController.focusPoint(point));
    mapController.setPoints(visible);
  }

  const filtersController = renderFilters(filtersContainer);
  filtersController.onChange((filter) => {
    activeFilter = filter;
    renderVisiblePoints();
  });

  try {
    allPoints = await loadHelpPoints();
    renderVisiblePoints();
  } catch (error) {
    listContainer.innerHTML = `<p class="list-empty">Error cargando los datos: ${(error as Error).message}</p>`;
  }
}

init();
