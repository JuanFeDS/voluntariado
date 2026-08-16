import "@/styles/main.css";
import { supabase } from "@/services/supabaseClient";
import { bindFormSubmit } from "@/utils/formSubmit";

const form = document.getElementById("damnificado-form") as HTMLFormElement;
const statusEl = document.getElementById("damnificado-status")!;

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
