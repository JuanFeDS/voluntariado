export type MobileView = "list" | "map";

export interface ViewToggleController {
  onChange(handler: (view: MobileView) => void): void;
}

/**
 * Solo tiene efecto visual en mobile (ver media query en main.css);
 * en desktop el toggle queda oculto y ambos paneles se ven siempre.
 */
export function renderViewToggle(container: HTMLElement): ViewToggleController {
  container.innerHTML = "";

  const views: { value: MobileView; label: string }[] = [
    { value: "list", label: "Lista" },
    { value: "map", label: "Mapa" },
  ];

  const buttons = views.map(({ value, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "view-toggle__button";
    button.dataset.view = value;
    button.textContent = label;
    container.appendChild(button);
    return button;
  });

  buttons[0].classList.add("view-toggle__button--active");

  const handlers: ((view: MobileView) => void)[] = [];

  container.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const view = target.dataset.view as MobileView;
    buttons.forEach((button) => button.classList.toggle("view-toggle__button--active", button === target));
    handlers.forEach((handler) => handler(view));
  });

  return {
    onChange(handler) {
      handlers.push(handler);
    },
  };
}
