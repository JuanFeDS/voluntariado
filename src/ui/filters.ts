import type { VolunteerFilter } from "@/types";

export interface FiltersController {
  onChange(handler: (filter: VolunteerFilter) => void): void;
}

const OPTIONS: { value: VolunteerFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "necesitan", label: "Necesitan voluntarios" },
  { value: "revisando", label: "Revisando información" },
];

export function renderFilters(container: HTMLElement): FiltersController {
  container.innerHTML = "";

  const group = document.createElement("div");
  group.className = "filter-group";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", "Filtrar por disponibilidad de voluntariado");

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

  const handlers: ((filter: VolunteerFilter) => void)[] = [];

  group.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const filter = target.dataset.value as VolunteerFilter;
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
