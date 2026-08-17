import "@/styles/main.css";
import { supabase } from "@/services/supabaseClient";
import { bindFormSubmit } from "@/utils/formSubmit";
import { bindStepper } from "@/utils/stepper";
import { bindDisclaimerModal } from "@/utils/disclaimerModal";
import { renderFormWizard } from "@/ui/formWizard";

const form = document.getElementById("damnificado-form") as HTMLFormElement;
const statusEl = document.getElementById("damnificado-status")!;

document.querySelectorAll<HTMLElement>("[data-stepper]").forEach(bindStepper);
bindDisclaimerModal("disclaimer-modal");

renderFormWizard(form, {
  1: () => (form.querySelectorAll('input[name="tipo_ayuda"]:checked').length === 0 ? "Marcá al menos un tipo de ayuda que necesitás." : null),
  2: () => {
    const departamento = (form.elements.namedItem("departamento") as HTMLSelectElement).value;
    const municipio = (form.elements.namedItem("municipio") as HTMLInputElement).value.trim();
    const direccion = (form.elements.namedItem("direccion_exacta") as HTMLInputElement).value.trim();
    if (!departamento) return "Seleccioná tu departamento.";
    if (!municipio) return "Escribí el municipio.";
    if (!direccion) return "Escribí la dirección exacta.";
    return null;
  },
});

bindFormSubmit({
  form,
  statusEl,
  successMessage: "¡Gracias! Tu solicitud quedó pendiente de revisión.",
  honeypotFieldName: "sitio_web",
  async submit(formData) {
    const tipoAyuda = formData.getAll("tipo_ayuda").join(", ");
    if (!tipoAyuda) {
      throw new Error("Marcá al menos un tipo de ayuda que necesitás.");
    }

    const numeroPersonas = formData.get("numero_personas_afectadas");

    const { error } = await supabase.from("victim_requests").insert({
      status: "pendiente",
      nombre_contacto: formData.get("nombre_contacto") || null,
      departamento: formData.get("departamento"),
      municipio: formData.get("municipio"),
      barrio_vereda: formData.get("barrio_vereda") || null,
      direccion_exacta: formData.get("direccion_exacta"),
      alcaldia_cercana: formData.get("alcaldia_cercana") || null,
      telefono_contacto: formData.get("telefono_contacto") || null,
      numero_personas_afectadas: numeroPersonas ? Number(numeroPersonas) : null,
      tipo_ayuda: tipoAyuda,
      urgencia: formData.get("urgencia"),
      recibio_ayuda_antes: formData.get("recibio_ayuda_antes") === "true",
      notas: formData.get("notas") || null,
    });

    if (error) throw error;
  },
});
