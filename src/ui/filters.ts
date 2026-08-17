import type { PointFilter } from "@/types";

export interface FiltersController {
  onChange(handler: (filter: PointFilter) => void): void;
}

const OPTIONS: { value: PointFilter; label: string }[] = [
  { value: "todos", label: "Todo" },
  { value: "acopio", label: "Acopio" },
  { value: "pedidos", label: "Pedidos" },
  { value: "manos", label: "Manos" },
];

export function renderFilters(container: HTMLElement): FiltersController {
  container.innerHTML = "";

  const group = document.createElement("div");
  group.className = "filter-group";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", "Filtrar por tipo de punto");

  const buttons = OPTIONS.map(({ value, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.value = value;
    button.textContent = label;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", value === "todos" ? "true" : "false");
    group.appendChild(button);
    return button;
  });

  buttons[0].classList.add("filter-button--active");
  container.appendChild(group);

  const handlers: ((filter: PointFilter) => void)[] = [];

  group.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const filter = target.dataset.value as PointFilter;
    buttons.forEach((button) => {
      const isActive = button === target;
      button.classList.toggle("filter-button--active", isActive);
      button.setAttribute("aria-checked", String(isActive));
    });

    handlers.forEach((handler) => handler(filter));
  });

  return {
    onChange(handler) {
      handlers.push(handler);
    },
  };
}
