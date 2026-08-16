import type { RequestStatus } from "@/types";
import { el } from "@/utils/dom";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "number";
  options?: FieldOption[];
}

interface BaseItem {
  id: string;
  status: RequestStatus;
  createdAt: string;
}

export interface RequestHandlers<T extends BaseItem> {
  onApprove(item: T): Promise<void>;
  onReject(item: T): Promise<void>;
  onDelete(item: T): Promise<void>;
  onSave(item: T, edits: Partial<T>): Promise<void>;
}

export interface RequestSectionConfig<T extends BaseItem> {
  title: string;
  fields: FieldConfig<T>[];
  titleOf(item: T): string;
  handlers: RequestHandlers<T>;
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

const STATUS_BADGE_VARIANT: Record<RequestStatus, string> = {
  pendiente: "revisando",
  aprobado: "otro",
  rechazado: "necesitan",
};

export function renderRequestSection<T extends BaseItem>(
  container: HTMLElement,
  items: T[],
  config: RequestSectionConfig<T>,
): void {
  container.innerHTML = "";

  let activeFilter: RequestStatus | "todos" = items.some((item) => item.status === "pendiente") ? "pendiente" : "todos";

  const heading = el("h2", { className: "admin-section__title", textContent: `${config.title} (${items.length})` });
  const tabs = el("div", { className: "filter-group" });
  const list = el("div", { className: "admin-card-list" });

  const filters: { value: RequestStatus | "todos"; label: string }[] = [
    { value: "pendiente", label: "Pendientes" },
    { value: "aprobado", label: "Aprobados" },
    { value: "rechazado", label: "Rechazados" },
    { value: "todos", label: "Todos" },
  ];

  function renderTabs(): void {
    tabs.innerHTML = "";
    filters.forEach((filter) => {
      const count = filter.value === "todos" ? items.length : items.filter((item) => item.status === filter.value).length;
      const button = el(
        "button",
        {
          type: "button",
          className: `filter-button${activeFilter === filter.value ? " filter-button--active" : ""}`,
          textContent: `${filter.label} (${count})`,
        },
        [],
      );
      button.addEventListener("click", () => {
        activeFilter = filter.value;
        renderTabs();
        renderList();
      });
      tabs.append(button);
    });
  }

  function renderList(): void {
    list.innerHTML = "";
    const visible = activeFilter === "todos" ? items : items.filter((item) => item.status === activeFilter);

    if (visible.length === 0) {
      list.append(el("p", { className: "admin-empty", textContent: "No hay solicitudes en este filtro." }));
      return;
    }

    visible.forEach((item) => list.append(renderCard(item)));
  }

  function renderCard(item: T): HTMLElement {
    const card = el("article", { className: "admin-card" });
    card.dataset.status = item.status;

    renderViewMode(card, item);
    return card;
  }

  function renderViewMode(card: HTMLElement, item: T): void {
    card.innerHTML = "";

    const header = el("div", { className: "admin-card__header" }, [
      el("strong", { textContent: config.titleOf(item) }),
      el("span", { className: `badge badge--${STATUS_BADGE_VARIANT[item.status]}`, textContent: STATUS_LABEL[item.status] }),
    ]);
    card.append(header);

    card.append(
      el("p", {
        className: "admin-card__meta",
        textContent: new Date(item.createdAt).toLocaleString("es-CO"),
      }),
    );

    const fieldsList = el("dl", { className: "admin-card__fields" });
    config.fields.forEach((field) => {
      const rawValue = item[field.key];
      const displayValue = formatFieldValue(rawValue, field);
      if (!displayValue) return;
      fieldsList.append(el("dt", { textContent: field.label }), el("dd", { textContent: displayValue }));
    });
    card.append(fieldsList);

    const actions = el("div", { className: "admin-card__actions" });

    if (item.status !== "aprobado") {
      const approveButton = el("button", { type: "button", className: "admin-action admin-action--approve", textContent: "Aprobar" });
      approveButton.addEventListener("click", () => runAction(card, () => config.handlers.onApprove(item)));
      actions.append(approveButton);
    }

    if (item.status !== "rechazado") {
      const rejectButton = el("button", { type: "button", className: "admin-action admin-action--reject", textContent: "Rechazar" });
      rejectButton.addEventListener("click", () => runAction(card, () => config.handlers.onReject(item)));
      actions.append(rejectButton);
    }

    const editButton = el("button", { type: "button", className: "admin-action admin-action--edit", textContent: "Editar" });
    editButton.addEventListener("click", () => renderEditMode(card, item));
    actions.append(editButton);

    const deleteButton = el("button", { type: "button", className: "admin-action admin-action--delete", textContent: "Eliminar" });
    deleteButton.addEventListener("click", () => {
      if (!confirm(`¿Eliminar definitivamente "${config.titleOf(item)}"? Esta acción no se puede deshacer.`)) return;
      runAction(card, () => config.handlers.onDelete(item));
    });
    actions.append(deleteButton);

    card.append(actions);
  }

  function renderEditMode(card: HTMLElement, item: T): void {
    card.innerHTML = "";
    card.append(el("strong", { textContent: `Editando: ${config.titleOf(item)}` }));

    const form = el("div", { className: "admin-edit-form" });
    const inputs = new Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>();

    config.fields.forEach((field) => {
      const value = item[field.key];
      const label = el("label", { className: "form-field" }, [el("span", { textContent: field.label })]);

      if (field.type === "textarea") {
        const textarea = el("textarea", { rows: 3, value: String(value ?? "") });
        label.append(textarea);
        inputs.set(field.key, textarea);
      } else if (field.type === "select") {
        const select = el("select", {}, (field.options ?? []).map((opt) => new Option(opt.label, opt.value, false, opt.value === value)));
        label.append(select);
        inputs.set(field.key, select);
      } else if (field.type === "checkbox") {
        const checkbox = el("input", { type: "checkbox", checked: Boolean(value) });
        label.className = "form-field form-field--checkbox";
        label.innerHTML = "";
        label.append(checkbox, el("span", { textContent: field.label }));
        inputs.set(field.key, checkbox);
      } else {
        const input = el("input", { type: field.type === "number" ? "number" : "text", value: String(value ?? "") });
        label.append(input);
        inputs.set(field.key, input);
      }

      form.append(label);
    });

    card.append(form);

    const actions = el("div", { className: "admin-card__actions" });

    const saveButton = el("button", { type: "button", className: "admin-action admin-action--approve", textContent: "Guardar cambios" });
    saveButton.addEventListener("click", () => {
      const edits: Partial<T> = {};
      config.fields.forEach((field) => {
        const inputEl = inputs.get(field.key)!;
        if (field.type === "checkbox") {
          edits[field.key] = (inputEl as HTMLInputElement).checked as T[keyof T];
        } else if (field.type === "number") {
          const raw = (inputEl as HTMLInputElement).value;
          edits[field.key] = (raw === "" ? null : Number(raw)) as T[keyof T];
        } else {
          edits[field.key] = inputEl.value as T[keyof T];
        }
      });
      runAction(card, () => config.handlers.onSave(item, edits));
    });
    actions.append(saveButton);

    const cancelButton = el("button", { type: "button", className: "admin-action admin-action--delete", textContent: "Cancelar" });
    cancelButton.addEventListener("click", () => renderViewMode(card, item));
    actions.append(cancelButton);

    card.append(actions);
  }

  async function runAction(card: HTMLElement, action: () => Promise<void>): Promise<void> {
    const buttons = card.querySelectorAll<HTMLButtonElement>("button");
    buttons.forEach((button) => (button.disabled = true));
    try {
      await action();
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
      buttons.forEach((button) => (button.disabled = false));
    }
  }

  renderTabs();
  renderList();

  container.append(heading, tabs, list);
}

function formatFieldValue<T>(value: T[keyof T], field: FieldConfig<T>): string {
  if (value === null || value === undefined || value === "") return "";
  if (field.type === "checkbox") return value ? "Sí" : "";
  if (field.type === "select") {
    return field.options?.find((opt) => opt.value === value)?.label ?? String(value);
  }
  return String(value);
}
