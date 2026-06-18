# Seguridad: OWASP API Security Top 10 + Policies de API Manager

Cómo el contrato RAML y las policies de API Manager cubren cada riesgo.
Principio clave: **RAML documenta el contrato; la policy de API Manager hace
cumplir en runtime.** Una spec que "declara" seguridad sin policy asociada NO
está protegida. La auditoría debe distinguir las dos capas.

Fuentes:
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- Anypoint API Manager policies: https://docs.mulesoft.com/api-manager/2.x/policy-mule4-reference

## Mapeo OWASP API Security Top 10 (2023) → RAML / Policy

| OWASP | Riesgo | Qué hace RAML | Qué policy / control aplica |
|-------|--------|---------------|-----------------------------|
| API1  | Broken Object Level Authorization (BOLA) | `uriParameters` tipados; NO resuelve authz por objeto | Lógica en la app / flow; policy no basta. Marcar como riesgo de diseño. |
| API2  | Broken Authentication | `securitySchemes` (OAuth 2.0) + `securedBy` | OAuth 2.0 Access Token Enforcement **o** Client ID Enforcement |
| API3  | Broken Object Property Level Authorization | Types estrictos, `additionalProperties: false`, ocultar campos sensibles | Control en mapping/DataWeave; RAML limita la superficie |
| API4  | Unrestricted Resource Consumption | `maxLength`, `maximum`, `limit` en paginación | Rate Limiting / SLA-based Rate Limiting / Spike Control |
| API5  | Broken Function Level Authorization | `securedBy` por método + scopes | OAuth scopes enforcement; políticas por método |
| API6  | Unrestricted Access to Sensitive Business Flows | — | Rate Limiting + Spike Control + lógica de negocio |
| API7  | Server Side Request Forgery (SSRF) | Validar/whitelist de URLs en inputs (`pattern`) | Validación en flow; RAML acota formato |
| API8  | Security Misconfiguration | `protocols: [HTTPS]`, sin verbos peligrosos abiertos | TLS, CORS policy, headers de seguridad |
| API9  | Improper Inventory Management | `version`, documentación, deprecation | Gobierno en Exchange/API Manager (versionado, lifecycle) |
| API10 | Unsafe Consumption of APIs | Types estrictos en respuestas de terceros | Validación de payloads entrantes; JSON Threat Protection |

## Policies de API Manager que la skill recomienda

1. **OAuth 2.0 Access Token Enforcement** — autenticación primaria.
   El RAML lo documenta con `securityScheme` tipo `OAuth 2.0`.
2. **Client ID Enforcement** — identificación de la app cliente (client_id/secret).
   En RAML se documenta en `describedBy.headers` o como queryParameters.
3. **Rate Limiting / SLA-based Rate Limiting** — cubre API4/API6. Definir
   SLA tiers en API Manager; el RAML puede documentar el `429` + `Retry-After`
   (ver fragments/client-errors-trait.raml).
4. **JSON Threat Protection** — cubre payloads maliciosos (profundidad de
   anidamiento, tamaño de arrays/strings, nº de propiedades). Esto NO se puede
   expresar en RAML; es responsabilidad de la policy. Ver input-sanitization.md.

## Reglas de auditoría de seguridad

- Toda API DEBE declarar `securedBy` a nivel raíz o por método. Una API sin
  `securedBy` y sin scheme → VIOLATION de seguridad (asunción de corrección:
  añadir `securedBy: [oauth_2_0]` marcado como `# ASUNCIÓN`).
- `protocols` no debe incluir HTTP. Si falta `protocols`, asumir y forzar HTTPS.
- Endpoints de escritura (POST/PUT/PATCH/DELETE) sin seguridad → VIOLATION.
- Documentar respuestas `401` y `403` en endpoints protegidos.
- Si la spec sugiere rate limiting (paginación con `limit`) pero no documenta
  `429`, añadir el trait de errores de cliente.

## Correcciones de seguridad como ASUNCIÓN

Cuando la skill propone seguridad que requiere criterio de negocio (qué scopes,
qué grant type, qué tier de rate limit), NO la inventa silenciosamente: la
inserta marcada con comentario `# ASUNCIÓN: <qué se asumió y por qué>` y la
lista en la sección "Decisiones que requieren tu validación" del reporte.
