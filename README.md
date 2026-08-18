# Pega un Grito

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-2.112-3ECF8E?logo=supabase&logoColor=white&style=flat-square" alt="Supabase" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white&style=flat-square" alt="Leaflet" />
</p>

**Pega un Grito** es una plataforma ciudadana que conecta necesidades humanitarias con quienes pueden ayudar: personas afectadas publican pedidos de ayuda y fundaciones/líderes sociales ofrecen puntos de acopio o voluntariado, todo geolocalizado en un mapa y lista filtrable en tiempo real. Nació como un MVP ligero (dos formularios públicos + moderación manual en Supabase Studio) y hoy extiende esa base con un panel de administración propio, mientras sigue una hoja de ruta hacia una especificación funcional más completa.

---

## Tabla de contenido

1. [Contexto y motivación](#1-contexto-y-motivación)
2. [Funcionalidades](#2-funcionalidades)
3. [Hoja de ruta](#3-hoja-de-ruta)
4. [Arquitectura](#4-arquitectura)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Guía de uso](#6-guía-de-uso)
7. [Contacto](#7-contacto)

---

## 1. Contexto y motivación

El proyecto nace para reducir la fricción entre quien necesita ayuda humanitaria y quien puede darla, sin depender de un canal oficial único ni de coordinación manual por redes sociales. `especificacion-funcional.html` ("Especificación funcional — Registro de necesidades humanitarias") describe el producto objetivo a mediano plazo: roles con autenticación, elegibilidad geográfica automática por evento sísmico, e índice de cobertura/equidad para saber "a dónde no está llegando la ayuda". `plan-de-accion.md` traza el camino de fases desde el MVP actual hacia esa especificación, reusando lo que ya existe (RLS, moderación pendiente/aprobado, divulgación progresiva de datos sensibles) en vez de reescribir desde cero.

---

## 2. Funcionalidades

- 🗺️ **Mapa + lista filtrable** (Leaflet + OpenStreetMap) con filtros por tipo de punto (Todo / Acopio / Pedidos / Manos) y semáforo de frescura (verde/ámbar/rojo) según el mejor timestamp disponible.
- 🆘 **Formulario "Necesito ayuda"** (`damnificado.html`) como wizard de 3 pasos (¿Qué necesitan? → ¿Dónde están? → ¿Cómo te contactamos?), con barra de progreso y datos persistentes al navegar.
- 🤝 **Formulario "Puedo ayudar"** (`fundacion.html`) para fundaciones y líderes sociales que ofrecen acopio o voluntariado.
- 🔐 **Panel de administración** (`admin.html`) con autenticación por Supabase Auth (rol admin vía `app_metadata`, nunca editable por el propio usuario) para aprobar, rechazar, editar o eliminar solicitudes.
- 📊 **Dashboard de métricas** en el panel admin (conteos de solicitudes pendientes/aprobadas/rechazadas por tipo).
- 🫧 **Mapa de burbujas de zonas afectadas**, agregando pedidos de ayuda por departamento/municipio sin exponer nunca una dirección individual.
- 🔏 **Divulgación progresiva de datos sensibles**: dirección exacta y teléfono de damnificados nunca se exponen públicamente; solo se ve localidad aproximada, tipo de ayuda, urgencia y cantidad de personas de las solicitudes aprobadas.
- 🛡️ **Seguridad**: RLS en todas las tablas (verificado con pruebas reales contra la API), honeypot anti-spam en ambos formularios, `CHECK` de longitud contra payloads directos a la API, y `escapeHtml`/`sanitizeHttpUrl` en todo dato público que se renderiza.

---

## 3. Hoja de ruta

`plan-de-accion.md` define 7 fases (0 a 6) hacia la especificación funcional completa. Resumen:

| Fase | Foco |
|---|---|
| 0 | Decisiones que bloquean todo: entidad responsable, jurisdicción de hosting, aliados institucionales, municipio piloto, presupuesto de OTP por SMS |
| 1 | Endurecer los cimientos: consentimiento versionado, catálogo estructurado de necesidades, composición del hogar, hash de teléfono, bitácora de auditoría |
| 2 | Motor de elegibilidad geográfica por evento sísmico (bandas A/B/C/D, selección DIVIPOLA en cascada) |
| 3 | Roles y autenticación real: solicitante por OTP, organización verificada por NIT, coordinador/auditor, panel de admin que reemplace la moderación manual |
| 4 | Índice de cobertura y equidad: `cobertura = recibido / requerido`, vista pública "¿a dónde no está llegando?", tarjetas compartibles |
| 5 | Cierre del ciclo: compromiso de organizaciones, divulgación progresiva real, entrega confirmada por SMS |
| 6 | Derechos y cumplimiento: autoservicio de datos, política de privacidad formal, registro ante la SIC si aplica |

Fuera de alcance por ahora (controles de un producto ya en operación real): interruptor de contingencia, detección de extracción masiva, exportación con doble autorización.

---

## 4. Arquitectura

```
.github/workflows/
  geocode-municipios.yml   cron que corre scripts/geocode-municipios.ts (cada 6h)
  deploy-pages.yml          build + deploy a GitHub Pages (pegaungrito.com)
scripts/
  geocode-municipios.ts     geocodifica por departamento+municipio (nunca por dirección exacta) las zonas de victim_requests
src/
  config.ts                 constantes compartidas (centro del mapa)
  types.ts                  tipos de dominio
  services/
    supabaseClient.ts        cliente de Supabase (browser, clave pública)
    foundationRequests.ts    lee foundation_requests (RLS ya filtra solo aprobados)
    victimRequests.ts        lee la vista victim_requests_public (sin datos sensibles)
    points.ts                combina foundation_requests + victim_requests, aplica filtros
    zoneMap.ts                agrega solicitudes de damnificados por municipio para el mapa de burbujas
    adminAuth.ts              login/logout y verificación de app_metadata.is_admin
    adminMetrics.ts           conteos por estado para el dashboard
    adminRequests.ts          aprobar/rechazar/editar/eliminar solicitudes desde el panel
  ui/
    filters.ts                botones de filtro por tipo de punto
    list.ts                    tarjetas de la lista de puntos
    map.ts                     mapa Leaflet y markers
    viewToggle.ts               toggle Lista/Mapa en mobile
    zoneToggle.ts                toggle del mapa de zonas afectadas
    formWizard.ts                wizard genérico de pasos sobre un único <form>
    adminLogin.ts / adminMetrics.ts / adminRequests.ts   UI del panel de administración
  pages/
    fundacion.ts               submit del formulario de fundaciones
    damnificado.ts              submit del formulario de damnificados (wizard)
    admin.ts                    orquesta login + dashboard del panel
  utils/
    formSubmit.ts                ciclo enviando/éxito/error + honeypot anti-spam
    stepper.ts                    contador +/− (número de personas afectadas)
    disclaimerModal.ts             modal cerrable del aviso legal
    html.ts                        escapeHtml + sanitizeHttpUrl (XSS)
index.html / fundacion.html / damnificado.html / admin.html   páginas (Vite multi-page)
```

**Flujo de datos**: los formularios públicos insertan directo en Supabase con `status='pendiente'` (RLS lo garantiza, no solo el formulario). Un admin autenticado los aprueba/rechaza desde `admin.html`. Una vez aprobados, `points.ts` combina `foundation_requests` y `victim_requests_public` para alimentar la lista y el mapa públicos. En paralelo, el cron `geocode-municipios` geocodifica los municipios con solicitudes de damnificados (por zona, nunca por dirección exacta) para alimentar el mapa de burbujas de `zoneMap.ts`.

---

## 5. Modelo de datos

Proyecto Supabase: `voluntariado-bogota` (región São Paulo, tier free).

| Tabla / vista | Rol |
|---|---|
| `foundation_requests` | Formulario de fundaciones/líderes sociales. Inserción pública forzada a `status='pendiente'`; solo visible públicamente si `status='aprobado'`. |
| `victim_requests` | Formulario de damnificados. Inserción pública igual que arriba, pero **sin ningún `SELECT` público** — dirección exacta y teléfono solo se ven desde Supabase Studio. |
| `victim_requests_public` | Vista sobre `victim_requests` que expone únicamente localidad aproximada, tipo de ayuda, urgencia y cantidad de personas de las filas aprobadas — sin coordenadas. |
| `municipio_coords` | Caché de coordenadas por departamento+municipio, poblada por el cron `geocode-municipios`, usada para el mapa de burbujas de zonas afectadas. |

---

## 6. Guía de uso

### Requisitos

- Node.js 22
- Una cuenta/proyecto de Supabase con las tablas y políticas RLS ya creadas

### Instalación

```bash
git clone https://github.com/JuanFeDS/voluntariado.git
cd voluntariado
npm install
cp .env.example .env
```

### Variables de entorno

| Variable | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase, para el frontend (clave pública, segura de exponer) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública del frontend |
| `SUPABASE_URL` | Solo para `scripts/geocode-municipios.ts` (Node) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo para `scripts/geocode-municipios.ts`. Bypasa RLS: **nunca** va en el frontend ni se commitea |

### Ejecutar

```bash
npm run dev   # servidor de desarrollo (index.html, fundacion.html, damnificado.html, admin.html)
```

### Otros comandos

```bash
npm run build                # build de producción (multi-page)
npm run preview              # sirve el build de producción localmente
npm run geocode-municipios   # geocodifica zonas nuevas de victim_requests (lo mismo que corre el GitHub Action cada 6h)
```

Para que el GitHub Action de geocoding funcione en el repo, hay que configurar los secrets `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en Settings → Secrets and variables → Actions.

---

## 7. Contacto

JuanFe — [jmartinezbernal02@gmail.com](mailto:jmartinezbernal02@gmail.com)
