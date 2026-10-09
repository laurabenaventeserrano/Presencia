# Arquitectura

Decisiones técnicas de Presencia. Es un concepto de portfolio: una web responsive sin servidor, sin cuentas y sin base de datos. Ante la duda, lo más simple.

## 1. Stack

- **React, TypeScript y Vite.** Estado con Zustand.
- **Despliegue:** Vercel, con una rama de previsualización por rama de git.
- **Pruebas:** Vitest (unidad), Playwright (extremo a extremo) y axe (accesibilidad), ejecutados en la integración continua de GitHub.
- **Sin dependencias nuevas** salvo las de pruebas, que se instalan en el hito M0.

## 2. Almacenamiento

Todo vive en el navegador (localStorage), en una sola clave versionada, `presencia:v1`. **Un único módulo, `src/storage`, es el único que lee y escribe.** Ningún otro archivo toca localStorage. Así, si algún día se conectan los dispositivos, solo cambia ese módulo.

Qué se guarda:

```ts
type BlockRecord = {            // lo que ya ocurrió: alimenta la cuadrícula
  id: string
  kind: 'focus' | 'break' | 'breathe'
  title: string
  plannedMin: number
  focusMs: number               // tiempo realmente trabajado
  startedAt: string             // ISO
  endedAt: string               // ISO
  example?: true                // dato de ejemplo
}

type PlanItem = {               // un bloque del plan del día
  id: string
  kind: 'focus' | 'break' | 'breathe'
  title: string
  plannedMin: number
  status: 'pending' | 'running' | 'later' | 'done'
  laterUntil?: string           // ISO, si status es 'later'
  remainingMs?: number          // lo que le queda si se aplazó en marcha
  doneMin?: number              // minutos reales si status es 'done'
}

type DayPlan = {                // el plan de un solo día
  date: string                  // 'YYYY-MM-DD', zona horaria local
  intent: string                // lo que la persona escribió
  batch: number                 // número de tanda de "Otra propuesta"
  items: PlanItem[]
}

type ActiveBlock = {
  id: string
  planItemId?: string           // si viene del plan del día
  kind: 'focus' | 'break' | 'breathe'
  title: string
  plannedMin: number
  extraMin: number              // los "+5 min"
  status: 'running' | 'paused'
  startedAt: string
  endsAt?: number               // solo si corre
  remainingMs?: number          // solo si está pausado
}

type Settings = { sound: boolean; notifications: boolean }
```

Si la fecha del `DayPlan` guardado no es la de hoy, se descarta. Los datos de ejemplo llevan `example: true`, para poder quitarlos sin tocar los reales. Un aplazamiento (`later`) solo avisa mientras la pestaña esté abierta.

## 3. El temporizador

- Un bloque en marcha guarda `endsAt`, el momento exacto en que termina. El tiempo restante se calcula al pintar, nunca contando segundos.
- Al pausar se guarda `remainingMs` y `endsAt` queda vacío. Al reanudar, `endsAt = ahora + remainingMs`. "+5 min" suma 5 minutos a uno u otro.
- El descanso y la respiración son bloques de otro tipo y siguen las mismas reglas.
- "Más tarde" en un bloque en marcha lo devuelve al plan con `status: 'later'`, `laterUntil` y los milisegundos que le quedaban. Los minutos ya trabajados se guardan como un `BlockRecord`.
- Solo puede haber un bloque activo a la vez.
- Al terminar, el bloque se convierte en un `BlockRecord` con los minutos realmente trabajados.

## 4. La cuadrícula de días

Dos funciones puras, con tests:

- `focusByDay(records, timeZone)`: devuelve, por fecha local, los minutos de foco y el número de bloques. Solo cuentan los de tipo `focus`. Un bloque cuenta para el día en que empezó.
- `exampleYear(today)`: genera un año de actividad de una persona de ejemplo (semanas con foco entre lunes y viernes, fines de semana casi en blanco, un par de semanas vacías y algún pico), con `example: true`. Es determinista.
- `levelFor(minutes)`: devuelve 0 a 5. 0 es blanco; 1 a 24, 25 a 59, 60 a 119, 120 a 179 y 180 o más son los cinco tonos. Los umbrales viven en una constante para poder ajustarlos.

La cuadrícula es una sola parada de Tab, con las flechas para moverse entre días (patrón de rejilla accesible). Cada cuadrado tiene un nombre accesible con su fecha y sus minutos.

## 5. Acciones y herramientas (preparación para un agente)

Dos capas, y todo lo demás las usa:

**Acciones (`src/actions`).** Son las únicas funciones que cambian el estado de la aplicación: `createPlan`, `updateItem`, `removeItem`, `addItem`, `startItem`, `postponeItem`, `startTimer`, `startBreathing`, `pause`, `resume`, `extend`, `finish`, `startBreak`, `clearData`, `loadExample` y `removeExample`. La interfaz las llama. Nada más cambia el estado, ni siquiera la IA. Son funciones puras sobre el estado, con tests, y son el único sitio que escribe en `src/storage`.

**Herramientas (`src/agent/tools.ts`).** Lo que una IA puede pedir. Cada herramienta tiene un nombre, una descripción y un esquema de parámetros en JSON, y una función que la ejecuta:

| Herramienta | Qué hace | Cambia el estado |
| --- | --- | --- |
| `propose_plan` | Devuelve un borrador de plan con sus bloques y un resumen. No lo aplica | No. La persona acepta o edita, y entonces se llama a `createPlan` |
| `read_day` | Devuelve el plan de hoy, el estado de cada bloque y los minutos de foco de hoy | No |
| `read_history` | Devuelve los minutos de foco por día de los últimos N días | No |

La simulación solo usa `propose_plan`. `read_day` y `read_history` existen, con tests, porque un agente real las necesitará. El esquema de cada herramienta se escribe a mano como objeto TypeScript, sin librerías nuevas.

**Flujo.** La IA emite eventos: texto escrito palabra a palabra y, al final, una llamada a herramienta (`tool_call`). La interfaz muestra la propuesta como borrador editable. Solo cuando la persona acepta, se llama a la acción correspondiente.

```ts
type PlanEvent =
  | { type: 'token'; text: string }
  | { type: 'tool_call'; name: 'propose_plan'; args: ProposePlanArgs }
  | { type: 'done' }
```

Cuando se sustituya la simulación por un modelo real (fase 2), ese modelo emitirá las mismas llamadas, y se añadirá un bucle: ejecutar la herramienta, devolver el resultado al modelo y continuar hasta que termine.

## 6. La IA simulada

Detrás de la interfaz `AIProvider`. Reglas en SPEC.md, sección 3: convierte lo que cuenta la persona en una lista de bloques (`PlanItem`), que entrega como la llamada `propose_plan`. Un generador de números con semilla (texto, día y tanda) da variedad reproducible. No usa red.

## 7. Pruebas

- **Unidad (Vitest):** acciones, herramientas, reglas de la IA, cálculo del tiempo, `focusByDay`, `levelFor`, `exampleYear`, el cambio de día del plan y el módulo de almacenamiento.
- **Extremo a extremo (Playwright):** una prueba por historia de SPEC.md, nombrada con su ID (`A6.spec.ts`).
- **Accesibilidad (axe con Playwright):** cada pantalla, en los dos temas y a 390 px.
- **Integración continua:** GitHub Actions ejecuta `npm test`, `npx tsc --noEmit`, `npm run build` y `npm run test:e2e` en cada push y en cada pull request.

## 8. Estructura de carpetas

```
SPEC.md              producto
DESIGN.md            diseño
CLAUDE.md            reglas para el agente
docs/                ACCEPTANCE.md, ARCHITECTURE.md, PROCESS.md, FASE1.md, ANALISIS-COMPETITIVO.md
src/ai/              contrato, reglas y MockProvider
src/agent/           herramientas (propose_plan, read_day, read_history)
src/actions/         las únicas funciones que cambian el estado
src/storage/         el único módulo que toca localStorage
src/store/           estado
src/components/      interfaz
e2e/                 pruebas de extremo a extremo, una por historia
```

## 9. Privacidad

No hay servidor: no se envía ningún dato a ningún sitio. Un texto en Días lo dice, y "Borrar mis datos" lo elimina todo. Sin analítica de terceros.
