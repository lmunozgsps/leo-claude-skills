#!/usr/bin/env node
/*
 * validate.js — Valida un RAML 1.0 usando AMF (amf-client-js), el mismo
 * motor de parseo que usa Anypoint Platform internamente.
 *
 * Uso:
 *   node validate.js <ruta-al-root.raml> [--json]
 *
 * Resuelve !include automáticamente (AMF carga los fragmentos referenciados
 * desde el sistema de archivos relativo al root).
 *
 * Exit codes:
 *   0  -> conforms = true  (sin violations)
 *   1  -> conforms = false (hay al menos una Violation)
 *   2  -> error de uso (falta argumento)
 *   3  -> error fatal del parser (archivo ilegible, etc.)
 */
const amf = require('amf-client-js');
const path = require('path');
const fs = require('fs');

function color(sev, txt) {
  if (process.env.NO_COLOR || !process.stdout.isTTY) return txt;
  const c = { Violation: '\x1b[31m', Warning: '\x1b[33m', Info: '\x1b[36m' }[sev] || '';
  return c ? c + txt + '\x1b[0m' : txt;
}

(async () => {
  const args = process.argv.slice(2);
  const jsonOut = args.includes('--json');
  const file = args.find(a => !a.startsWith('--'));

  if (!file) {
    console.error('Uso: node validate.js <root.raml> [--json]');
    process.exit(2);
  }
  if (!fs.existsSync(file)) {
    console.error(`No existe el archivo: ${file}`);
    process.exit(2);
  }

  let report, parseRes;
  try {
    const client = amf.RAMLConfiguration.RAML10().baseUnitClient();
    const url = 'file://' + path.resolve(file);
    parseRes = await client.parse(url);
    report = await client.validate(parseRes.baseUnit);
  } catch (e) {
    console.error('FATAL: el parser AMF falló: ' + e.message);
    process.exit(3);
  }

  // Combinar resultados de parse (syntax) y validate (model)
  const raw = [...(parseRes.results || []), ...(report.results || [])];
  // Deduplicar por (severity|message|line)
  const seen = new Set();
  const results = [];
  for (const r of raw) {
    const line = r.position && r.position.start ? r.position.start.line : null;
    const key = `${r.severityLevel}|${r.message}|${line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ severity: r.severityLevel, message: r.message, line });
  }

  const conforms = report.conforms && (parseRes.conforms !== false);
  const counts = results.reduce((a, r) => { a[r.severity] = (a[r.severity] || 0) + 1; return a; }, {});

  if (jsonOut) {
    console.log(JSON.stringify({ file, conforms, counts, results }, null, 2));
  } else {
    console.log(`\nAMF RAML 1.0 validation — ${file}`);
    console.log(`conforms: ${conforms ? 'YES' : 'NO'}  (Violations: ${counts.Violation || 0}, Warnings: ${counts.Warning || 0}, Info: ${counts.Info || 0})\n`);
    if (results.length === 0) {
      console.log('  Sin hallazgos del parser. (Ejecuta también el checklist de buenas prácticas.)');
    }
    for (const r of results) {
      const loc = r.line != null ? `L${r.line}` : '—';
      console.log(`  [${color(r.severity, r.severity)}] ${loc}: ${r.message}`);
    }
    console.log('');
  }

  process.exit(conforms ? 0 : 1);
})();
