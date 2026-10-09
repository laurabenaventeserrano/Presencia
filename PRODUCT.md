# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas que hacen trabajo creativo o de conocimiento y quieren decidir en qué concentrarse hoy, repartirlo en bloques y protegerlo. Audiencia secundaria: quien revisa el proyecto como pieza de portfolio.

## Product Purpose

Presencia es una web responsive con tres cosas: un chat de IA (simulada) que convierte lo que cuentas en un plan del día editable, un temporizador y un modo Respirar. Una cuadrícula de días, como la de contribuciones de GitHub, se oscurece con el foco real. La fuente de verdad es `SPEC.md`.

## Positioning

La IA propone y la persona decide. Lo vacío, lo simple, lo que está pero no molesta: una sola cosa principal por pantalla, nada que pida atención y nada que se prometa sin existir.

## Operating Context

Una sola página en `/` (Hoy, Tu día, Temporizador, En curso y Respirar) y dos enlaces discretos: Días y Ajustes. Todo vive en el navegador.

## Capabilities and Constraints

- Sin cuentas, sin servidor, sin base de datos, sin lista de tareas aparte del plan del día, sin landing, sin estadísticas con números ni rachas, sin apps nativas ni instalación.
- La IA es una simulación determinista que llama a herramientas tipadas (`propose_plan`); no usa ningún modelo real.
- Detalles técnicos en `docs/ARCHITECTURE.md`; proceso en `docs/PROCESS.md`.

## Brand Commitments

- Nombre: **Presencia**. Idioma: español. Voz breve, tranquila y en segunda persona.
- Lenguaje visual: la Orb UI de `DESIGN.md`.

## Evidence on Hand

`SPEC.md`, `DESIGN.md`, `docs/`, las capturas de `diseno/` y el archivo de Figma «Presencia». No hay usuarios reales, métricas ni testimonios, y no se inventan.

## Product Principles

1. La IA propone, la persona decide.
2. Una sola cosa principal por pantalla.
3. Calma antes que urgencia: avisos suaves, nada empieza solo.
4. Datos reales y honestidad: la cuadrícula sale del foco real; el ejemplo se marca como ejemplo.
5. Bienestar sin promesas de salud.

## Accessibility & Inclusion

WCAG 2.2 AA en todas las pantallas (AAA de contraste como objetivo), teclado completo con foco visible, áreas táctiles de 44 px, lector de pantalla sin saturar y sin movimiento con `prefers-reduced-motion`.
