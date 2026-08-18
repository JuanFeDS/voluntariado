# Voluntariado y donaciones en tiempo real — Bogotá

App con lista filtrable + mapa (Leaflet + OpenStreetMap) de puntos de voluntariado/donaciones en Bogotá, más dos formularios públicos para que fundaciones y damnificados se registren directamente.

Los datos viven en Supabase, alimentados por los dos formularios públicos (`fundacion.html`, `damnificado.html`), que insertan directo en Supabase con `status='pendiente'` hasta que alguien los aprueba.

## Estructura

```
.github/workflows/
  geocode-municipios.yml  cron que corre scripts/geocode-municipios.ts
scripts/
  geocode-municipios.ts   geocodifica por departamento+municipio (nunca por dirección exacta) las zonas de victim_requests
src/
  config.ts              constantes compartidas (centro del mapa)
  types.ts                tipos de dominio
  services/
    supabaseClient.ts     cliente de Supabase (browser, clave pública)
    foundationRequests.ts    lee foundation_requests (RLS ya filtra solo aprobados)
    victimRequests.ts        lee la vista victim_requests_public (sin datos sensibles)
    points.ts                combina foundation_requests + victim_requests, aplica filtros
  ui/
    filters.ts             botones de filtro por disponibilidad
    list.ts                 tarjetas de la lista de puntos
    map.ts                  mapa Leaflet y markers
    viewToggle.ts            toggle Lista/Mapa en mobile
  pages/
    fundacion.ts             submit del formulario de fundaciones
    damnificado.ts            submit del formulario de damnificados
  utils/
    formSubmit.ts             ciclo enviando/éxito/error + honeypot anti-spam, compartido por ambos formularios
    html.ts                   escapeHtml + sanitizeHttpUrl (XSS)
fundacion.html / damnificado.html   páginas de los formularios (Vite multi-page)
```

## Modelo de datos (Supabase)

Proyecto: `voluntariado-bogota` (`https://vnngmcfecihzjjvrveae.supabase.co`, región São Paulo, tier free).

- **`foundation_requests`** — formulario de fundaciones/líderes sociales. Inserción pública, pero forzada a entrar como `status='pendiente'` (RLS lo garantiza, no solo el formulario). Solo se ve públicamente si `status='aprobado'`.
- **`victim_requests`** — formulario de damnificados. Inserción pública igual que arriba, pero **sin ningún `SELECT` público**: dirección exacta y teléfono solo se ven desde Supabase Studio. La vista `victim_requests_public` expone únicamente localidad aproximada, tipo de ayuda, urgencia y cantidad de personas de las filas aprobadas — sin coordenadas (evita filtrar la ubicación exacta indirectamente).

Moderación: hoy es manual, revisando `status='pendiente'` directo en Supabase Studio y cambiándolo a `aprobado`/`rechazado`. No hay panel de moderación en la app todavía.

## Setup

```bash
npm install
cp .env.example .env
```

Completá en `.env`:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — para el frontend (clave pública, sin problema si se expone).
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — solo para `scripts/geocode-municipios.ts`. La `service_role` key bypasa RLS: **nunca** va en el frontend ni se commitea. Sacala de Project Settings → API en el dashboard de Supabase.

## Uso

```bash
npm run dev                 # servidor de desarrollo (index.html, fundacion.html, damnificado.html)
npm run geocode-municipios   # geocodifica zonas nuevas de victim_requests (esto es lo que corre el GitHub Action cada 6 horas)
npm run build                 # build de producción (multi-page)
```

Para que el GitHub Action funcione en el repo, hay que configurar los secrets `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en Settings → Secrets and variables → Actions.

`geocode-municipios.ts` respeta el límite de 1 request/segundo de la [política de uso de Nominatim](https://operations.osmfoundation.org/policies/nominatim/) y solo geocodifica zonas (departamento+municipio) que todavía no están en `municipio_coords`.

## Seguridad

- RLS habilitado en las tablas; verificado con pruebas reales contra la API (no solo revisión de código): intentos de leer datos sensibles de `victim_requests` o de auto-aprobarse (`status='aprobado'`) vía `INSERT` directo son rechazados.
- `CHECK` de longitud en todos los campos de texto de inserción pública (protege contra payloads gigantes mandados directo a la API, sin pasar por el HTML).
- Honeypot en ambos formularios (campo oculto; si vive con contenido, se descarta el envío en silencio) como primera capa anti-bot, sin costo ni dependencias externas. Si en la práctica no alcanza, el siguiente escalón es un CAPTCHA (ej. Cloudflare Turnstile, gratis) delante del envío.
- `escapeHtml`/`sanitizeHttpUrl` en todo dato que viene de un formulario público y se renderiza (lista y popups del mapa).
