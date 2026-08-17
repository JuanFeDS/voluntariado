export interface FormWizardController {
  goToStep(step: number): void;
}

/**
 * Wizard de pasos sobre un único <form>: los pasos son secciones [data-step]
 * que se muestran/ocultan, no formularios separados — así el FormData del
 * submit sigue trayendo todos los campos sin importar en qué paso quedaron.
 */
export function renderFormWizard(form: HTMLFormElement, validators: Record<number, () => string | null>): FormWizardController {
  const steps = Array.from(form.querySelectorAll<HTMLElement>("[data-wizard-step]"));
  const totalSteps = steps.length;
  const progressBars = Array.from(form.querySelectorAll<HTMLElement>("[data-wizard-progress] > *"));
  const backButton = form.querySelector<HTMLButtonElement>("[data-wizard-back]")!;
  const nextButton = form.querySelector<HTMLButtonElement>("[data-wizard-next]")!;
  const submitButton = form.querySelector<HTMLButtonElement>("[data-wizard-submit]")!;
  const errorEl = form.querySelector<HTMLElement>("[data-wizard-error]");

  let current = 1;

  function render(): void {
    steps.forEach((stepEl) => {
      stepEl.hidden = Number(stepEl.dataset.wizardStep) !== current;
    });
    progressBars.forEach((bar, index) => {
      bar.classList.toggle("wizard-progress__bar--active", index < current);
    });
    backButton.hidden = current === 1;
    nextButton.hidden = current === totalSteps;
    submitButton.hidden = current !== totalSteps;
    if (errorEl) errorEl.textContent = "";
  }

  function goToStep(step: number): void {
    current = Math.min(totalSteps, Math.max(1, step));
    render();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  nextButton.addEventListener("click", () => {
    const error = validators[current]?.();
    if (error) {
      if (errorEl) errorEl.textContent = error;
      return;
    }
    goToStep(current + 1);
  });

  backButton.addEventListener("click", () => goToStep(current - 1));
  form.addEventListener("reset", () => goToStep(1));

  render();

  return { goToStep };
}
