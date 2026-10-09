// npm run verify: pruebas de unidad, tipos, build, extremo a extremo y axe, y la matriz de historias de SPEC.md.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'

const GROUPS = {
  grupo1: ['X3', 'B2', 'B3', 'B7', 'B9'],
  grupo2: ['A1', 'B1', 'B5', 'B8', 'B10', 'B11'],
  grupo3: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'],
  grupo4: ['X1', 'X2', 'A2', 'A3', 'A4', 'A5', 'A15'],
  grupo5: ['A6', 'A7', 'A8', 'A9'],
  grupo6: ['A10', 'A11', 'A12', 'A13', 'A14', 'B4'],
  grupo7: ['B6', 'C1', 'C2'],
  grupo8: ['E1', 'E2', 'E3', 'E4'],
  grupo9: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'H1', 'H2'],
  grupo10: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16'],
}

mkdirSync('.verify', { recursive: true })
const steps = [
  ['Pruebas de unidad', 'npx', ['vitest', 'run', '--reporter=default', '--reporter=json', '--outputFile=.verify/vitest.json']],
  ['tsc (raíz)', 'npx', ['tsc', '--noEmit']],
  ['tsc (app)', 'npx', ['tsc', '--noEmit', '-p', 'tsconfig.app.json']],
  ['tsc (config)', 'npx', ['tsc', '--noEmit', '-p', 'tsconfig.node.json']],
  ['tsc (e2e)', 'npx', ['tsc', '--noEmit', '-p', 'e2e/tsconfig.json']],
  ['Build', 'npm', ['run', 'build']],
  ['Extremo a extremo y axe', 'npx', ['playwright', 'test', '--reporter=list,json'], { PLAYWRIGHT_JSON_OUTPUT_NAME: '.verify/e2e.json' }],
]

const failed = []
for (const [name, cmd, args, env] of steps) {
  console.log(`\n▶ ${name}`)
  const result = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } })
  if (result.status !== 0) failed.push(name)
}

// Títulos de todas las pruebas, con su resultado.
const tests = []
if (existsSync('.verify/vitest.json')) {
  for (const file of JSON.parse(readFileSync('.verify/vitest.json', 'utf8')).testResults ?? []) {
    for (const a of file.assertionResults ?? []) tests.push({ title: a.fullName ?? a.title, ok: a.status === 'passed', kind: 'unidad' })
  }
}
if (existsSync('.verify/e2e.json')) {
  const walk = (suite, path) => {
    for (const spec of suite.specs ?? []) tests.push({ title: [...path, spec.title].join(' › '), ok: spec.ok, kind: 'e2e' })
    for (const child of suite.suites ?? []) walk(child, [...path, child.title])
  }
  for (const suite of JSON.parse(readFileSync('.verify/e2e.json', 'utf8')).suites ?? []) walk(suite, [suite.title])
}

// IDs de historia de SPEC.md, sección 2.
const spec = readFileSync('SPEC.md', 'utf8')
const section = spec.slice(spec.indexOf('## 2.'), spec.indexOf('## 3.'))
const ids = [...section.matchAll(/^\|\s*([A-Z]\d{1,2})\s*\|/gm)].map((m) => m[1])
const closed = JSON.parse(readFileSync('verify.groups.json', 'utf8')).cerrados.flatMap((g) => GROUPS[g] ?? [])

console.log('\nMatriz de historias (✓ pasa · ✗ falla · — sin prueba · … pendiente de su grupo)\n')
const missing = []
for (const id of ids) {
  const re = new RegExp(`(^|[^A-Za-z0-9])${id}([^0-9]|$)`)
  const covering = tests.filter((t) => re.test(t.title))
  const expected = closed.includes(id)
  const ok = covering.length > 0 && covering.every((t) => t.ok)
  const mark = covering.length === 0 ? (expected ? '—' : '…') : ok ? '✓' : '✗'
  if (expected && !ok) missing.push(id)
  const names = covering.map((t) => `${t.kind}: ${t.title}`).slice(0, 2).join(' | ')
  console.log(`${mark} ${id.padEnd(4)} ${names}`)
}

if (missing.length) failed.push(`historias sin prueba en verde: ${missing.join(', ')}`)
console.log(failed.length ? `\n✗ verify en rojo: ${failed.join('; ')}` : '\n✓ verify en verde')
process.exit(failed.length ? 1 : 0)
