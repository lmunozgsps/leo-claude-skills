# Estructura RAML 1.0

Reglas de estructura y modularización que la skill aplica al crear y al auditar.
Fuente normativa: RAML 1.0 Specification (https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md)
y MuleSoft Anypoint Platform docs (https://docs.mulesoft.com/design-center/).

## Header y raíz

- La primera línea DEBE ser `#%RAML 1.0` (API root) o el header del fragmento
  correspondiente (`#%RAML 1.0 DataType`, `#%RAML 1.0 Trait`,
  `#%RAML 1.0 SecurityScheme`, `#%RAML 1.0 ResourceType`, `#%RAML 1.0 Library`).
- `title` es obligatorio. `version` y `baseUri` son fuertemente recomendados.
- `version` va en `baseUri` como `{version}` (`https://host/api/{version}`),
  no embebida a mano en cada recurso.
- Declarar `mediaType: application/json` a nivel raíz para no repetirlo en cada body.
- `protocols: [ HTTPS ]` explícito. No exponer HTTP.

## Modularización (DRY)

RAML penaliza la repetición. La estructura correcta separa responsabilidades:

| Construcción      | Para qué                                              | Fragment header           |
|-------------------|------------------------------------------------------|---------------------------|
| `types`           | Modelos de datos reutilizables                       | `#%RAML 1.0 DataType`     |
| `traits`          | Comportamiento transversal de métodos (paginación, errores) | `#%RAML 1.0 Trait` |
| `resourceTypes`   | Plantillas de recursos (CRUD estándar)               | `#%RAML 1.0 ResourceType` |
| `securitySchemes` | Esquemas de autenticación                            | `#%RAML 1.0 SecurityScheme` |
| `libraries`       | Agrupación de los anteriores para compartir          | `#%RAML 1.0 Library`      |
| `!include`        | Insertar un fragmento local                          | —                         |
| `uses`            | Importar una Library / módulo (incl. Exchange)       | —                         |

- Definir un type UNA vez y referenciarlo; no redefinir objetos inline en cada body.
- Errores: un único `Error` type + un trait de errores de cliente aplicado con `is:`.
- Paginación: un trait `paged` aplicado a todas las colecciones.

## `!include` vs `uses` (relevante para Exchange — ver anypoint-specifics.md)

- `!include`: inserta el contenido de un fragmento en el punto exacto. Para
  fragmentos LOCALES del proyecto.
- `uses`: importa una Library bajo un namespace (`uses: secLib: ...` →
  `secLib.oauth_2_0`). Necesario para módulos compartidos publicados en Exchange.
- Un fragmento que será compartido entre varias APIs debe publicarse como
  API fragment en Exchange y consumirse vía `uses` con `exchange_modules/...`,
  no copiarse con `!include` en cada proyecto.

## Naming y convenciones de recursos

- Recursos = sustantivos en plural, en kebab-case: `/purchase-orders`, no
  `/getPurchaseOrder` ni `/PurchaseOrders`.
- Nada de verbos en la URI; el verbo es el método HTTP.
- `uriParameters` SIEMPRE tipados y con constraint (ej. UUID con `pattern`).
- Métodos HTTP con semántica correcta: GET (idempotente, sin body de mutación),
  POST (crear), PUT (reemplazo idempotente), PATCH (parcial), DELETE.

## Anti-patrones estructurales (marcar en auditoría)

- `type: any` o body sin type → pérdida de contrato y de validación. VIOLATION lógica.
- Objetos redefinidos inline en lugar de un type reutilizable.
- Errores definidos ad-hoc por recurso en vez de un trait compartido.
- `version` hardcodeada en rutas.
- Falta de `examples` en types y bodies (AMF no lo exige, pero degrada DX y
  rompe el mocking en Design Center).
