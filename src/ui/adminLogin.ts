import { el } from "@/utils/dom";

export interface AdminLoginController {
  onSubmit(handler: (email: string, password: string) => Promise<void>): void;
  showError(message: string): void;
  setPending(pending: boolean): void;
}

export function renderAdminLogin(container: HTMLElement): AdminLoginController {
  container.innerHTML = "";

  const emailInput = el("input", { type: "email", required: true, autocomplete: "username" });
  const passwordInput = el("input", { type: "password", required: true, autocomplete: "current-password" });
  const errorEl = el("p", { className: "form-status form-status--error" });
  const submitButton = el("button", { type: "submit", className: "form-submit", textContent: "Entrar" });

  const form = el("form", { className: "form admin-login-form" }, [
    el("label", { className: "form-field" }, [el("span", { textContent: "Correo" }), emailInput]),
    el("label", { className: "form-field" }, [el("span", { textContent: "Contraseña" }), passwordInput]),
    submitButton,
    errorEl,
  ]);

  container.append(el("h1", { textContent: "Panel de administración" }), form);

  const handlers: ((email: string, password: string) => Promise<void>)[] = [];

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.textContent = "";
    handlers.forEach((handler) => handler(emailInput.value, passwordInput.value));
  });

  return {
    onSubmit(handler) {
      handlers.push(handler);
    },
    showError(message) {
      errorEl.textContent = message;
    },
    setPending(pending) {
      submitButton.disabled = pending;
      submitButton.textContent = pending ? "Entrando…" : "Entrar";
    },
  };
}
