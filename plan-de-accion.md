# Plan de acción — de `donaciones` a la especificación funcional

Punto de partida: la app actual (mapa/lista + 2 formularios públicos + moderación manual en Supabase Studio). Objetivo: acercarla a `especificacion-funcional.html`. Cada fase referencia los IDs de requisito de la spec (RF-xx, RS-xx, RP-xx) para trazabilidad.

No es un rediseño desde cero — las fases reusan lo que ya existe (RLS, moderación pendiente/aprobado, divulgación progresiva de datos sensibles) y lo extienden.

---

## Fase 0 — Decisiones que bloquean todo (no es código)

Nada de lo de abajo debería empezar a construirse antes de esto. Son tuyas, no mías:

- [ ] **Entidad responsable** del tratamiento de datos (persona jurídica). Sin esto no hay política de privacidad válida (RP-08).
- [ ] **Jurisdicción de hosting**: hoy Supabase está en São Paulo — eso ya es transferencia internacional de facto (RP-09), sin que se haya decidido conscientemente. Confirmar con abogado si hace falta migrar a infraestructura en Colombia o recoger autorización expresa de transferencia.
- [ ] **Aliados institucionales**: mínimo 2-3 organizaciones con capacidad real de entrega comprometidas. Prerrequisito explícito del lanzamiento según la spec (sección 02, nota de riesgo).
- [ ] **Municipio piloto** (la spec sugiere San José del Palmar).
- [ ] **Presupuesto de OTP por SMS**: define si es viable a escala o si hay que evaluar WhatsApp como canal.
- [ ] **¿Registro asistido offline sube a Fase 1?** La spec lo pone en F3, pero si el piloto es una zona sin señal, tiene que estar desde el día uno.

---

## Fase 1 — Endurecer los cimientos (extiende lo que ya existe)

Todo esto se construye sobre las tablas `foundation_requests`/`victim_requests` actuales, sin arquitectura nueva.

- [ ] **Consentimiento versionado** (RP-01, entidad `consentimiento`): checkbox no premarcado + versión de política + timestamp, en vez del texto de aviso actual sin registro.
- [ ] **Catálogo estructurado de necesidades** (RF-x, sección 05): tabla `catalogo_necesidad` (categoría, ítem, unidad), editable por admin, reemplaza los checkboxes de texto libre (`Alimento`, `Refugio`, ...) del formulario de damnificados.
- [ ] **Composición del hogar**: agregar `n_personas`, `n_menores`, `n_mayores_60`, `n_gestantes`, `n_discapacidad` a `victim_requests` (privados, igual que dirección/teléfono).
- [ ] **Hash de teléfono para deduplicación** (RS-10): columna `telefono_hash` además de `telefono_contacto`, para detectar duplicados sin tener que descifrar/exponer el número.
- [ ] **Bitácora de auditoría** (RS-07): tabla `auditoria` (actor, acción, entidad, filtro usado, ip, timestamp). Sin esto, RS-06 (divulgación progresiva) no es verificable.

## Fase 2 — Motor de elegibilidad geográfica (sección 04)

Pieza nueva, no toca lo existente.

- [ ] Tabla `evento_sismico` (lat, lon, profundidad_km, magnitud, bandas, activo) — editable en Supabase Studio, sin UI de admin todavía.
- [ ] Tabla `municipio` (código DIVIPOLA, nombre, departamento, centroide, nivel_oficial, fuente) — seed inicial con la lista oficial de municipios afectados.
- [ ] Función de distancia hipocentral (Haversine + corrección de profundidad) — como función de Postgres o cálculo en el momento del registro.
- [ ] Clasificación en bandas A/B/C/D + regla de composición `MAX(banda, nivel_oficial)` (RF-06).
- [ ] Reemplazar el campo libre "Localidad o barrio aproximado" del formulario de damnificados por selección DIVIPOLA en cascada (departamento → municipio → vereda) + banda calculada.
- [ ] Cola de revisión manual para banda D (RF-07) — nunca rechazo automático.

## Fase 3 — Roles y autenticación (el salto más grande)

Hoy no existe ningún login. Esta fase introduce Supabase Auth.

- [ ] **R1 Solicitante** por OTP (Supabase Auth, proveedor de teléfono) — depende de la decisión de presupuesto SMS de la Fase 0.
- [ ] **R3 Organización** verificada por NIT: flujo de registro + aprobación manual por admin antes de activar (RS-08).
- [ ] **R4 Coordinador** y **R6 Auditor**: roles vía `app_metadata` (nunca `user_metadata`, ver nota de seguridad abajo), no vía tablas propias de permisos.
- [ ] Panel de admin real que reemplace la moderación manual en Supabase Studio (aprobar/rechazar, ver cola de revisión banda D, verificar organizaciones).

**Nota de seguridad para cuando se implemente:** la autorización de roles debe vivir en `raw_app_meta_data`, nunca en `raw_user_meta_data` (ese lo puede editar el propio usuario). Repasar el checklist de RLS del skill de Supabase antes de tocar políticas nuevas.

## Fase 4 — Índice de cobertura y equidad (el producto real, sección 08)

Esto es lo que la spec llama "la razón de ser de la plataforma" y hoy no existe nada.

- [ ] Query de agregación `cobertura(municipio, categoría) = recibido / requerido`, más brecha absoluta.
- [ ] Estado distinto y visualmente separado para "sin datos" vs "cubierto" (la distinción que la spec marca como la más importante de todo el tablero).
- [ ] Indicador de concentración urbana (ayuda en las 5 ciudades principales vs. proporción de necesidad ahí).
- [ ] Vista pública sin login (extiende el mapa/lista actual, que ya es público) con la pregunta "¿a dónde no está llegando?" al frente.
- [ ] Tarjetas compartibles generadas automáticamente (RF-12) para campañas/creadores de contenido.
- [ ] Enlaces directos por municipio/categoría (RF-13) + hora de última actualización siempre visible (RF-14).

## Fase 5 — Cierre del ciclo: compromiso y entrega (F3 de la spec)

- [ ] Entidad `compromiso`: una organización reclama un lote de solicitudes con fecha estimada.
- [ ] Al confirmar compromiso (y solo entonces) se libera contacto + ubicación exacta de ese lote — divulgación progresiva real (RS-06), hoy solo existe el placeholder conceptual.
- [ ] Expiración automática de compromisos incumplidos, las solicitudes vuelven al pozo común.
- [ ] Entidad `entrega`: reporte de entrega + confirmación del hogar por SMS (72h) + descuento de ítems de la solicitud.

## Fase 6 — Derechos y cierre de cumplimiento (F5 de la spec)

- [ ] Autoservicio: consultar, corregir, exportar y suprimir sus propios datos (RP-06).
- [ ] Canal por correo para quien no pueda entrar a la cuenta.
- [ ] Política de privacidad formal, en lenguaje claro, accesible antes del primer dato capturado (RP-12).
- [ ] Confirmar con abogado si aplica Registro Nacional de Bases de Datos ante la SIC (RP-07).

---

## Qué NO está en este plan

- Interruptor de contingencia (RS-15), detección de extracción masiva (RS-09) y exportación con doble autorización (RS-11) quedan para después de la Fase 5 — son controles de un producto ya en operación real con datos sensibles cargados, prematuros mientras no haya Fase 3-4 funcionando.
- Todo lo de la Fase 0 que no depende de código: eso se resuelve fuera de este repo.
