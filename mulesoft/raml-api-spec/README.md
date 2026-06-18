# raml-api-spec

Skill de Claude para **crear y auditar especificaciones de API en RAML 1.0**
para MuleSoft Anypoint Platform. Valida estructura, seguridad, sanitización de
inputs y buenas prácticas de diseño, usando **AMF** (el mismo motor de parseo
que usa Anypoint) como validador real.

- **Versión**: 1.0.0
- **Alcance**: RAML 1.0 únicamente (root API + fragmentos DataType / Trait /
  ResourceType / SecurityScheme / Library).
- **Fuera de alcance**: OpenAPI/Swagger, RAML 0.8, generación de proyectos Mule
  runtime/flows, lógica DataWeave.

## Qué hace

La skill opera en dos modos:

- **Crear** — genera una spec RAML 1.0 desde cero a partir de los datos del
  recurso (entidad, campos, operaciones) y los requisitos de seguridad,
  aplicando defaults sensatos (HTTPS, JSON, error type único, paginación).
- **Auditar** — revisa un `.raml` existente, lo valida con AMF, recorre un
  checklist de buenas prácticas y entrega **dos artefactos**: el RAML corregido
  (con las decisiones de criterio marcadas como `# ASUNCIÓN`) y un reporte en
  Markdown con hallazgos por severidad.

Punto clave de diseño: **AMF valida sintaxis; el checklist valida lo demás.**
Una spec puede ser sintácticamente válida (`conforms: YES`) y aun así tener
`type: any`, usar `http://` o no declarar seguridad. Por eso la skill combina
las dos capas: linter determinista + checklist de criterio.

## Cobertura de validación

| Categoría | Qué revisa | Referencia |
|-----------|------------|------------|
| Estructura | Headers, modularización (DRY con traits/types), naming de recursos, `!include` vs `uses` | `references/raml-structure.md` |
| Seguridad | `securitySchemes`/`securedBy`, HTTPS, mapeo OWASP API Security Top 10 → policies de API Manager | `references/security.md` |
| Sanitización | Validación declarativa (pattern, min/max, enum, additionalProperties) y qué cae a policy | `references/input-sanitization.md` |
| Buenas prácticas | Status codes, paginación, consistencia, examples, versionado | `references/best-practices.md` |
| Anypoint/Exchange | Fragmentos publicables, APIkit, includes vs uses | `references/anypoint-specifics.md` |
| Checklist maestro | Recorrido de auditoría y formato del reporte | `references/validation-checklist.md` |

## Requisitos

- **Node.js** (probado con v22).
- **`amf-client-js@5.10.2-7`** — la librería AMF real de MuleSoft.

  > ⚠️ No confundir con el paquete npm `amf-cli`, que es un generador de
  > scaffolding de React sin relación con MuleSoft. El validador de esta skill
  > usa `amf-client-js`.

## Instalación

Copia la carpeta `raml-api-spec/` a tu directorio de skills de Claude. La
dependencia del validador se instala en el directorio de trabajo cuando se usa:

```bash
npm install amf-client-js@5.10.2-7
```

## Uso del validador (standalone)

El script de validación puede correrse de forma independiente:

```bash
node scripts/validate.js <root.raml>          # salida legible
node scripts/validate.js <root.raml> --json   # salida JSON
```

Resuelve los `!include` relativos al root automáticamente.
Exit codes: `0` conforma · `1` hay Violations · `2` error de uso · `3` fatal del parser.

## Estructura

```
raml-api-spec/
├── SKILL.md                      # Orquestación: modos, workflow, reglas
├── references/                   # Conocimiento cargado bajo demanda
│   ├── raml-structure.md
│   ├── security.md
│   ├── input-sanitization.md
│   ├── best-practices.md
│   ├── anypoint-specifics.md
│   └── validation-checklist.md
├── assets/
│   ├── api-template.raml         # Root RAML base
│   └── fragments/                # Fragmentos publicables en Exchange
│       ├── error-types.raml
│       ├── security-schemes.raml
│       ├── pagination-trait.raml         # cursor-based (default)
│       ├── pagination-offset-trait.raml  # offset/limit (alternativa)
│       └── client-errors-trait.raml
└── scripts/
    └── validate.js               # Validador AMF (RAML 1.0)
```

## Limitaciones conocidas

- El checklist de buenas prácticas lo aplica el modelo leyendo las referencias;
  no es un linter de reglas ejecutable. AMF cubre la sintaxis de forma
  determinista, pero la detección de defectos de seguridad/diseño depende del
  razonamiento sobre la spec.
- Las correcciones de criterio (scopes OAuth, límites de paginación, endpoints
  públicos) se marcan como `# ASUNCIÓN` para revisión humana; no se aplican como
  hechos.

## Licencia

MIT.
