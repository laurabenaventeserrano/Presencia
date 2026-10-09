# Presencia: especificación v6

Sustituye a todas las versiones anteriores. Es la fuente de verdad del producto. El diseño visual está en DESIGN.md y este documento no lo define. Si algo de aquí contradice un prompt, manda este documento. Si hay que cambiar el alcance, se edita este documento primero y después se construye.

## 0. Para el agente de IA: qué estamos haciendo

**Esto es un concepto de portfolio**, hecho por una diseñadora de producto senior. No es un negocio ni se va a vender. Sirve para demostrar criterio de diseño y que sabe construirlo con calidad. Por eso importa más que cada cosa funcione y esté bien pensada que añadir cosas.

**La filosofía es lo vacío, lo simple, lo que está pero no molesta.** Cada decisión se resuelve así: ante la duda, quita. Una pantalla tiene una sola cosa principal. Nada pide atención, nada se mueve sin motivo, nada se promete que no existe.

**Qué es Presencia.** Una web responsive (ordenador y móvil) con exactamente tres cosas:
1. **Un chat de IA para planificar el día.** La persona cuenta qué necesita hacer hoy y la IA le propone una lista de bloques de tiempo. La persona los edita y los va haciendo durante el día.
2. **Un temporizador.**
3. **Un modo Respirar** (respiración guiada).

Y una gamificación muy callada: una **cuadrícula de días**, como la de contribuciones de GitHub, donde cada día es un cuadrado que se oscurece cuanto más se ha concentrado la persona. Con el tiempo, los cuadrados forman un dibujo.

**Qué NO hay, y no se construye:**
- No hay cuentas, registro, inicio de sesión ni usuario.
- No hay servidor ni base de datos. Todo vive en el navegador de la persona.
- No hay lista de tareas aparte de la lista del día que propone la IA.
- No hay landing page, planes de pago ni "Premium".
- No hay estadísticas con números, rachas, puntos, niveles ni clasificaciones.
- No hay apps nativas ni widgets. No hay que poder instalarla.

**Preparada para ser agéntica.** Hoy la IA es una simulación, y la fase 1 **no es un proyecto agéntico y no se presenta como tal**. Pero se construye de forma que pueda serlo: la IA no toca la aplicación directamente, sino que **llama a herramientas tipadas** (por ejemplo, `propose_plan`), y la persona acepta, edita o descarta lo que propone. Cuando se sustituya la simulación por un modelo real con herramientas (fase 2, sección 7), las herramientas y las pantallas ya estarán ahí.

**La idea de futuro, que NO se construye ahora:** conectar los dispositivos de la persona. Se menciona solo para que el código no la bloquee: todo el acceso al almacenamiento va en un único módulo, de modo que algún día se pueda cambiar.

**Cómo trabajar.** Lee PROCESS.md y docs/FASE1.md. Resumen: plan aprobado una vez y ejecución continua; cada historia tiene una prueba y no se da por terminada sin pasarla; si algo no está definido en DESIGN.md, aplica la solución mínima coherente con los tokens y anótala como decisión de diseño pendiente, sin detenerte; si la accesibilidad exige apartarse de DESIGN.md, manda la accesibilidad y se anota; si algo falla dos veces, para y enseña el error.

**Dónde vive la app.** En la raíz del sitio (`/`). No hay landing. La ruta antigua `/app` redirige a `/`.

**Qué existe ya y se reutiliza:** el temporizador que guarda `endsAt`, la IA simulada (`AIProvider` y `MockProvider`), el componente Orb, los tokens y los tests. **Qué se elimina:** la lista de tareas persistente, los botones "Guardar", y cualquier código de cuentas.

## 1. Pantallas

Casi todo ocurre en una sola página. La navegación son dos enlaces en texto, discretos: **Días** y **Ajustes**.

- **Hoy.** Al empezar el día, casi vacía: el orbe, un campo de texto ("¿Qué necesitas hacer hoy?") y dos acciones, **Temporizador** y **Respirar**, más los enlaces Días y Ajustes. Cuando la IA ha propuesto un plan, aparece debajo **Tu día**: la lista de bloques.
- **Tu día.** Cada bloque muestra su título, sus minutos y su estado (pendiente, más tarde, hecho). Se puede editar, quitar, empezar o aplazar. Al final, "Añadir bloque" y "Otra propuesta".
- **Temporizador.** Elegir minutos y título opcional, y Play.
- **En curso.** Pantalla completa: título, tiempo, Pausar o Reanudar, Más tarde y Terminar. Un enlace "Hoy" permite volver sin terminar.
- **Respirar.** Elegir duración y empezar; pantalla guiada "Coge aire" y "Suéltalo".
- **Días.** La cuadrícula, la leyenda y el detalle del día elegido.
- **Ajustes.** Tres interruptores: sonido al terminar, avisos del navegador y "Ver lo que hace la IA".

## 2. Historias y pruebas

Cada historia tiene una prueba que se hace en el navegador: qué haces y qué debe pasar. Una historia no está terminada hasta que su prueba pasa.

### A. Hoy y el chat de IA (plan del día)

| ID | Historia | Prueba |
| --- | --- | --- |
| A1 | Hoy empieza casi vacía | Abro la web sin nada guardado: veo el orbe, el campo de texto, Temporizador, Respirar y los enlaces Días y Ajustes, y nada más |
| A2 | Cuento qué necesito hacer y recibo mi día en bloques | Escribo "escribir la propuesta, revisar correos y llamar a Marta" y envío: aparece "Tu día" con al menos 3 bloques con título y minutos, y el tiempo total |
| A3 | Siempre hay plan, nunca un error | Escribo "asdf" y envío: aparece un bloque editable con ese texto como título y ningún mensaje de error |
| A4 | "Sugiéreme un día" con el campo vacío | Con el campo vacío, el botón de enviar está desactivado y un texto lo explica. Pulso "Sugiéreme un día": aparece una lista variada de 3 a 4 bloques |
| A5 | Otra propuesta | Pulso "Otra propuesta" tres veces: la lista cambia entera cada vez. El mismo texto, el mismo día y la misma tanda da el mismo resultado |
| A6 | Edito el título de cualquier bloque | Cambio el texto de un bloque y pulso Empezar: usa el título nuevo |
| A7 | Edito los minutos de cualquier bloque | Uso − y + (de 5 en 5) o escribo un número: mínimo 5, máximo 120. Si escribo 500, se corrige a 120 y un texto lo explica |
| A8 | Quito un bloque | Pulso "Quitar": desaparece y durante 8 segundos puedo pulsar "Deshacer" |
| A9 | Añado un bloque | Pulso "Añadir bloque": aparece uno vacío listo para editar |
| A10 | Empiezo un bloque de la lista | Pulso Empezar en uno: arranca En curso con ese título y esos minutos. Solo uno a la vez |
| A11 | Lo hago y queda hecho | Al terminar un bloque de la lista, queda marcado como "Hecho" con los minutos reales. La lista sigue y el siguiente no arranca solo |
| A12 | Aplazo un bloque a más tarde | Pulso "Más tarde" en un bloque y elijo 15 minutos, 30 minutos o 1 hora: queda como "Más tarde, 16:30". A esa hora aparece un aviso suave "Toca: Revisar correos" con Empezar. Si la pestaña está cerrada, no hay aviso |
| A13 | El plan es de hoy | Al cambiar el día, la lista de ayer ya no aparece. Solo queda su rastro en la cuadrícula |
| A14 | El plan no se pierde | Voy a En curso y vuelvo, o recargo la página: la lista sigue ahí con el estado de cada bloque |
| A15 | La IA incluye un respiro | Una propuesta larga incluye un bloque "Respirar" de 3 minutos entre bloques de foco, que puedo empezar o quitar |

### B. Temporizador

| ID | Historia | Prueba |
| --- | --- | --- |
| B1 | Activo el temporizador sin el chat | Pulso Temporizador, elijo 15, 25 o 50 minutos, o escribo otros, pongo un título opcional (si lo dejo vacío se llama "Sin título") y pulso Play: arranca En curso |
| B2 | Veo la cuenta atrás | El tiempo baja cada segundo y, al recargar, sigue correcto |
| B3 | Pauso y reanudo | Pulso Pausar: el tiempo se congela. Pulso Reanudar: sigue donde estaba |
| B4 | Aplazo el bloque en marcha | Pulso "Más tarde" en En curso y elijo 15 minutos, 30 minutos o 1 hora: el bloque vuelve a Tu día como "Más tarde, HH:MM", conserva los minutos que le quedaban y los minutos trabajados hasta entonces cuentan |
| B5 | Termino el bloque | Pulso Terminar: aparece "¿Terminar este bloque?" con Terminar y Seguir. Al confirmar, vuelvo a Hoy y los minutos de foco reales quedan guardados |
| B6 | Aviso suave al terminar | Al llegar a cero, un aviso suave (nunca una alarma brusca) con las opciones "+5 min", "Descanso", "Respirar" y "Terminar". Nada empieza solo |
| B7 | Un solo bloque activo | Con un bloque en marcha, Temporizador, Respirar y Empezar están desactivados con el texto "Ya hay un bloque en marcha" y un enlace "Ir al bloque" |
| B8 | Vuelvo a Hoy sin terminar | Pulso "Hoy" en En curso: veo Hoy con una franja discreta arriba con el título y el tiempo, que me devuelve al bloque |
| B9 | Veo el tiempo en la pestaña | El título de la pestaña muestra el tiempo restante mientras corre |
| B10 | Atajos de teclado | En En curso, Espacio pausa y reanuda. Escape cierra cualquier diálogo |
| B11 | Lector de pantalla | El tiempo se anuncia cada minuto y al terminar, no cada segundo |

### C. Descanso

| ID | Historia | Prueba |
| --- | --- | --- |
| C1 | Descanso corto | Al terminar un bloque pulso "Descanso": arranca un bloque de descanso de 5 minutos con la misma pantalla En curso |
| C2 | El descanso no cuenta como foco | Un descanso no colorea la cuadrícula de Días |

### R. Respirar

| ID | Historia | Prueba |
| --- | --- | --- |
| R1 | Activo la respiración | Pulso Respirar, elijo 1, 3 o 5 minutos y empiezo |
| R2 | Me guía | Aparece "Coge aire" y "Suéltalo" cada 5 segundos, con el orbe expandiéndose y contrayéndose, y el tiempo restante |
| R3 | La pauso o la termino | Pulso Pausar o Terminar y responde al instante |
| R4 | Termina y me lo dice | Al llegar a cero aparece "Hecho", sin alarma brusca |
| R5 | Cuenta como bloque | Con una respiración en marcha, Temporizador y Respirar están desactivados con "Ya hay un bloque en marcha" |
| R6 | No colorea la cuadrícula | Respirar no cambia el color de los días |
| R7 | Sin promesas de salud | Ningún texto afirma beneficios médicos |

### D. Días: la cuadrícula

La gamificación. Cada día es un cuadrado. Cuanto más foco, más oscuro. Sin foco, blanco. Los cuadrados forman un dibujo con el tiempo.

| ID | Historia | Prueba |
| --- | --- | --- |
| D1 | Veo mis días como cuadrados | En Días hay una cuadrícula de los últimos 12 meses, un cuadrado por día |
| D2 | El color dice cuánto me concentré | Con 0 minutos de foco el cuadrado es blanco (con un contorno fino para verse). Con más foco, cinco tonos cada vez más oscuros: 1 a 24 min, 25 a 59, 60 a 119, 120 a 179 y 180 o más |
| D3 | Solo cuenta el foco | Los bloques de foco colorean; los descansos y las respiraciones no (C2, R6) |
| D4 | Un bloque cuenta lo real | Un bloque terminado antes de tiempo o aplazado cuenta los minutos realmente trabajados. Los "+5 min" cuentan |
| D5 | Veo el detalle de un día | Pulso un cuadrado, o lo selecciono con teclado: debajo aparece "12 oct: 95 min de foco en 3 bloques" |
| D6 | Hay leyenda | Debajo hay "Menos" y "Más" con los cinco tonos entre medias |
| D7 | Nada depende solo del color | Cada cuadrado tiene nombre accesible ("12 oct, 95 minutos de foco") y existe el texto de detalle |
| D8 | Se maneja con teclado | Con las flechas me muevo entre días y con Enter selecciono. La cuadrícula es una sola parada de Tab |
| D9 | Se adapta al móvil | En móvil la cuadrícula cabe en el ancho sin scroll horizontal de la página, con cuadrados de al menos 24 px, y la semana actual se ve al abrir |
| D10 | El día es el de mi zona horaria | Un bloque iniciado a las 23:50 cuenta para ese día |
| D11 | Estado vacío | Sin datos, todos los cuadrados son blancos y un texto invita a planificar el día |
| D12 | Datos de ejemplo | Con pocos datos, un enlace "Ver un ejemplo" rellena la cuadrícula con un año de actividad de una persona de ejemplo, marcado como "Ejemplo" |
| D13 | Lo mío se suma al ejemplo | Con el ejemplo cargado, terminar un bloque real oscurece el cuadrado de hoy |
| D14 | Quito el ejemplo | "Quitar ejemplo" elimina solo los datos de ejemplo y deja los reales |
| D15 | Los datos son míos y locales | Un texto dice "Tus días se guardan solo en este navegador". "Borrar mis datos" pide confirmación y lo deja todo en blanco, ejemplo incluido |
| D16 | Persisten | Cierro y abro la web: los días siguen ahí |

**El dibujo (propuesta, se afinará más adelante).** El dibujo no se impone: es el mapa de la atención de cada persona, y se forma solo con lo que hace. Para que se lea como imagen y no como tabla, la cuadrícula usa un solo tono (el coral del orbe en reposo) de blanco a oscuro, cuadrados con esquinas redondeadas y poca separación entre ellos. El patrón de cada persona (semanas llenas y vacías, picos, descansos) es lo que dibuja. La persona de ejemplo tiene un ritmo reconocible: semanas con foco entre lunes y viernes, fines de semana casi en blanco, un par de semanas vacías de vacaciones y algún pico.

### E. Ajustes

| ID | Historia | Prueba |
| --- | --- | --- |
| E1 | Sonido al terminar | Activo "Sonido": al terminar un bloque suena un tono suave. Por defecto está apagado |
| E2 | Avisos del navegador | Activo "Avisos": el navegador pide permiso y, con otra pestaña abierta, llega un aviso al terminar un bloque o cuando toca uno aplazado. Por defecto está apagado |
| E3 | Tema automático | La web sigue el tema claro u oscuro del sistema |
| E4 | Ver lo que hace la IA | Activo "Ver lo que hace la IA" y pido un plan: bajo Tu día aparece una línea con la herramienta que llamó la IA y cuántos bloques propuso, y "Ver detalle" muestra la llamada completa. Por defecto está apagado |

### X. Preparación para un agente (sin pantalla propia)

| ID | Requisito | Prueba |
| --- | --- | --- |
| X1 | La simulación habla en herramientas | Una prueba automática comprueba que la IA simulada devuelve una llamada `propose_plan` con los bloques, y que no cambia el estado de la aplicación hasta que la persona acepta |
| X2 | Las herramientas de lectura funcionan | Una prueba automática comprueba que `read_day` devuelve el plan y los minutos de hoy, y que `read_history` devuelve los minutos de foco por día, con datos de prueba |
| X3 | Todo cambio pasa por acciones | Una prueba automática comprueba que la interfaz y las herramientas cambian el estado solo mediante las acciones de `src/actions` |

### G. Accesibilidad

| ID | Requisito | Prueba |
| --- | --- | --- |
| G1 | WCAG 2.2 AA en todas las pantallas. Es lo que se exige para dar una historia por terminada. Contraste AAA (7:1) en el texto principal y el de los controles como objetivo: lo que no lo alcance se anota en el informe, sin bloquear | Pruebas automáticas con axe sin violaciones y comprobación manual de contrastes |
| G2 | Todo se maneja con teclado, con orden lógico y foco siempre visible (anillo de 2 px, contraste 3:1) | Recorro cada pantalla con Tab, Enter, Espacio, flechas y Escape |
| G3 | Todo campo tiene etiqueta visible y programática. Su borde o fondo tiene contraste de al menos 3:1 con lo que lo rodea, y el texto de ayuda y el marcador de posición, 4,5:1 | El campo de texto se distingue a simple vista sobre su fondo, en los dos temas |
| G4 | Áreas táctiles de al menos 44 x 44 px (24 px en los cuadrados de la cuadrícula) | Reviso cada botón en la vista móvil |
| G5 | Lector de pantalla: botones con nombre completo ("Quitar bloque Revisar correos"), cambios anunciados con aria-live, sin trampas de foco | Recorro con VoiceOver |
| G6 | Con prefers-reduced-motion, sin animaciones: el orbe solo cambia de color | Activo la opción en el sistema y lo compruebo |
| G7 | Zoom del 200 % y texto ampliado sin pérdida de contenido ni scroll horizontal de la página | Amplío y compruebo |
| G8 | Nada se comunica solo con color | Cada estado del orbe, bloque y cuadrado lleva texto |

### H. Responsive

| ID | Requisito | Prueba |
| --- | --- | --- |
| H1 | Funciona de 320 a 1440 px de ancho | Recorro todas las pantallas a 320, 390, 768 y 1440 px: nada se corta ni se solapa |
| H2 | Pensado primero para móvil | A 390 px, todo lo principal se alcanza con el pulgar |

## 3. La IA simulada del plan del día

Vive detrás de la interfaz `AIProvider`. Reglas:

- **Siempre propone una lista**, con cualquier texto, incluido uno sin sentido. Si no reconoce nada, usa el texto como título de un único bloque. Nunca muestra un error.
- **Convierte lo que cuentas en bloques:** separa las cosas que has dicho, estima la duración de cada una (profundo 50, revisión 25, gestiones 15), pone lo más exigente antes, e intercala un "Respirar" de 3 minutos si la lista es larga. Lee el tiempo disponible si lo dices ("tengo tres horas").
- **Resume en una frase** lo que ha entendido, por ejemplo "Te propongo 4 bloques, 2 h 15 min en total", y la escribe palabra a palabra.
- **Es variada pero reproducible.** Usa un generador de números con semilla (el texto más el día más el número de tanda). "Otra propuesta" cambia la tanda.
- **Actúa con herramientas, no tocando el estado.** Devuelve llamadas a herramientas tipadas (`propose_plan`). La persona acepta, edita o descarta la propuesta, y solo entonces se aplica mediante las acciones de la aplicación (ARCHITECTURE.md, sección 5).
- **No usa red.** Se puede cancelar. Es una simulación, y así se dice si se enseña fuera.
- Lo que devuelve es siempre un borrador editable.

## 4. Lo que la competencia ofrece y hemos incorporado

Tras analizar los temporizadores Pomodoro existentes (ver ANALISIS-COMPETITIVO.md), esto es lo que entra, en su versión más simple:

- **Descanso tras el bloque** (C1), o Respirar. Sin ciclos ni inicio automático.
- **Atajos de teclado** (B10).
- **Sonido y avisos del navegador opcionales** (E1, E2).
- **Tiempo en el título de la pestaña** (B9).
- **Un informe visual del tiempo**, que aquí es la cuadrícula en lugar de gráficos y números (D).

Se deja fuera adrede: tareas persistentes, etiquetas, proyectos, estadísticas con números, plantillas, integraciones, bloqueo de distracciones, funciones sociales y exportación.

## 5. Hitos de la fase 1

La fase 1 se ejecuta de una vez, siguiendo docs/FASE1.md, y termina con la demostración de ACCEPTANCE.md ejecutada por la persona.

| Hito | Contenido |
| --- | --- |
| M0 | Orden y limpieza: guardar el trabajo pendiente, eliminar lo que ya no entra, pruebas automáticas e integración continua |
| M1 | Hoy, el plan del día con IA, temporizador, descanso, respirar, ajustes, preparación para un agente, accesibilidad y responsive (A, B, C, R, E, X, G y H) |
| M2 | Días: la cuadrícula y los datos de ejemplo (D) |

## 6. Supuestos que se pueden corregir

1. **Aplazar es "más tarde".** Se elige 15 minutos, 30 minutos o 1 hora. El aviso solo llega con la pestaña abierta.
2. **Los datos viven en el navegador y son reales**, más un conjunto de ejemplo opcional. No hay usuario.
3. **Solo cuenta el foco.** Descansos y respiraciones se guardan pero no colorean la cuadrícula.
4. **Los umbrales de color** (24, 59, 119 y 179 minutos) son un punto de partida.
5. **Un bloque cuenta para el día en que empezó**, aunque cruce la medianoche.
6. **El plan es de un solo día.** No se arrastran bloques de un día al siguiente.
7. **Sin landing.** El concepto es la propia web.
8. **El dibujo** es la propuesta de la sección D, a afinar.
9. **La fase 1 no es agéntica.** Es la base: pantallas, acciones y herramientas. El carácter agéntico llega en la fase 2 y requiere un modelo real.

## 7. Hacia un proyecto agéntico (fase 2, NO se construye ahora)

**Qué es agéntico aquí.** Un agente observa el estado, decide y actúa con herramientas, en varios pasos, dentro de unos límites y con la aprobación de la persona. Lo que hoy hace la simulación (una sola respuesta fija) no lo es.

**Qué haría Presencia agéntica.**
- **Reajustar mi día.** Un botón. El agente lee cómo va el día (qué está hecho, qué se aplazó, cuánto se alargó cada bloque) y propone cómo reordenar lo que queda. La persona aprueba o edita.
- **Aprender de mis días.** El agente lee la cuadrícula y propone cuándo y cuánto concentrarse según el ritmo real de la persona ("sueles rendir más por la mañana").
- **Traza visible.** Cada decisión del agente se puede ver (E4 ya lo prepara).

**Qué requiere.**
- Un modelo real con uso de herramientas, que llame a las mismas herramientas que hoy llama la simulación (`propose_plan`, `read_day`, `read_history` y alguna más).
- Una función de servidor mínima, solo para guardar la clave del modelo sin exponerla en el navegador. Es lo único de servidor que haría falta.
- Un límite de gasto y de peticiones, para que probarlo desde el portfolio no cueste de más.
- Decirlo con claridad: qué hace el modelo y qué reglas lo acotan.

**Qué no cambia.** La IA propone y la persona decide. Ninguna herramienta modifica el estado sin pasar por las acciones ni sin aprobación.
