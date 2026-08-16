import "@/styles/main.css";
import type { FoundationRequestAdmin, VictimRequestAdmin } from "@/types";
import { getAdminSession, signInAdmin, signOutAdmin } from "@/services/adminAuth";
import {
  deleteFoundationRequest,
  deleteVictimRequest,
  fetchAllFoundationRequests,
  fetchAllVictimRequests,
  setFoundationRequestStatus,
  setVictimRequestStatus,
  updateFoundationRequest,
  updateVictimRequest,
} from "@/services/adminRequests";
import { fetchAdminMetrics } from "@/services/adminMetrics";
import { renderAdminLogin } from "@/ui/adminLogin";
import { renderAdminMetrics } from "@/ui/adminMetrics";
import { renderRequestSection } from "@/ui/adminRequests";
import type { FieldConfig } from "@/ui/adminRequests";

const loginContainer = document.getElementById("admin-login")!;
const dashboard = document.getElementById("admin-dashboard")!;
const userEmailEl = document.getElementById("admin-user-email")!;
const logoutButton = document.getElementById("admin-logout")!;
const metricsContainer = document.getElementById("admin-metrics")!;
const foundationContainer = document.getElementById("admin-foundation-requests")!;
const victimContainer = document.getElementById("admin-victim-requests")!;

const FOUNDATION_FIELDS: FieldConfig<FoundationRequestAdmin>[] = [
  { key: "direccion", label: "Dirección", type: "text" },
  { key: "localidad", label: "Localidad", type: "text" },
  {
    key: "necesitaVoluntarios",
    label: "¿Necesitan voluntarios?",
    type: "select",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
      { value: "revisando", label: "Revisando información" },
    ],
  },
  { key: "necesitaDonaciones", label: "Necesitan donaciones", type: "checkbox" },
  { key: "tipoDonaciones", label: "Tipo de donaciones", type: "text" },
  { key: "horarios", label: "Horarios", type: "text" },
  { key: "contactoNombre", label: "Nombre de contacto", type: "text" },
  { key: "contactoTelefono", label: "Teléfono de contacto", type: "text" },
  { key: "instagram", label: "Instagram", type: "text" },
  { key: "linkInscripcion", label: "Link de inscripción", type: "text" },
  { key: "notas", label: "Notas", type: "textarea" },
];

const VICTIM_FIELDS: FieldConfig<VictimRequestAdmin>[] = [
  { key: "nombreContacto", label: "Nombre de contacto", type: "text" },
  { key: "departamento", label: "Departamento", type: "text" },
  { key: "municipio", label: "Municipio", type: "text" },
  { key: "barrioVereda", label: "Barrio / vereda (privado)", type: "text" },
  { key: "direccionExacta", label: "Dirección exacta (privada)", type: "text" },
  { key: "alcaldiaCercana", label: "Alcaldía más cercana (privada)", type: "text" },
  { key: "telefonoContacto", label: "Teléfono (privado)", type: "text" },
  { key: "numeroPersonasAfectadas", label: "Personas afectadas", type: "number" },
  { key: "tipoAyuda", label: "Tipo de ayuda", type: "text" },
  {
    key: "urgencia",
    label: "Urgencia",
    type: "select",
    options: [
      { value: "alta", label: "Alta" },
      { value: "media", label: "Media" },
      { value: "baja", label: "Baja" },
    ],
  },
  { key: "recibioAyudaAntes", label: "¿Ya había recibido ayuda antes?", type: "checkbox" },
  { key: "notas", label: "Notas", type: "textarea" },
];

async function loadDashboard(): Promise<void> {
  const [metrics, foundationRequests, victimRequests] = await Promise.all([
    fetchAdminMetrics(),
    fetchAllFoundationRequests(),
    fetchAllVictimRequests(),
  ]);

  renderAdminMetrics(metricsContainer, metrics);

  renderRequestSection(foundationContainer, foundationRequests, {
    title: "Fundaciones y puntos de acopio",
    fields: FOUNDATION_FIELDS,
    titleOf: (item) => item.nombreOrganizacion,
    handlers: {
      async onApprove(item) {
        await setFoundationRequestStatus(item.id, "aprobado");
        await loadDashboard();
      },
      async onReject(item) {
        await setFoundationRequestStatus(item.id, "rechazado");
        await loadDashboard();
      },
      async onDelete(item) {
        await deleteFoundationRequest(item.id);
        await loadDashboard();
      },
      async onSave(item, edits) {
        await updateFoundationRequest(item.id, edits);
        await loadDashboard();
      },
    },
  });

  renderRequestSection(victimContainer, victimRequests, {
    title: "Solicitudes de damnificados",
    fields: VICTIM_FIELDS,
    titleOf: (item) => item.nombreContacto || `${item.municipio}, ${item.departamento}`,
    handlers: {
      async onApprove(item) {
        await setVictimRequestStatus(item.id, "aprobado");
        await loadDashboard();
      },
      async onReject(item) {
        await setVictimRequestStatus(item.id, "rechazado");
        await loadDashboard();
      },
      async onDelete(item) {
        await deleteVictimRequest(item.id);
        await loadDashboard();
      },
      async onSave(item, edits) {
        await updateVictimRequest(item.id, edits);
        await loadDashboard();
      },
    },
  });
}

async function showDashboard(email: string): Promise<void> {
  loginContainer.hidden = true;
  dashboard.hidden = false;
  userEmailEl.textContent = email;
  await loadDashboard();
}

function showLogin(): void {
  dashboard.hidden = true;
  loginContainer.hidden = false;
}

async function init(): Promise<void> {
  const loginController = renderAdminLogin(loginContainer);

  loginController.onSubmit(async (email, password) => {
    loginController.setPending(true);
    try {
      const admin = await signInAdmin(email, password);
      await showDashboard(admin.email);
    } catch (error) {
      loginController.showError((error as Error).message);
    } finally {
      loginController.setPending(false);
    }
  });

  logoutButton.addEventListener("click", async () => {
    await signOutAdmin();
    showLogin();
  });

  const session = await getAdminSession();
  if (session) {
    await showDashboard(session.email);
  } else {
    showLogin();
  }
}

init();
