export function bindStepper(container: HTMLElement): void {
  const input = container.querySelector<HTMLInputElement>("[data-stepper-input]");
  const display = container.querySelector<HTMLElement>("[data-stepper-value]");
  if (!input || !display) return;

  const min = Number(input.min || "1");
  const max = Number(input.max || "100000");

  function render(): void {
    display!.textContent = input!.value || "—";
  }

  container.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.step);

      if (!input!.value) {
        if (step > 0) input!.value = String(min);
        render();
        return;
      }

      const next = Number(input!.value) + step;
      input!.value = next < min ? "" : String(Math.min(max, next));
      render();
    });
  });

  render();
}
