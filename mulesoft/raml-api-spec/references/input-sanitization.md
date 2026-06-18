# Sanitización de inputs

Dos capas. RAML cubre la **validación declarativa de forma** (primera línea de
defensa, gratis y en el contrato). Lo que RAML NO puede expresar va a policy o
a la app. La auditoría debe verificar la capa 1 y marcar explícitamente lo que
cae en la capa 2.

## Capa 1 — Validación declarativa en RAML (exigir siempre)

AMF/Anypoint rechazan en runtime (con APIkit / Validation) lo que viole estas
constraints, devolviendo 400 antes de llegar a la lógica.

### Strings
- `pattern` (regex) para formatos: UUID, email, fechas, códigos.
- `minLength` / `maxLength` SIEMPRE en strings libres (evita payloads gigantes).
- `enum` cuando el dominio es cerrado (estados, tipos).

### Números
- `minimum` / `maximum` en todo entero/decimal con rango lógico.
- `format` (`int32`, `int64`, etc.) cuando importa.

### Objetos
- `additionalProperties: false` para rechazar campos no declarados
  (evita mass-assignment / inyección de propiedades — OWASP API3).
- `required` explícito por propiedad.
- Tipar TODO. Prohibido `type: any` o body sin type.

### Arrays
- `minItems` / `maxItems` (evita arrays ilimitados — OWASP API4).
- `uniqueItems` cuando aplica.

### URI y query parameters
- `uriParameters` tipados con `pattern` (ej. UUID).
- `queryParameters` con tipo, `required`, y límites (`maximum` en `limit`).

## Capa 2 — Lo que RAML NO puede hacer (marcar en auditoría como "va a policy/app")

RAML valida forma, no contenido ni amenazas estructurales:

- **Profundidad de anidamiento JSON, tamaño total del payload, nº de
  propiedades** → policy **JSON Threat Protection** (OWASP API4/API10).
- **Inyección (SQLi, NoSQLi, command, LDAP)** → la validación de `pattern`
  ayuda a acotar, pero la defensa real es parametrización/escape en la app.
  Nunca confiar solo en regex como anti-inyección.
- **XSS en valores que se renderizarán** → escape en el consumidor; RAML no.
- **Reglas cross-field** (ej. `endDate > startDate`) → lógica en el flow.
- **Rate de peticiones** → Rate Limiting / Spike Control policy.

## Patrón de regex seguro (evitar ReDoS)

- Evitar regex con backtracking catastrófico (cuantificadores anidados:
  `(a+)+`, `(.*)*`). Preferir clases acotadas y longitudes fijas.
- Acotar siempre con `^...$` y longitud (`{8,64}`), no patrones abiertos.

## Checklist de sanitización (resumen accionable)

- [ ] Todo string libre tiene `maxLength`.
- [ ] Todo formato conocido tiene `pattern` (acotado, anti-ReDoS).
- [ ] Todo dominio cerrado usa `enum`.
- [ ] Todo número con rango tiene `minimum`/`maximum`.
- [ ] Objetos de entrada usan `additionalProperties: false`.
- [ ] Arrays de entrada tienen `maxItems`.
- [ ] `uriParameters` y `queryParameters` tipados y acotados.
- [ ] Ningún `type: any` ni body sin type.
- [ ] Se documentó/recomendó JSON Threat Protection para los bodies.
