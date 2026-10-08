# Handoff: Presencia (app de foco y bienestar)

## Overview
Presencia pregunta "¿Qué quieres hacer hoy?", propone bloques de tiempo editables, y el usuario decide si empezarlos o guardarlos como tareas. Incluye timer, respiración guiada y un orbe animado como único elemento de color. Dispositivos: ordenador (1280), móvil (390x844) y reloj (208x248, modo noche).

## About the Design Files
`Presencia.dc.html` es una **referencia de diseño en HTML**: un prototipo con el aspecto y el comportamiento previstos, no código de producción. Hay que **recrearlo en el entorno del proyecto destino** (React, SwiftUI, Figma, etc.) con sus patrones y librerías. Si no existe entorno, elige el framework más adecuado.

## Fidelity
**Alta fidelidad (hifi)**: colores, tipografía, espaciado e interacciones finales.

## Screens / Views
Todo el copy en español, tal cual.

### Hoy (ordenador, móvil)
- Columna centrada, máx. 560 px; padding 32/24/48 (móvil 20/20/32); gap 20.
- Orbe 160 px en reposo (coral, ámbar, melocotón), casi quieto.
- Título "¿Qué quieres hacer hoy?": 40 px (móvil 30), peso 200, tracking -0,02em.
- Respuesta IA "Entendido: dos bloques de foco, 75 minutos en total.": 16 px, peso 300, color secundario.
- Pastilla de texto: fondo pastilla, radio 32, padding 6/6/6/20, input 16 px (placeholder "Escribe lo que quieres hacer") + botón circular oscuro 48 px con flecha blanca.
- Tarjeta: blanca, radio 32, padding 24, sombra 0 1px 3px rgba(20,30,50,.04).
  - "Propuesta": filas "Escribir la propuesta" 50 min y "Revisar correos" 25 min. Cada fila: − y + (círculos 44, pasos de 5, mínimo 5), botones "Empezar" (oscuro) y "Guardar" (suave), alto 44, radio 22.
  - Separador 1 px, "Tareas": "Diseñar la pantalla", "Responder emails" con "Empezar", "Hecha" (tacha el texto), "Borrar".

### En curso
- Orbe foco (menta, cielo), 160 px (móvil 120, reloj 52). Animación completa solo con el timer en marcha; en pausa vuelve a casi quieto.
- Título del bloque 17 px peso 300 secundario; tiempo "24:18" 96 px (móvil 72, reloj 44) peso 200, tabular.
- Botones circulares 48: cerrar (izquierda) y pausar/reanudar (derecha). Enlace "Respirar" debajo.

### Respirar
- Orbe melocotón, lila, rosa (200 px, móvil 150, reloj 84) que se expande y contrae cada 5 s (scale .85 a 1.3).
- Texto "Inspira"/"Espira" (28 px peso 200), alterna cada 2,5 s. Nueve puntos (10 px) = ciclos completados. Botón cerrar vuelve a En curso.

### Reloj
Modo noche, radio de marco 48, solo En curso y Respirar.

## Interactions & Behavior
- Empezar (propuesta o tarea) → En curso con timer = minutos de la fila x 60 (tareas: 25).
- En curso → "Respirar" → Respirar; cerrar → En curso. Cerrar en En curso → Hoy (en reloj reinicia el tiempo).
- Guardar añade la fila a Tareas. Hecha alterna tachado. Borrar elimina.
- Orbe: 3 círculos (74 % del tamaño) muy desenfocados (blur = 16 % del tamaño), sin borde ni sombra, contenedor redondo. Deriva: periodos 7/9/11 s activo, 26/32/38 s en reposo (amplitud x0,12). ease-in-out infinite.
- prefers-reduced-motion: sin animación.
- Botones ≥ 44 px. Foco: outline 2 px, offset 3.

## State Management
screen (hoy/curso/resp), device, secs, running, title, rows [{name,min}], tasks [{name,done}], cycles (0-9), breathText.
Tick 1 s si curso y running. Tick 2,5 s en respirar: alterna texto y suma ciclo al volver a Inspira.

## Design Tokens
Día: fondo #f2f4f8, tarjeta #ffffff, pastilla #f6f7fa, botón suave #f1f3f6, tinta/botón oscuro #1f2430, secundario #666e80.
Noche: fondo #0e1014, tarjeta #171a21, pastilla #1d212a, botón suave #232832, tinta #f2f4f8, secundario #9aa3b2.
Orbe: coral #ee6f7a, ámbar #f5b77f, rosa #f58cc0, melocotón #fbd2c0, lila #c4b9f3, menta #b6eea3, cielo #b9e0f7.
Estados del orbe: Reposo (coral, ámbar, melocotón), Foco (menta, cielo), Respirar (melocotón, lila, rosa), Pausa (cielo, lila), Hecho (menta, ámbar, melocotón), Escucha (rosa, lila, cielo).
Espaciado: 4, 8, 12, 16, 20, 24, 32, 48. Radios: 32 tarjeta/pastilla, 22 botón de texto, 50 % circular.
Tipografía: Inter. Tiempo 200; título 200; texto 300; botones y etiquetas 400 (14 px); nunca negrita.
Iconos: trazo 1,5 px, redondeados, 20 px.

## Assets
Sin imágenes. Iconos SVG inline (flecha, cerrar, más, menos, pausa, play).

## Files
- Presencia.dc.html (pestaña "Sistema" incluye tokens y componentes)

## Figma
Con el MCP de Figma conectado en Claude Code: "Lee este README y Presencia.dc.html y recréalo en Figma con Auto Layout, variables (modos Día/Noche) y componentes (orbe con 6 variantes, campo de texto, botón circular, fila de propuesta, fila de tarea). Archivo destino: <URL>".
