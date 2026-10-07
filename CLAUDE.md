# Presencia
App de foco con IA simulada. React, TypeScript y Vite. Se despliega en Vercel.

## Reglas
- Prohibido `any` en TypeScript.
- Estilos solo con las variables de tokens.css. Ningún color o tamaño escrito a mano.
- No instales paquetes ni toques package.json si no te lo pido.
- No toques el timer ni store.ts salvo que se pida expresamente.
- Las reglas de la IA son funciones puras: sin Date.now ni Math.random.
- Todo cambio de lógica lleva test.
- Al terminar: ejecuta npm test, npx tsc --noEmit y npm run build, y dime qué archivos has creado o modificado.
- Explica los conceptos como a una diseñadora que aprende TypeScript.

## Arquitectura
- src/ai: contrato AIProvider, reglas puras y MockProvider.
- La IA propone, la persona decide: lo propuesto no entra en el día sin aceptarlo.
- El timer guarda endsAt, no cuenta segundos.
Lee SPEC.md antes de cualquier tarea: es la fuente de verdad del producto.