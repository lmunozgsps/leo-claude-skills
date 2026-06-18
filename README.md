# leo-claude-skills

Colección de [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) para Claude, organizadas por dominio.

## Estructura

Las skills se agrupan por dominio. Cada skill es una carpeta autocontenida con
su `SKILL.md`, sus referencias y sus assets.

```
leo-claude-skills/
├── README.md
└── mulesoft/
    └── raml-api-spec/        # Crear y auditar specs RAML 1.0 para Anypoint
        ├── SKILL.md
        ├── references/
        ├── assets/
        └── scripts/
```

## Skills disponibles

| Dominio | Skill | Descripción |
|---------|-------|-------------|
| MuleSoft | [`raml-api-spec`](mulesoft/raml-api-spec/) | Crea y audita especificaciones de API en RAML 1.0 para Anypoint Platform. Valida estructura, seguridad (OWASP API Security Top 10 + policies de API Manager), sanitización de inputs y buenas prácticas, usando AMF como validador. |

## Cómo usar una skill

1. Abre la carpeta de la skill y lee su `SKILL.md`: describe cuándo se activa,
   qué hace y qué dependencias necesita.
2. Instala la skill en tu entorno de Claude copiando la carpeta de la skill al
   directorio de skills correspondiente.
3. Algunas skills requieren dependencias (ej. `raml-api-spec` usa
   `amf-client-js`). Cada `SKILL.md` lo indica.

## Licencia

Ver el `SKILL.md` de cada skill para su licencia. Salvo indicación contraria, las skills de este repo se publican bajo MIT.