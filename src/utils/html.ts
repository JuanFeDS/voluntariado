export function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

/**
 * Los datos de link (instagram, WhatsApp, inscripción) vienen de formularios
 * públicos. escapeHtml protege contra inyección de tags, pero no contra un
 * href="javascript:..." — eso pasa entero por escapeHtml sin cambios porque
 * no tiene caracteres especiales de HTML. Por eso se valida el esquema aparte.
 */
export function sanitizeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}
