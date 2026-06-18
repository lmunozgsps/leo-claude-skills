---
name: raml-api-spec
description: Use when creating, designing, validating, auditing, or fixing RAML 1.0 API specifications for MuleSoft Anypoint Platform. Triggers include requests to write a RAML spec or API contract, design an API in RAML, review/audit an existing .raml file, check a RAML spec for structure, security, input sanitization, or best practices, validate RAML against the AMF parser, or prepare RAML fragments for Design Center/Exchange. Covers RAML 1.0 only (root API + DataType/Trait/ResourceType/SecurityScheme/Library fragments). Do NOT use for OpenAPI/Swagger specs, RAML 0.8, generating full Mule runtime projects/flows, or DataWeave transformation logic.
license: MIT
metadata:
  author: lmunozgsps
  version: "1.0.0"
  domain: api-design
  platform: MuleSoft Anypoint Platform
  raml-version: "1.0"
---

# RAML API Spec (Anypoint)

Crea y audita especificaciones de API en **RAML 1.0** para Anypoint Platform,
validando estructura, seguridad, sanitización de inputs y buenas prácticas.
Valida con **AMF** (`amf-client-js`), el mismo motor de parseo de Anypoint.

## Detectar el modo

- **CREAR**: el usuario quiere una spec nueva. → sección "Modo creación".
- **AUDITAR**: el usuario aporta un `.raml` (root + fragmentos) a revisar/corregir.
  → sección "Modo auditoría".

Si es ambiguo, preguntar cuál de los dos antes de actuar.

## Setup del validador (ambos modos, una sola vez por sesión)

El validador vive en `scripts/validate.js` y requiere `amf-client-js`.

```bash
cd <dir-de-trabajo>
npm install amf-client-js@5.10.2-7   # AMF real de MuleSoft (no "amf-cli", que es otro paquete)
node <skill>/scripts/validate.js <root.raml>          # salida legible
node <skill>/scripts/validate.js <root.raml> --json   # salida JSON para parsear
```

Exit code 0 = conforms; 1 = hay Violations; 2 = error de uso; 3 = fatal del parser.
El script resuelve `!include` relativos al root automáticamente.

> Si `npm install` falla por restricciones de red, informarlo al usuario
> (puede requerir que un owner de la org ajuste el acceso a npmjs.org) y
> continuar SOLO con el checklist manual, dejándolo claro en el reporte.

## Modo creación

1. **Recolectar requisitos** (preguntar, no asumir):
   - Datos del recurso: entidad, campos (con tipo y constraints), operaciones (CRUD).
   - Seguridad requerida: OAuth 2.0 y/o Client ID Enforcement.
   - Patrón de paginación de colecciones: cursor-based (default) u offset/limit.
     Preguntar si no está claro; la elección tiene trade-offs reales
     (ver `references/best-practices.md`). No asumir offset por simplicidad.
   - Defaults sensatos para el resto (HTTPS, JSON, error type único) salvo que
     el usuario indique otra cosa.
2. **Copiar plantillas** desde `assets/` al dir de trabajo:
   - `assets/api-template.raml` (root)
   - `assets/fragments/*` (error-types, security-schemes, pagination-trait,
     client-errors-trait)
3. **Rellenar** el root y los fragmentos con los datos del recurso, aplicando:
   - Estructura → `references/raml-structure.md`
   - Sanitización declarativa → `references/input-sanitization.md`
   - Seguridad → `references/security.md`
   - Diseño REST → `references/best-practices.md`
   - Compatibilidad Exchange → `references/anypoint-specifics.md`
4. **Validar** con `scripts/validate.js`. Iterar hasta `conforms: YES` sin Violations.
5. **Entregar** el RAML + un resumen de decisiones y de las policies de API
   Manager recomendadas (OAuth/Client ID, Rate Limiting, JSON Threat Protection).

## Modo auditoría

1. **Cargar** el `.raml` root y sus fragmentos del usuario.
2. **Correr el linter** `scripts/validate.js <root> --json` y capturar hallazgos.
3. **Recorrer el checklist** maestro → `references/validation-checklist.md`
   (estructura, seguridad, sanitización, diseño, Anypoint/Exchange), apoyándose
   en las referencias temáticas para el detalle de cada regla.
4. **Corregir**:
   - Deterministas (estructura/sanitización): aplicar directo al RAML.
   - Seguridad/diseño que requieren criterio: aplicar marcando cada cambio con
     `# ASUNCIÓN: <qué y por qué>` y listarlas aparte. (Acordado: la skill SÍ
     propone correcciones de seguridad/diseño como asunciones explícitas.)
5. **Re-validar** el RAML corregido con AMF hasta `conforms: YES`.
6. **Entregar dos artefactos**:
   - El **RAML corregido** (con comentarios `# ASUNCIÓN` donde aplique).
   - Un **reporte Markdown** con el formato de `references/validation-checklist.md`
     (resumen, hallazgos AMF, hallazgos checklist, correcciones automáticas,
     decisiones que requieren validación, recomendaciones de policy).

## Referencias (cargar bajo demanda)

| Tema | Archivo | Cargar cuando |
|------|---------|---------------|
| Estructura y modularización RAML | `references/raml-structure.md` | Crear/auditar estructura, includes, naming |
| Seguridad (OWASP API Sec + policies) | `references/security.md` | securitySchemes, securedBy, policies |
| Sanitización de inputs | `references/input-sanitization.md` | Constraints de types, validación de entrada |
| Buenas prácticas de diseño | `references/best-practices.md` | URIs, status codes, paginación, consistencia |
| Especificidades Anypoint/Exchange | `references/anypoint-specifics.md` | Fragmentos publicables, APIkit, includes vs uses |
| Checklist maestro de auditoría | `references/validation-checklist.md` | Recorrer la auditoría y formatear el reporte |

## Assets

| Archivo | Uso |
|---------|-----|
| `assets/api-template.raml` | Root RAML base (rellenar en creación) |
| `assets/fragments/error-types.raml` | DataType de error consistente |
| `assets/fragments/security-schemes.raml` | SecurityScheme OAuth 2.0 / Client ID |
| `assets/fragments/pagination-trait.raml` | Trait de paginación cursor-based (default) |
| `assets/fragments/pagination-offset-trait.raml` | Trait de paginación offset/limit (alternativa) |
| `assets/fragments/client-errors-trait.raml` | Trait de respuestas 4xx/429 |
| `scripts/validate.js` | Validador AMF (RAML 1.0) |

## Reglas no negociables

- RAML 1.0 únicamente. Si el usuario pide RAML 0.8 u OpenAPI, decirlo y parar.
- Nunca presentar un RAML como válido sin haberlo pasado por AMF (salvo fallo de
  red documentado, en cuyo caso decir explícitamente que solo se aplicó checklist).
- Nunca inventar reglas de plataforma. Las referencias citan fuentes; ante
  detalles de Anypoint/Exchange que puedan haber cambiado, verificar contra la
  doc vigente antes de afirmarlos como hechos.
- Correcciones de seguridad/diseño que dependan del negocio van SIEMPRE marcadas
  como `# ASUNCIÓN` y listadas para validación del usuario; no se aplican como si
  fueran hechos.
