# Buenas prácticas de diseño (REST sobre RAML)

Reglas de diseño que la skill aplica además de la validación sintáctica de AMF.
AMF dice si el RAML es *válido*; estas reglas dicen si es *bueno*.

## Recursos y URIs
- Sustantivos en plural, kebab-case: `/purchase-orders/{id}/lines`.
- Jerarquía que refleje relaciones reales; no anidar más de 2-3 niveles.
- Sin verbos en la URI. Acción no-CRUD legítima → subrecurso o
  considerar si debe ser otra operación (ej. `/orders/{id}/cancel` como POST).

## Métodos y status codes
- GET 200 / 404. POST 201 (+ `Location`) / 400. PUT 200|204. PATCH 200.
  DELETE 204. Conflictos 409. Validación 400 (o 422 si se adopta esa convención
  de forma consistente en toda la API).
- Idempotencia respetada: GET/PUT/DELETE idempotentes; POST no.

## Contrato y consistencia
- Un único `Error` type en toda la API (ver fragments/error-types.raml).
- `mediaType: application/json` a nivel raíz.
- Nombres de propiedades consistentes: elegir camelCase **o** snake_case y
  aplicarlo en TODA la API. No mezclar.
- `examples` en types y en bodies de request/response: habilita mocking en
  Design Center y mejora la DX. Recomendado siempre.

## Colecciones
- Paginación obligatoria en toda colección. Filtrado y orden vía
  queryParameters tipados y acotados.
- Respuesta de colección envuelta: `{ data: [...], pagination: {...} }`.

### Elección del patrón de paginación (regla única — no improvisar)

Ambos patrones son válidos. La decisión NO es "cursor siempre"; depende del
dato. El default de la skill es **cursor-based** (es el que implementa
`assets/fragments/pagination-trait.raml`). Cambiar a offset es una decisión
deliberada, no un atajo.

- **Cursor-based (default)** — usar cuando la colección crece, es grande o no
  está acotada, o cuando se insertan/borran filas mientras se pagina. Evita el
  *drift* de offset (saltarse o repetir filas cuando el dataset cambia entre
  páginas) y escala mejor. Query params: `cursor` (opaco) + `limit`.
- **Offset/limit** — aceptable y a veces preferible cuando el dataset es
  pequeño y acotado, el orden es estable, o el cliente necesita saltar a una
  página arbitraria (página N) o mostrar el total de páginas. Query params:
  `offset` + `limit`, con `total` en la respuesta.

Coherencia obligatoria: el fragmento usado, el `queryParameters` del recurso,
la envoltura de respuesta y esta referencia deben describir el MISMO patrón.
Si se genera offset, usar un trait de paginación offset, no el `paged`
cursor-based por defecto. No mezclar `cursor` en el trait con `offset/total`
en la respuesta.

## Versionado y evolución
- `version` en `baseUri`. Cambios breaking → nueva versión mayor.
- Documentar deprecation (en `description` y en el lifecycle de Exchange/API Manager).
- No introducir breaking changes sin ruta de migración.

## Documentación
- `description` en API, recursos, métodos y propiedades de types.
- `documentation:` raíz para guías de uso, auth y manejo de errores.
- Cada respuesta de error documentada con su significado.

## Checklist de diseño (resumen)
- [ ] URIs = sustantivos plural, kebab-case, sin verbos.
- [ ] Status codes semánticamente correctos por método.
- [ ] Error type único y consistente.
- [ ] Naming de propiedades consistente (un solo estilo).
- [ ] examples presentes en types y bodies.
- [ ] Paginación en todas las colecciones.
- [ ] version en baseUri + estrategia de deprecation.
- [ ] description en todos los niveles.
