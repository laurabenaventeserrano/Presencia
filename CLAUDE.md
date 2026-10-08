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

## Diseño
- Sistema visual oficial: Orb UI («La habitación en calma»). Está definido en DESIGN.md y se implementa en src/tokens.css.
- Antes de tocar algo visual, usa la skill `presencia-diseno` (.claude/skills/presencia-diseno).
- Reglas: color solo en el orbe; Inter de 200 a 400, nunca negrita; sin bordes y con una sola sombra ambiental en la tarjeta; esquinas de 8 en tarjeta y campo y de 4 en botones, y solo el orbe y los puntos son redondos.
- Figma: https://www.figma.com/design/HYuJkcAAdL2f1HcKRH6Gvd/Presencia. Las capturas y el handoff original están en diseno/.
- Contexto de producto y voz: PRODUCT.md.