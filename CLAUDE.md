# Presencia

Concepto de portfolio: una web responsive para planificar el día con una IA simulada, un temporizador y un modo Respirar, con una cuadrícula de días muy callada. Sin cuentas, sin servidor y sin lista de tareas. React, TypeScript, Vite y Zustand; se despliega en Vercel.

## Fuentes de verdad
- `SPEC.md`: producto (empieza por la sección 0). Si algo no está ahí, no se construye.
- `DESIGN.md`: diseño visual. No se edita sin permiso. Usa la skill `presencia-diseno` antes de tocar algo visual.
- `docs/`: `PROCESS.md` (cómo se trabaja y definición de terminado), `ARCHITECTURE.md`, `FASE1.md`, `ACCEPTANCE.md` y `ANALISIS-COMPETITIVO.md`.

## Reglas
- Prohibido `any`. Estilos solo con las variables de `src/tokens.css`.
- No instales paquetes ni toques `package.json` sin permiso expreso.
- Solo `src/storage` toca localStorage. Solo `src/actions` cambia el estado.
- El temporizador guarda `endsAt`; nunca cuenta segundos.
- Las reglas de la IA son puras: sin `Date.now` ni `Math.random` (la semilla sale del texto, el día y la tanda).
- Toda historia tiene una prueba con su ID en el título. `npm run verify` debe quedar en verde.
- Explica los conceptos como a una diseñadora que aprende TypeScript.
