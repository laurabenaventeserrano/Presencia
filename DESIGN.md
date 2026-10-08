---
name: Presencia
description: Orb UI. Una habitación en calma donde lo único con color es un orbe que respira.
colors:
  fondo: "#f2f4f8"
  tarjeta: "#ffffff"
  pastilla: "#f6f7fa"
  suave: "#f1f3f6"
  tinta: "#1f2430"
  secundario: "#666e80"
  sobre-oscuro: "#ffffff"
  punto-apagado: "#d5d9e1"
  fondo-noche: "#0e1014"
  tarjeta-noche: "#171a21"
  pastilla-noche: "#1d212a"
  suave-noche: "#232832"
  tinta-noche: "#f2f4f8"
  secundario-noche: "#9aa3b2"
  sobre-oscuro-noche: "#0e1014"
  punto-apagado-noche: "#2d333f"
  orbe-coral: "#ee6f7a"
  orbe-ambar: "#f5b77f"
  orbe-rosa: "#f58cc0"
  orbe-melocoton: "#fbd2c0"
  orbe-lila: "#c4b9f3"
  orbe-menta: "#b6eea3"
  orbe-cielo: "#b9e0f7"
typography:
  tiempo:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "96px"
    fontWeight: 200
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  titulo:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 200
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  respiracion:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 200
    letterSpacing: "-0.02em"
  item:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 300
  cuerpo:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 300
  secundario:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 300
  campo:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  enlace:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  etiqueta:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
rounded:
  tarjeta: "8px"
  boton: "4px"
  circulo: "50%"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "32": "32px"
  "48": "48px"
components:
  boton-oscuro:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.sobre-oscuro}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.boton}"
    padding: "0 20px"
    height: "44px"
  boton-suave:
    backgroundColor: "{colors.suave}"
    textColor: "{colors.tinta}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.boton}"
    padding: "0 20px"
    height: "44px"
  boton-icono:
    backgroundColor: "{colors.suave}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.boton}"
    size: "48px"
  boton-icono-fila:
    backgroundColor: "{colors.suave}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.boton}"
    size: "44px"
  boton-icono-oscuro:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.sobre-oscuro}"
    rounded: "{rounded.boton}"
    size: "48px"
  campo:
    backgroundColor: "{colors.pastilla}"
    textColor: "{colors.tinta}"
    typography: "{typography.campo}"
    rounded: "{rounded.tarjeta}"
    padding: "6px 6px 6px 20px"
  tarjeta:
    backgroundColor: "{colors.tarjeta}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.tarjeta}"
    padding: "24px"
  enlace:
    backgroundColor: "transparent"
    textColor: "{colors.secundario}"
    typography: "{typography.enlace}"
    padding: "0 20px"
    height: "44px"
  volver-hoy:
    backgroundColor: "transparent"
    textColor: "{colors.secundario}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.boton}"
    padding: "0 12px"
    height: "44px"
  linea-en-marcha:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    typography: "{typography.item}"
    height: "44px"
  punto:
    backgroundColor: "{colors.punto-apagado}"
    rounded: "{rounded.circulo}"
    size: "10px"
  punto-encendido:
    backgroundColor: "{colors.tinta}"
    rounded: "{rounded.circulo}"
    size: "10px"
---

<!-- Fuente: diseno/handoff (README.md, Presencia.dc.html; copia de ~/Documents/design_handoff_presencia) y el archivo de Figma «Presencia». Implementado en src/tokens.css y src/components/. -->

# Design System: Presencia

## Overview

**Creative North Star: "La habitación en calma"**

Presencia es una habitación neutra y silenciosa: grises fríos, blancos y tinta azulada. Lo único vivo en ella es una luz que respira, el orbe. Todo lo demás se retira. No hay acentos, ni bordes de línea, ni negritas, ni nada que reclame atención. La jerarquía sale del tamaño, del peso fino de Inter y de dos tonos (tinta y secundario), nunca del color ni del contraste fuerte.

La densidad es baja y vertical. Cada pantalla tiene una sola cosa principal, centrada y con aire: el orbe arriba, el título o el tiempo debajo y, en Hoy, una columna de 560 px como máximo. Los controles son blandos y discretos: formas casi rectas, sin borde, en tonos casi iguales al fondo. Se notan cuando los buscas, no antes. Hay un solo control oscuro por fila, para la acción principal.

El sistema tiene dos modos de luz, Día y Noche, que intercambian los mismos papeles sin cambiar la composición. El reloj vive siempre en Noche. No hay urgencia visual: ni rojos de error, ni parpadeos, ni badges, ni contadores agresivos. Tampoco ruido visual.

**Key Characteristics:**
- Un único elemento de color: el orbe, de tres manchas difuminadas.
- Neutros fríos y tonales en Día y en Noche. La profundidad sale del tono, no de la línea.
- Inter de 200 a 400. Nunca negrita.
- Formas casi rectas: 8 en tarjetas y en el campo, 4 en todos los botones. El orbe es la única forma redonda.
- Composición centrada y vertical, con una cosa principal por pantalla.
- Movimiento lento y orgánico, siempre desactivable con movimiento reducido.

## Colors

Una paleta neutra de grises azulados fríos para toda la interfaz, y siete pasteles cálidos y fríos reservados en exclusiva al orbe.

### Primary
- **Tinta azul noche** (`tinta` / `tinta-noche`): todo el texto principal, el botón de la acción principal («Empezar», enviar) y el punto encendido. En Noche se invierte a casi blanco.

### Secondary
- **Pizarra suave** (`secundario` / `secundario-noche`): respuesta de la IA, minutos, etiquetas («Propuesta», «Tareas»), título del bloque en curso, enlace «Respirar», placeholder y tareas hechas.

### Tertiary
- **Paleta del orbe**, solo para el orbe: **Coral** (`orbe-coral`), **Ámbar** (`orbe-ambar`), **Rosa** (`orbe-rosa`), **Melocotón** (`orbe-melocoton`), **Lila** (`orbe-lila`), **Menta** (`orbe-menta`) y **Cielo** (`orbe-cielo`). Se combinan de tres en tres según el estado:
  - **Reposo:** coral, ámbar y melocotón.
  - **Escucha:** rosa, lila y cielo.
  - **Foco:** menta, cielo y menta.
  - **Pausa:** cielo, lila y cielo.
  - **Hecho:** menta, ámbar y melocotón.
  - **Respirar:** melocotón, lila y rosa.

### Neutral
- **Niebla fría** (`fondo` / `fondo-noche`): el lienzo de cada pantalla.
- **Blanco tarjeta** (`tarjeta` / `tarjeta-noche`): la tarjeta de Propuesta y Tareas, la única superficie elevada.
- **Pastilla** (`pastilla` / `pastilla-noche`): el fondo del campo de texto.
- **Suave** (`suave` / `suave-noche`): botones circulares y botones secundarios, y el separador de 1 px.
- **Sobre oscuro** (`sobre-oscuro` / `sobre-oscuro-noche`): texto e icono sobre el botón oscuro.
- **Punto apagado** (`punto-apagado` / `punto-apagado-noche`): los ciclos de respiración que faltan.

### Named Rules
**The Single Light Rule.** El color es exclusivo del orbe. Ningún botón, texto, estado, enlace ni gráfico usa un color de la paleta del orbe ni ningún otro tono saturado.

**The Same Room Rule.** Día y Noche cambian valores, nunca papeles. Cada componente usa el mismo token semántico en los dos modos.

## Typography

**Display Font:** Inter (con system-ui, sans-serif)
**Body Font:** Inter (con system-ui, sans-serif)

**Character:** una sola familia en pesos muy finos. Los tamaños grandes (título y tiempo) se escriben en 200 con el tracking ligeramente cerrado. Así lo principal pesa por tamaño, no por grosor.

### Hierarchy
- **Tiempo** (200; 96 / 72 en móvil / 44 en reloj; line-height 1; números tabulares): el tiempo restante en En curso.
- **Título** (200; 40 / 30 en móvil; 1.1): «¿Qué quieres hacer hoy?».
- **Respiración** (200; 28 / 18 en reloj): «Inspira» y «Espira».
- **Ítem** (300, 17): nombres de propuestas y tareas, y título del bloque en curso (12 en reloj).
- **Cuerpo** (300, 16): la respuesta de la IA.
- **Secundario** (300, 15): minutos y mensajes de lista vacía.
- **Campo** (400, 16): el texto que se escribe.
- **Enlace** (400, 15, subrayado con 5 px de separación): «Respirar».
- **Etiqueta** (400, 14): botones de texto y etiquetas de sección.

### Named Rules
**The Featherweight Rule.** Ningún texto pasa de 400. Nunca se usa negrita, ni para enfatizar ni en botones.

## Layout

- **Hoy:** una columna centrada de 560 px como máximo. Padding de 32 / 24 / 48 (20 / 20 / 32 en móvil) y 20 px entre bloques. Orden fijo: caja del orbe (200 px), título, respuesta, campo y tarjeta. Con un bloque en marcha o en pausa, la tarjeta empieza con la línea del bloque en marcha y un separador.
- **En curso y Respirar:** todo centrado en los dos ejes, con 20 px entre elementos (6 px en reloj). La caja del orbe mide 200 / 140 / 60 en En curso y 300 / 220 / 110 en Respirar. En Respirar, el botón cerrar se fija arriba a la izquierda, a 24 px (8 px en reloj). En En curso, ese mismo sitio lo ocupa «Hoy» (salvo en el reloj, que no tiene Hoy).
- **Dispositivos:**
  - Ordenador: 1280 × 800.
  - Móvil: 390 × 844 con marco de radio 44. Por debajo de 600 px se usan los valores de móvil.
  - Reloj: 208 × 248 con marco de radio 48. Siempre en Noche y sin pantalla Hoy.
- **Escala de espaciado:** 4, 8, 12, 16, 20, 24, 32 y 48. Entre controles de una fila, 8. Entre controles de En curso, 24 (12 en reloj). Entre puntos, 12 (6 en reloj).

## Elevation & Depth

El sistema es plano y tonal. La profundidad sale de los saltos de luminosidad entre fondo, tarjeta, pastilla y suave, nunca de bordes ni de sombras marcadas. La única sombra es ambiental y casi invisible, y solo la lleva la tarjeta. El orbe aporta la única sensación de volumen, con su desenfoque.

### Shadow Vocabulary
- **Ambiente de tarjeta** (`box-shadow: 0 1px 3px rgba(20, 30, 50, .04)`): solo la tarjeta de Hoy.

### Named Rules
**The No-Line Rule.** No hay bordes de línea en ningún componente. La única línea permitida es el separador de 1 px en color `suave` dentro de la tarjeta.

## Shapes

Las formas son casi rectas y precisas, y así el orbe destaca como la única curva:
- Tarjeta y campo: esquinas de 8 px.
- Botones de texto y de icono: esquinas de 4 px. Los de icono son cuadrados de 48 o 44 px.
- Orbe y puntos de respiración: los únicos círculos.

### Named Rules
**The One Curve Rule.** El orbe es la única forma redonda del sistema, junto con los puntos de respiración. Ningún botón, campo ni tarjeta es una píldora ni un círculo.

Los iconos llevan un trazo de 1,5 px con extremos redondeados, se dibujan a 20 px sobre una retícula de 24, y no tienen relleno, salvo el triángulo de reanudar, que solo lleva contorno.

## Components

### Buttons
- **Shape:** esquinas de 4 px, tanto en texto como en icono.
- **Primary (`boton-oscuro`):** fondo de tinta y texto sobre oscuro, 44 px de alto, 20 px de padding horizontal. Uno por fila: «Empezar».
- **Secondary (`boton-suave`):** fondo suave y texto de tinta: «Guardar», «Hecha», «Borrar».
- **De icono (`boton-icono`, `boton-icono-fila`, `boton-icono-oscuro`):** cuadrados de esquinas 4.
  - 48 px para cerrar y para pausar/reanudar.
  - 44 px para −/+ en las filas.
  - Oscuro solo para enviar en el campo.
- **Disabled:** opacidad al 40 % (−5 cuando la fila está en el mínimo de 5 min).
- **Focus:** contorno de 2 px en tinta, separado 3 px. No hay estados hover con color.

### Inputs / Fields
- **Style (`campo`):** franja de esquinas 8 en color pastilla, sin borde. Padding de 6 / 6 / 6 / 20, texto de 16, placeholder en secundario («Escribe lo que quieres hacer») y botón de icono oscuro de enviar dentro.
- **Focus:** el mismo contorno de 2 px en tinta, separado 6 px.

### Cards / Containers
- **Corner Style:** 8 px.
- **Background:** tarjeta.
- **Shadow Strategy:** solo el ambiente de tarjeta.
- **Border:** ninguno.
- **Internal Padding:** 24 px, con 20 px entre secciones. Las listas vacías muestran texto en secundario.

### Filas de propuesta y tarea
- **Propuesta:** arriba, el nombre (ítem) y a la derecha el control de minutos `(−) 50 min (+)`. Debajo, «Empezar» y «Guardar» juntos a la izquierda. Así nunca se parte la fila en móvil.
- **Tarea:** nombre, y debajo «Empezar», «Hecha» y «Borrar». Si está hecha, el nombre se tacha y pasa a secundario.

### Enlace
- **Style (`enlace`):** «Respirar», en secundario y subrayado, con área táctil de 44 px.

### Volver a Hoy y línea del bloque en marcha
Motivo: así puedes mirar o ajustar el día sin cortar el bloque, y la propia pantalla Hoy te explica por qué Empezar está bloqueado.
- **Volver a Hoy (`volver-hoy`):** control de texto «Hoy» en etiqueta y secundario, sin fondo ni subrayado, arriba a la izquierda de En curso. Área táctil de 44 px y el foco de siempre. Pasa a tinta al pasar el cursor. Lleva a Hoy sin terminar el bloque.
- **Línea del bloque en marcha (`linea-en-marcha`):** primera fila de la tarjeta de Hoy mientras hay un bloque en marcha o en pausa. Título del bloque (ítem) a la izquierda y tiempo restante (secundario, números tabulares) a la derecha, 44 px de alto, sin fondo. Debajo, el separador. Toda la línea lleva de vuelta a En curso.
- Mientras tanto, los «Empezar» de las filas se desactivan (opacidad de deshabilitado) y dicen «Ya hay un bloque en marcha».

### Orbe (componente distintivo)
- Tres manchas circulares al 74 % del tamaño, con opacidad de .95, dentro de un contenedor redondo y desenfocadas al 16 % del tamaño. Sin borde ni sombra.
- **Tamaños:**
  - Hoy: 160.
  - En curso: 160 / 120 / 52.
  - Respirar: 200 / 150 / 84.
- **Movimiento:** deriva de 7, 9 y 11 s cuando está activo, y de 26, 32 y 38 s en reposo (amplitud ×0,12). En Respirar se expande de .85 a 1.3 cada 5 s. Con movimiento reducido no se anima.

### Punto de respiración
- Círculo de 10 px (6 en reloj): apagado o en tinta. Nueve en fila, uno por ciclo completado.

## Do's and Don'ts

### Do:
- **Do** reservar todo el color para el orbe y elegir sus tres colores según el estado (Reposo, Escucha, Foco, Pausa, Hecho, Respirar).
- **Do** usar tokens semánticos (`tinta`, `suave`, `tarjeta`…) para que el cambio entre Día y Noche sea solo de modo.
- **Do** mantener una sola acción oscura por fila y mostrar el resto en suave.
- **Do** reservar la curva al orbe y a los puntos: tarjetas y campo con esquinas de 8, botones con esquinas de 4.
- **Do** respetar los 44 px mínimos de área táctil y el contorno de foco de 2 px.
- **Do** dejar que el aire y el tamaño hagan la jerarquía: título y tiempo en 200, todo centrado.

### Don't:
- **Don't** usar color fuera del orbe: ni acentos, ni estados de color, ni enlaces azules.
- **Don't** usar pesos por encima de 400 ni negrita.
- **Don't** usar píldoras ni círculos en controles o contenedores.
- **Don't** añadir bordes de línea ni sombras más allá de `0 1px 3px rgba(20, 30, 50, .04)` en la tarjeta.
- **Don't** usar alarmas ni urgencia visual: rojos de error, parpadeos, badges o contadores agresivos.
- **Don't** añadir ruido visual: iconos decorativos, ilustraciones, texturas, degradados fuera del orbe o más de una cosa principal por pantalla.
