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
      localidad_aprox: formData.get("localidad_aprox"),
      direccion_exacta: formData.get("direccion_exacta"),
      telefono_contacto: formData.get("telefono_contacto") || null,
      numero_personas_afectadas: numeroPersonas ? Number(numeroPersonas) : null,
      tipo_ayuda: tipoAyuda,
      urgencia: formData.get("urgencia"),
      notas: formData.get("notas") || null,
    });

    if (error) throw error;
  },
});
