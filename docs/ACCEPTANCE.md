# Guion de pruebas

Cada hito se cierra cuando la persona ejecuta este guion en el navegador y todo pasa. Si un paso falla, el hito no está terminado, aunque los tests automáticos estén en verde. Entre paréntesis, la historia de SPEC.md que se comprueba.

Prepara antes: `npm run dev` y el navegador en el link que salga (la app vive en la raíz). Para móvil, la herramienta de dispositivos del navegador (Cmd + Option + I y Cmd + Shift + M) a 390 px.

## Prueba rápida antes de subir a producción (10 minutos)

Si hoy solo hay tiempo para una comprobación, esta basta para unir a `main` un punto de despliegue en verde. Haz solo los pasos de las historias que ese punto incluye (ver docs/FASE1.md, apartado 4 bis). El guion completo, el día que puedas.

1. Abro la raíz del sitio (la previsualización de Vercel o `npm run dev`): veo Hoy casi vacía, sin errores en la consola.
2. Pulso Temporizador, pongo 1 minuto y Play: la cuenta atrás baja. Pauso, reanudo y recargo: el tiempo sigue bien.
3. Pulso Respirar, 1 minuto: veo "Coge aire" y "Suéltalo".
4. (Desde P2) Escribo `escribir la propuesta, revisar correos y llamar a Marta`: aparece Tu día con bloques editables. Edito uno y pulso Empezar.
5. (Desde P3) Entro en Días: veo la cuadrícula y "Ver un ejemplo" la rellena.
6. A 390 px nada se corta, y con Tab el foco se ve en todo.
7. En GitHub, el último commit tiene la marca verde.
8. `/app` redirige a la raíz y una ruta inexistente no da un 404 de Vercel.

## M0: orden y limpieza

- [ ] `git status --short` no muestra cambios sin guardar.
- [ ] No queda en la interfaz ninguna lista de tareas persistente ni botón "Guardar".
- [ ] `npm test`, `npx tsc --noEmit`, `npm run build` y `npm run test:e2e` terminan en verde.
- [ ] Al hacer un push, GitHub muestra una marca verde junto al commit.

## M1: el plan del día, temporizador, descanso y respirar

**El plan del día**
1. Abro la web sin datos guardados: veo el orbe, el campo, Temporizador, Respirar y los enlaces Días y Ajustes, y nada más (A1).
2. Escribo `escribir la propuesta, revisar correos y llamar a Marta` y envío: aparece "Tu día" con al menos 3 bloques con título y minutos, y el tiempo total (A2).
3. Cambio el título de un bloque y sus minutos con − y +. Escribo 500: se corrige a 120 con un texto (A6, A7).
4. Pulso "Quitar" en un bloque: desaparece y puedo pulsar "Deshacer" (A8).
5. Pulso "Añadir bloque": aparece uno vacío editable (A9).
6. Pulso "Otra propuesta" tres veces: la lista cambia entera (A5).
7. Escribo `asdf` y envío: aparece un bloque editable y ningún error (A3).
8. Dejo el campo vacío: el botón de enviar está desactivado y un texto lo explica. Pulso "Sugiéreme un día" y aparece una lista de 3 o 4 bloques (A4).
9. Escribo una lista larga de cosas y compruebo que la propuesta incluye un "Respirar" de 3 minutos entre bloques (A15).
10. Pulso Empezar en un bloque: arranca En curso con su título y sus minutos (A10).
11. Pulso "Hoy": la lista sigue ahí con el estado de cada bloque, y arriba hay una franja con el bloque en curso (A14, B8).
12. Con el bloque en marcha, Temporizador, Respirar y Empezar están desactivados con "Ya hay un bloque en marcha" (B7).
13. Termino el bloque: queda como "Hecho" con los minutos reales y el siguiente no arranca solo (A11).
14. Pulso "Más tarde" en un bloque pendiente y elijo 15 minutos: queda como "Más tarde, HH:MM" (A12).
15. Espero a que llegue esa hora (o uso un aplazamiento corto de prueba): aparece el aviso suave "Toca: ..." con Empezar (A12).
16. Recargo la página: la lista y los estados siguen igual (A14).

**Temporizador**
17. En En curso, pulso Pausar: el tiempo se congela. Pulso Reanudar: sigue (B3).
18. Pulso "Más tarde" con un bloque en marcha: vuelve a Tu día como "Más tarde" con los minutos que le quedaban (B4).
19. Pulso Espacio: pausa y reanuda (B10).
20. Recargo con F5: el tiempo restante es correcto (B2).
21. El título de la pestaña muestra el tiempo (B9).
22. Pulso Terminar: aparece "¿Terminar este bloque?". Confirmo y vuelvo a Hoy (B5).
23. Pulso Temporizador, elijo 15 minutos, escribo un título y pulso Play, sin usar el chat (B1).
24. Dejo que un bloque de 1 minuto llegue a cero: aviso suave con "+5 min", "Descanso", "Respirar" y "Terminar". Nada empieza solo (B6).
25. Pulso "Descanso": arranca un descanso de 5 minutos con la misma pantalla (C1).

**Respirar**
26. Pulso Respirar, elijo 1 minuto y empiezo (R1).
27. Veo "Coge aire" y "Suéltalo" cada 5 segundos con el orbe expandiéndose y contrayéndose (R2).
28. Pulso Pausar y luego Terminar: responde al instante (R3).
29. Dejo que llegue a cero: aparece "Hecho" (R4).
30. Con una respiración en marcha, Temporizador y Respirar están desactivados (R5).

**Ajustes**
31. Activo Sonido y dejo terminar un bloque corto: suena un tono suave (E1).
32. Activo Avisos, cambio de pestaña y dejo terminar un bloque: llega un aviso del navegador (E2).
33. Cambio el tema del sistema a oscuro: la web lo sigue (E3).
- Activo "Ver lo que hace la IA" y pido un plan: bajo Tu día aparece una línea con la herramienta que llamó la IA y cuántos bloques propuso, y "Ver detalle" muestra la llamada completa (E4).

**Accesibilidad y responsive**
34. Recorro todas las pantallas solo con teclado. El foco se ve siempre y todo se puede activar (G2).
35. El campo de texto se distingue a simple vista de su fondo, en claro y en oscuro, y tiene una etiqueta visible (G3).
36. A 390 px, todos los botones se pulsan sin acertar otro por casualidad (G4, H2).
37. Con VoiceOver, los botones se anuncian con nombre completo ("Quitar bloque Revisar correos") y el tiempo se anuncia cada minuto (G5, B11).
38. Activo "Reducir movimiento" en el sistema: el orbe no se mueve (G6).
39. Amplío al 200 %: no se pierde contenido ni hay scroll horizontal de la página (G7).
40. Recorro las pantallas a 320, 390, 768 y 1440 px: nada se corta ni se solapa (H1).

(A13, que el plan es de un solo día, y X1, X2 y X3, la preparación para un agente, se comprueban con pruebas automáticas.)

## M2: Días

1. Entro en Días sin datos: todos los cuadrados son blancos, con contorno, y un texto invita a planificar el día (D1, D11).
2. Pulso "Ver un ejemplo": se rellena un año de actividad marcado como "Ejemplo", con semanas llenas entre lunes y viernes, fines de semana casi en blanco y un par de semanas vacías (D12, D2).
3. Miro la leyenda: "Menos" y "Más" con cinco tonos de un mismo color (D6).
4. Pulso un cuadrado: debajo aparece "12 oct: 95 min de foco en 3 bloques" (D5).
5. Con teclado, entro en la cuadrícula con una sola pulsación de Tab, me muevo con las flechas y selecciono con Enter (D8).
6. Hago un bloque de foco de 1 minuto y lo termino: el cuadrado de hoy se oscurece, con el ejemplo cargado (D13, D4).
7. Pulso "Quitar ejemplo": desaparecen los datos de ejemplo y queda mi bloque de hoy (D14).
8. Hago un descanso y una respiración: el cuadrado de hoy no cambia (D3).
9. Aplazo un bloque con "Más tarde" después de trabajar unos minutos: esos minutos cuentan (D4).
10. Pulso "Borrar mis datos": pide confirmación y deja todo en blanco, ejemplo incluido (D15).
11. Recargo la página: los días siguen ahí (D16).
12. En móvil (390 px) la cuadrícula cabe sin scroll horizontal de la página, la semana actual se ve al abrir y los cuadrados se pueden pulsar (D9).
13. Con un lector de pantalla, cada cuadrado se anuncia con su fecha y sus minutos (D7).

## Cierre de la fase 1

1. `npm run verify` termina en verde y su matriz muestra todas las historias de SPEC.md con su prueba y en verde.
2. GitHub muestra la marca verde en el último commit y la previsualización de Vercel de la rama carga la web.
3. Para subirlo a producción: en GitHub, "Compare & pull request" de `fase-1` contra `main` y "Merge". Vercel despliega `main` solo, y en unos minutos la URL de producción muestra la web.
4. He ejecutado M1 y M2 de este guion sin ningún fallo.
5. `SPEC.md`, `CLAUDE.md` y `PRODUCT.md` describen lo mismo y no mencionan nada que no exista.
