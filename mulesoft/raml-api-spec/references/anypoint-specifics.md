# Especificidades de Anypoint (Design Center, Exchange, Studio)

Comportamientos del ecosistema Anypoint que afectan a un RAML real y que la
auditoría debe contemplar. Prioridad de compatibilidad de esta skill:
**Design Center / Exchange (fragmentos publicables)**.

> Nota de verificación: los detalles de publicación en Exchange y de
> `exchange_modules/` cambian con versiones de Anypoint. Validar contra la
> documentación vigente antes de tratar cualquiera como regla dura:
> https://docs.mulesoft.com/exchange/ y https://docs.mulesoft.com/design-center/

## Fragmentos publicables en Exchange

- Tipos de API fragment publicables: DataType, Trait, ResourceType,
  SecurityScheme, Library, Example, Documentation, AnnotationType, NamedExample,
  Overlay/Extension.
- Cada fragmento debe llevar su header correcto en la primera línea
  (`#%RAML 1.0 DataType`, etc.). Sin él, Exchange no lo reconoce como fragment.
- Un fragmento compartido entre APIs se publica en Exchange y se consume con
  `uses:` apuntando a `exchange_modules/<groupId>/<assetId>/<version>/<file>.raml`.
  No copiar el fragmento con `!include` en cada proyecto (rompe DRY y gobierno).
- `!include` es válido para fragmentos LOCALES del mismo proyecto/asset.

## Resolución de includes y rutas

- Las rutas de `!include` son relativas al archivo que las declara.
- Estructura de proyecto recomendada: root `.raml` en la raíz del asset,
  fragmentos en subcarpeta (`/fragments`, `/types`, `/traits`, `/dataTypes`).
- Evitar rutas absolutas y `../` que escapen del asset (no portables a Exchange).

## APIkit (Anypoint Studio) — si el RAML alimentará una implementación

- APIkit genera flows por recurso+método. Cada operación necesita responses
  bien definidas para generar el routing y los error handlers.
- `baseUri` con `{version}` se respeta; APIkit usa el path tras el host.
- Tipos `any` o sin definir complican la validación automática de APIkit
  (APIkit Console / Validation no podrá validar el payload).
- Los `examples` se usan para el mocking de APIkit Console.

## Validación: editor vs AMF

- El editor de Anypoint Studio / Design Center usa AMF por debajo, igual que el
  script `scripts/validate.js` de esta skill. Si AMF conforma, el editor
  normalmente también; discrepancias suelen ser de versión de AMF.
- AMF distingue `Violation` (rompe), `Warning` (riesgo), `Info`. La skill trata
  Violation como bloqueante.

## Errores comunes que la auditoría debe buscar

- Fragmento sin header de tipo en primera línea → no publicable / no resuelve.
- `!include` de un archivo inexistente o mal referenciado.
- Uso de `!include` donde debería haber `uses` (fragmento que se comparte).
- `securitySchemes` declarados pero no aplicados con `securedBy`.
- Rutas de include con `../` fuera del asset.
