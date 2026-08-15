export interface FormSubmitOptions {
  form: HTMLFormElement;
  statusEl: HTMLElement;
  submit: (formData: FormData) => Promise<void>;
  successMessage: string;
  /** Nombre del campo trampa (oculto por CSS, invisible para humanos). Si viene con
   * contenido, es casi seguro un bot rellenando todos los campos: se finge éxito
   * sin insertar nada, para no darle al bot ninguna señal de que fue detectado. */
  honeypotFieldName: string;
}

/** Maneja el ciclo enviando/éxito/error común a los formularios públicos. */
export function bindFormSubmit({ form, statusEl, submit, successMessage, honeypotFieldName }: FormSubmitOptions): void {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    if (formData.get(honeypotFieldName)) {
      statusEl.className = "form-status form-status--success";
      statusEl.textContent = successMessage;
      form.reset();
      return;
    }

    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    statusEl.className = "form-status form-status--pending";
    statusEl.textContent = "Enviando...";

    try {
      await submit(formData);
      statusEl.className = "form-status form-status--success";
      statusEl.textContent = successMessage;
      form.reset();
    } catch (error) {
      statusEl.className = "form-status form-status--error";
      statusEl.textContent = `No se pudo enviar: ${(error as Error).message}`;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
