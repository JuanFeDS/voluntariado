export interface FormSubmitOptions {
  form: HTMLFormElement;
  statusEl: HTMLElement;
  submit: (formData: FormData) => Promise<void>;
  successMessage: string;
  /** Nombre del campo trampa (oculto por CSS, invisible para humanos). Si viene con
   * contenido, es casi seguro un bot rellenando todos los campos: se finge éxito
   * sin insertar nada, para no darle al bot ninguna señal de que fue detectado. */
  honeypotFieldName: string;
  /** Si viene, redirige ahí tras el envío exitoso (deja ver el mensaje de éxito un momento antes). */
  successRedirect?: string;
}

const SUCCESS_REDIRECT_DELAY_MS = 1500;

/** Maneja el ciclo enviando/éxito/error común a los formularios públicos. */
export function bindFormSubmit({ form, statusEl, submit, successMessage, honeypotFieldName, successRedirect }: FormSubmitOptions): void {
  function goToSuccess(): void {
    statusEl.className = "form-status form-status--success";
    statusEl.textContent = successMessage;
    form.reset();
    if (successRedirect) {
      setTimeout(() => {
        window.location.href = successRedirect;
      }, SUCCESS_REDIRECT_DELAY_MS);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    if (formData.get(honeypotFieldName)) {
      goToSuccess();
      return;
    }

    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    statusEl.className = "form-status form-status--pending";
    statusEl.textContent = "Enviando...";

    try {
      await submit(formData);
      goToSuccess();
    } catch (error) {
      statusEl.className = "form-status form-status--error";
      statusEl.textContent = `No se pudo enviar: ${(error as Error).message}`;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
