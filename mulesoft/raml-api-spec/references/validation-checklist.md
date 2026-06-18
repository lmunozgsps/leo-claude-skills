# Checklist de validación (modo auditoría)

Checklist maestro que la skill recorre tras correr el linter AMF. Agrupado por
categoría. Cada hallazgo se clasifica por severidad y se lleva al reporte.

Severidades:
- **Violation** — rompe el contrato o la seguridad. Bloqueante.
- **Warning** — riesgo o mala práctica seria. Corregir.
- **Info** — mejora recomendada.

Marca de corrección en el RAML resultante:
- Correcciones **deterministas** (estructura/sanitización): se aplican directo.
- Correcciones que requieren **criterio** (seguridad/diseño): se aplican con
  comentario `# ASUNCIÓN: ...` y se listan aparte para validación del usuario.

## 1. Estructura (ref: raml-structure.md)
- [ ] Header `#%RAML 1.0` correcto (root y cada fragmento). [Violation]
- [ ] `title` presente. [Violation si falta]
- [ ] `version` presente y en `baseUri`. [Warning]
- [ ] `mediaType` raíz declarado. [Info]
- [ ] DRY: types/traits/resourceTypes reutilizados, no inline repetido. [Warning]
- [ ] Recursos = sustantivos plural, kebab-case, sin verbos. [Warning]
- [ ] `uriParameters` tipados. [Violation si sin tipo]

## 2. Seguridad (ref: security.md)
- [ ] `securedBy` a nivel raíz o por método. [Violation si ausente]
- [ ] `securitySchemes` declarados Y aplicados. [Warning si declarado sin usar]
- [ ] `protocols: [HTTPS]`, sin HTTP. [Violation si HTTP]
- [ ] Endpoints de escritura protegidos. [Violation]
- [ ] Respuestas 401/403 documentadas en endpoints protegidos. [Warning]
- [ ] Recomendación de policies (OAuth/Client ID, Rate Limiting, JSON Threat
      Protection) incluida en el reporte. [Info]

## 3. Sanitización de inputs (ref: input-sanitization.md)
- [ ] Ningún `type: any` ni body sin type. [Violation]
- [ ] Strings libres con `maxLength`. [Warning]
- [ ] Formatos conocidos con `pattern` acotado (anti-ReDoS). [Warning]
- [ ] Dominios cerrados con `enum`. [Info]
- [ ] Números con `minimum`/`maximum`. [Info]
- [ ] Objetos de entrada con `additionalProperties: false`. [Warning]
- [ ] Arrays de entrada con `maxItems`. [Warning]
- [ ] queryParameters acotados (`limit` con `maximum`). [Warning]

## 4. Buenas prácticas de diseño (ref: best-practices.md)
- [ ] Status codes correctos por método. [Warning]
- [ ] Error type único y consistente. [Warning]
- [ ] Naming de propiedades consistente (un solo estilo). [Warning]
- [ ] `examples` en types y bodies. [Info]
- [ ] Paginación en colecciones. [Warning si ausente]
- [ ] Patrón de paginación coherente: el trait, los queryParameters y la
      envoltura de respuesta usan el MISMO patrón. cursor+limit con `nextCursor`,
      o offset+limit con `total`. Mezclar cursor con offset/total. [Warning]
      NOTA: offset/limit es válido — NO marcarlo como hallazgo por sí solo. Solo
      informar el trade-off si el dataset parece grande/creciente.
- [ ] `description` en API/recursos/métodos. [Info]

## 5. Compatibilidad Anypoint / Exchange (ref: anypoint-specifics.md)
- [ ] Fragmentos con header de tipo correcto. [Violation si falta]
- [ ] `!include` resuelven a archivos existentes. [Violation]
- [ ] Fragmentos compartidos vía `uses`/Exchange, no `!include` copiado. [Warning]
- [ ] Sin rutas `../` que escapen del asset. [Warning]

## Formato del reporte de salida

```
# Reporte de auditoría RAML — <archivo>

## Resumen
- AMF conforms: YES/NO
- Violations: N | Warnings: N | Info: N
- Veredicto: <listo para publicar / requiere correcciones>

## Hallazgos del linter (AMF)
<tabla: severidad | línea | mensaje>

## Hallazgos del checklist
<por categoría: severidad | ubicación | descripción | corrección aplicada/sugerida>

## Correcciones aplicadas automáticamente (deterministas)
<lista>

## Decisiones que requieren tu validación (marcadas # ASUNCIÓN en el RAML)
<lista con justificación de cada asunción>

## Recomendaciones de policy en API Manager
<OAuth/Client ID, Rate Limiting, JSON Threat Protection según aplique>
```
