import "@/styles/main.css";
import { supabase } from "@/services/supabaseClient";
import { bindFormSubmit } from "@/utils/formSubmit";
import { renderFormWizard } from "@/ui/formWizard";

const form = document.getElementById("fundacion-form") as HTMLFormElement;
const statusEl = document.getElementById("fundacion-status")!;

renderFormWizard(form, {
  1: () => {
    const nombre = (form.elements.namedItem("nombre_organizacion") as HTMLInputElement).value.trim();
    const direccion = (form.elements.namedItem("direccion") as HTMLInputElement).value.trim();
    if (!nombre) return "Escribí el nombre de la organización o lugar.";
    if (!direccion) return "Escribí la dirección.";
    return null;
  },
});

bindFormSubmit({
  form,
  statusEl,
  successMessage: "¡Gracias! Tu registro quedó pendiente de revisión y pronto será visible en el mapa.",
  honeypotFieldName: "sitio_web",
  successRedirect: "index.html",
  async submit(formData) {
    const { error } = await supabase.from("foundation_requests").insert({
      status: "pendiente",
      nombre_organizacion: formData.get("nombre_organizacion"),
      direccion: formData.get("direccion"),
      localidad: formData.get("localidad") || null,
      necesita_voluntarios: formData.get("necesita_voluntarios"),
      necesita_donaciones: formData.get("necesita_donaciones") === "true",
      tipo_donaciones: formData.get("tipo_donaciones") || null,
      horarios: formData.get("horarios") || null,
      contacto_nombre: formData.get("contacto_nombre") || null,
      contacto_telefono: formData.get("contacto_telefono") || null,
      instagram: formData.get("instagram") || null,
      link_inscripcion: formData.get("link_inscripcion") || null,
      notas: formData.get("notas") || null,
    });

    if (error) throw error;
  },
});
