# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas que hacen trabajo creativo o de conocimiento (diseño, desarrollo, escritura). Al empezar el día quieren decidir en qué concentrarse, repartirlo en bloques de tiempo y proteger ese foco mientras trabajan. Usan Presencia sobre todo en el ordenador, y miran el móvil o el reloj para seguir el bloque en curso o para respirar.

Audiencia secundaria: quien revisa el proyecto como pieza de portfolio (equipos de diseño, reclutadores). Presencia tiene que demostrar criterio de diseño y la capacidad de construirlo.

## Product Purpose

Presencia es una app de foco y bienestar. Una IA (simulada por ahora) pregunta «¿Qué quieres hacer hoy?» y propone bloques de tiempo editables. La persona decide si empezarlos ya o guardarlos como tareas. Acompaña el trabajo con un timer, respiración guiada y un resumen al cerrar el día.

Éxito: la persona sale de la pantalla Hoy con un plan que ha decidido ella, trabaja un bloque sin interrupciones, y al cerrar el día ve qué ha hecho de verdad (minutos de foco, bloques completados, minutos en flujo).

## Positioning

La IA propone y la persona decide: nada entra en el día ni en las tareas sin una acción explícita. Hay una sola cosa principal por pantalla, y el ritmo es tranquilo: sin alarmas bruscas, con la pregunta «¿Sigues en flujo?» al terminar un bloque y respiración guiada en las pausas. Presencia no compite en número de funciones de productividad, sino en calma y en decidir con intención.

## Operating Context

- **Hoy** (`/app`): intención en texto libre, la IA responde palabra a palabra, una propuesta editable (minutos de 5 en 5, mínimo 5, máximo 120) y la lista de tareas guardadas (Empezar, Hecha, Borrar).
- **En curso:** título del bloque, tiempo restante, pausar o reanudar, terminar, y acceso a Respirar.
- **Fin de bloque (modo flujo):** «¿Sigues en flujo?» con +10 min o Terminar. Los minutos extra cuentan como minutos en flujo.
- **Respirar / Pausa:** inspirar 5 s y soltar 5 s, con duración configurable (1, 3 o 5 min) y texto mínimo.
- **Cierre del día:** una frase generada a partir de datos reales y tres números.
- **Dispositivos:** ordenador (principal); móvil (`/m`, Hoy compacta con foco, respirar y meditar); reloj (`/watch`, anillo, pausar o continuar, respirar), todo en web. Se sincronizan con un código de 6 dígitos, sin login.
- **Landing:** una frase, una explicación corta, una demo real de Hoy, instalar y vincular dispositivo, y una sección «Más adelante».

## Capabilities and Constraints

- Stack: React, TypeScript y Vite. Despliegue en Vercel. PWA instalable en ordenador y móvil.
- Estado en un store Zustand persistido en localStorage. El store es la única fuente de verdad, y los tipos persistidos se migran sin perder datos.
- El timer guarda `endsAt` (y `remainingMs` en pausa). Nunca cuenta segundos con un contador.
- Empezar un bloque es una única función, compartida por la propuesta y las tareas.
- La IA vive detrás de la interfaz `AIProvider`. Hoy usa un `MockProvider` determinista que se puede cancelar. Las reglas de la IA son funciones puras.
- Todo el estilo vive en `tokens.css`: ningún componente escribe a mano un color, un tamaño o un radio.
- Si la IA no entiende, responde «No te he entendido. ¿Qué quieres hacer hoy? Por ejemplo: diseñar la pantalla y responder emails.» y no propone nada.
- Si ya hay un bloque en marcha, Empezar se desactiva con el texto «Ya hay un bloque en marcha».
- Fuera de alcance: apps nativas (incluidos reloj y widgets), IA real, activar No molestar en los dispositivos, hand tracking o partículas, e integración con otras apps de tareas.
- Hoja de ruta (hitos H1–H5 en `SPEC.md`): Hoy → Foco (flujo, respiración, sonido ambiente, burbuja Picture-in-Picture) → Cierre (sesiones, memoria) → Dispositivos (sincronización Supabase Realtime) → Landing.
- Lenguaje visual decidido (8 oct 2026): la «Orb UI», documentada en `DESIGN.md`. Sustituye a la propuesta de papel.

## Brand Commitments

- Nombre: **Presencia**.
- Idioma: español. El copy del producto se usa tal cual («¿Qué quieres hacer hoy?», «Empezar», «Guardar», «Hecha», «Borrar», «Respirar», «Inspira» / «Espira», «¿Sigues en flujo?»).
- Voz: breve, tranquila y en segunda persona. Nunca alarmista ni de gamificación.

## Evidence on Hand

- `SPEC.md` (fuente de verdad del producto) y `CLAUDE.md` (reglas técnicas) en este repositorio.
- Handoff visual: `diseno/handoff/` (`README.md` y `Presencia.dc.html`), copiado de `~/Documents/design_handoff_presencia/`.
- Capturas del diseño de Figma: `diseno/` (sistema, componentes y pantallas en Día, en Noche y por estados).
- Archivo de Figma: https://www.figma.com/design/HYuJkcAAdL2f1HcKRH6Gvd/Presencia
- Datos de demo: `src/seed/`.
- No hay usuarios reales, testimonios, métricas ni prensa. No se deben inventar.

## Product Principles

1. **La IA propone, la persona decide.** Nada se compromete sin una acción explícita.
2. **Una sola cosa principal por pantalla.** Lo que no toca en ese momento no se muestra.
3. **Calma antes que urgencia.** Sin alarmas ni presión: transiciones suaves y preguntas en lugar de avisos.
4. **Datos reales y honestidad.** Los resúmenes salen de sesiones reales, y lo que aún no existe se marca como futuro.
5. **Bienestar sin promesas de salud.** La respiración es una práctica de relajación, no un tratamiento. Ninguna afirmación de salud, tampoco en la landing.

## Accessibility & Inclusion

- Objetivos táctiles de 44 px como mínimo.
- Foco visible en todos los controles (outline de 2 px con separación de 3 px).
- `prefers-reduced-motion`: sin animación, también la del orbe y la de la respiración.
- El tiempo y el estado de la respiración se anuncian a lectores de pantalla sin saturarlos.
