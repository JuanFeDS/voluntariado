import type { AdminMetrics } from "@/services/adminMetrics";
import { el } from "@/utils/dom";

export function renderAdminMetrics(container: HTMLElement, metrics: AdminMetrics): void {
  container.innerHTML = "";

  const cards = [
    { label: "Fundaciones pendientes", value: String(metrics.foundationCounts.pendiente) },
    { label: "Fundaciones aprobadas", value: String(metrics.foundationCounts.aprobado) },
    { label: "Damnificados pendientes", value: String(metrics.victimCounts.pendiente) },
    { label: "Damnificados aprobados", value: String(metrics.victimCounts.aprobado) },
  ];

  const grid = el(
    "div",
    { className: "admin-metrics-grid" },
    cards.map((card) => el("div", { className: "admin-metric-card" }, [
      el("span", { className: "admin-metric-card__value", textContent: card.value }),
      el("span", { className: "admin-metric-card__label", textContent: card.label }),
    ])),
  );

  container.append(grid);
}
