export interface ZoneToggleController {
  onChange(handler: (visible: boolean) => void): void;
}

export function renderZoneToggle(container: HTMLElement): ZoneToggleController {
  container.innerHTML = "";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "zone-toggle-checkbox";

  const label = document.createElement("label");
  label.className = "zone-toggle";
  label.htmlFor = "zone-toggle-checkbox";
  label.append(checkbox, document.createTextNode(" Ver zonas afectadas (por municipio)"));

  container.append(label);

  const handlers: ((visible: boolean) => void)[] = [];
  checkbox.addEventListener("change", () => {
    handlers.forEach((handler) => handler(checkbox.checked));
  });

  return {
    onChange(handler) {
      handlers.push(handler);
    },
  };
}
