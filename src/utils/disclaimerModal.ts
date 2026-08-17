export function bindDisclaimerModal(dialogId: string): void {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
  if (!dialog) return;

  dialog.querySelector("[data-close-disclaimer]")?.addEventListener("click", () => dialog.close());

  // Cerrar al tocar el fondo (fuera del cuadro del aviso), no solo con el botón.
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedInside =
      event.clientY >= rect.top && event.clientY <= rect.bottom && event.clientX >= rect.left && event.clientX <= rect.right;
    if (!clickedInside) dialog.close();
  });

  dialog.showModal();
}
