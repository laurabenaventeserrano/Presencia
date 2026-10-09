---
name: presencia-diseno
description: Sistema de diseño de Presencia (Orb UI, «La habitación en calma»). Úsala siempre que crees o cambies algo visual en Presencia — pantallas, componentes, estilos, tokens.css, estados, copy de interfaz — o cuando trabajes en el archivo de Figma «Presencia» o lo sincronices con el código.
---

# Presencia · Sistema de diseño

La Orb UI es el sistema visual oficial de Presencia (decisión de Laura, 8 oct 2026). Sustituye a la estética de «papel» y a la de Manrope + DM Mono.

## Fuentes de verdad (en este orden)

1. `DESIGN.md`: tokens (YAML arriba) y reglas en prosa. Si algo no está aquí, no existe.
2. `src/tokens.css`: la implementación. Todo color, tamaño, radio, espacio y duración sale de una variable de este archivo.
3. Figma «Presencia»: https://www.figma.com/design/HYuJkcAAdL2f1HcKRH6Gvd/Presencia (fileKey `HYuJkcAAdL2f1HcKRH6Gvd`).
   - Páginas: Componentes, Pantallas y Sistema.
   - Variables:
     - «Tema»: modos Día y Noche.
     - «Orbe»: los siete colores del orbe.
     - «Medidas»: modos Escritorio, Móvil y Reloj.
4. `diseno/`: capturas de Figma para consulta rápida (`sistema.png`, `componentes.png`, `pantallas/dia|noche|estados/`). El handoff original está en `diseno/handoff/`.
5. `PRODUCT.md` (usuaria, voz, principios) y `SPEC.md` (producto y pantallas).

Si `DESIGN.md`, `tokens.css` y Figma no coinciden, no elijas tú. Señala la diferencia y pregunta.

## Las cinco reglas (no se rompen)

- **Single Light:** el color es solo del orbe. Ningún botón, texto, estado ni enlace lleva color. No hay rojos de error ni enlaces azules.
- **Same Room:** Día y Noche cambian valores, nunca papeles. Usa siempre el token semántico (`--tinta`, `--suave`, `--tarjeta`…), nunca el valor.
- **Featherweight:** Inter de 200 a 400. Nunca negrita.
- **No-Line:** sin bordes. La única línea es el separador de 1 px en `--suave`. La única sombra es `--sombra-tarjeta`, y solo en la tarjeta.
- **One Curve:** tarjeta y campo con esquinas de 8, botones (de texto y de icono) con esquinas de 4. Solo el orbe y los puntos son redondos. Nada de píldoras.

Además, «La habitación en calma» exige:
- Una sola cosa principal por pantalla y un solo botón oscuro por fila.
- Sin alarmas, parpadeos, badges ni contadores agresivos.
- Sin ruido visual: ni iconos decorativos, ni ilustraciones, ni texturas, ni degradados fuera del orbe.

## Piezas que ya existen (reutilízalas, no las dupliques)

| Pieza | Código | Figma (página Componentes) |
|---|---|---|
| Orbe (6 estados) | `src/components/Orb.tsx` + `Orb.css` | Orbe |
| Iconos (trazo 1,5, 20 sobre retícula de 24) | `src/components/Icon.tsx` | Iconos |
| Botón oscuro / suave, botón de icono, enlace | `src/components/controls.css` (`.boton`, `.boton--oscuro`, `.boton-icono`, `.boton-icono--fila`, `.boton-icono--oscuro`, `.enlace`) | Botón, Botón icono, Enlace |
| Campo con enviar, tarjeta, separador, filas | `src/components/Hoy.css` (`.campo`, `.tarjeta`, `.separador`, `.fila`) | Campo, Divisor, Fila propuesta, Fila tarea |
| Puntos de respiración | `src/components/Foco.css` (`.puntos`, `.punto`, `.punto--on`) | Punto |
| Pantallas | `Hoy.tsx`, `Foco.tsx` (`EnCurso`, `Respirar`) | Página Pantallas |
| Lógica de interfaz pura (con tests) | `src/ui/logic.ts`: `hoyOrb`, `focusOrb`, `stepMinutes`, `proposalRows`, `nextBreath`, `formatTime` | — |

**Estados del orbe** (los tres colores, en orden):

| Estado | Colores | Cuándo |
|---|---|---|
| reposo | coral, ámbar, melocotón | Hoy en espera |
| escucha | rosa, lila, cielo | escribiendo o la IA pensando |
| foco | menta, cielo, menta | bloque en marcha |
| pausa | cielo, lila, cielo | bloque en pausa |
| hecho | menta, ámbar, melocotón | bloque terminado |
| respirar | melocotón, lila, rosa | Respirar |

**Dispositivos:** `<main class="app" data-device="ordenador|movil|reloj">`. El reloj lleva siempre `data-theme="noche"` y no tiene pantalla Hoy. Las medidas por dispositivo se resuelven en `tokens.css`; los componentes no preguntan por el dispositivo para decidir tamaños.

## Cómo trabajar

1. Lee `SPEC.md` y la parte de `DESIGN.md` que toque, y mira la captura correspondiente en `diseno/`.
2. Si falta un valor, añádelo como variable en `tokens.css` (y en los modos de Noche y de dispositivo si cambia) y en el YAML de `DESIGN.md`. Nunca lo escribas a mano en un componente.
3. Si cambia un token o una regla, actualiza también Figma (variables o componentes) y regenera el sidecar con `/impeccable document`. Si no puedes hacerlo, dilo.
4. Cuando aparezca un estado nuevo en el código, dibújalo en Figma (página Pantallas, sección de estados) y vuelve a exportar su PNG a `diseno/pantallas/`.
5. Accesibilidad:
   - Áreas táctiles de 44 px como mínimo.
   - Foco de 2 px en tinta (separado 3 px, o 6 en el campo).
   - `aria-label` en todo botón de icono.
   - `prefers-reduced-motion` desactiva el orbe y la respiración.
6. El copy va en español, breve, tranquilo y en segunda persona: «Empezar», «Guardar», «Hecha», «Borrar», «Respirar», «Inspira» / «Espira».
7. Respeta `CLAUDE.md`:
   - Sin `any`.
   - No toques `store.ts` ni el timer sin permiso.
   - Todo cambio de lógica lleva test.
   - Al terminar, ejecuta `npm test`, `npx tsc --noEmit` y `npm run build`.

## Comprobación antes de dar algo por terminado

- [ ] Ningún `#hex`, `rgb(`, `px` ni radio escrito a mano fuera de `tokens.css`. Puedes buscarlo con `grep -nE "#[0-9a-fA-F]{3,6}|rgba?\(|[0-9]+px" src/components`.
- [ ] Ningún `font-weight` por encima de 400 ni `border` visible.
- [ ] Ningún color fuera del orbe.
- [ ] Se ve bien en Día y en Noche, y en ordenador, móvil y reloj.
- [ ] Coincide con Figma, o la diferencia está anotada.

## Lo que aún no existe (no lo inventes sin diseñarlo antes)

- «Hecha» y «Borrar» en las tareas: están en Figma, pero necesitan permiso para tocar `store.ts`.
- Fin de bloque «¿Sigues en flujo?», duración configurable de la respiración, cierre del día, sincronización y landing (hitos H2–H5 de `SPEC.md`). Diséñalos primero en Figma con estas mismas reglas.
- Estados que están en el código pero no en Figma:
  - IA pensando, con el botón «Parar».
  - «· Detenido».
  - «Ya hay un bloque en marcha».
  - Stepper en sus límites.
  - Reloj sin bloque, en pausa y al terminar.
