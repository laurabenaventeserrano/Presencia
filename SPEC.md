# Presencia: especificación

Fuente de verdad del producto. Si algo de aquí contradice un prompt, manda este documento, salvo que la persona diga lo contrario de forma expresa.

## 1. Qué es

Una app de foco y bienestar, extremadamente minimalista. Una IA (simulada por ahora) pregunta qué quieres hacer hoy, propone bloques de tiempo, y tú decides si empezarlos ya o guardarlos como tareas. Acompaña con un timer, respiración guiada y un resumen al cerrar el día.

Es un producto y a la vez una pieza de portfolio: tiene que demostrar criterio de diseño y capacidad de construirlo.

## 2. Principios de diseño

El diseño final se decidirá más adelante. Por ahora, esto:

1. **Un papel con pocos elementos.** Fondo blanco, texto negro, líneas finas, mucho espacio.
2. **Una sola cosa principal por pantalla.** Lo que no es de este momento no se muestra.
3. **Sin decoración.** Sin sombras, sin colores, sin iconos salvo que sean imprescindibles, sin tarjetas con borde. Las listas son filas separadas por una línea fina.
4. **Los controles son texto.** "Empezar", "Guardar", "Pausar". No botones decorados.
5. **Una tipografía del sistema y dos tamaños:** uno grande para lo principal y uno normal para el resto.
6. **Casi sin animación.** Solo la respiración y el cambio de un estado a otro.
7. **Todo el estilo vive en `tokens.css`.** Ningún componente escribe un color, tamaño o radio a mano. Así el diseño final se cambia en un solo archivo.

## 3. Pantallas

### Hoy (la pantalla principal, ruta `/app`)

```
¿Qué quieres hacer hoy?
[ campo de texto ]

(la respuesta de la IA va apareciendo palabra a palabra)

Propuesta
  Escribir la propuesta     − 50 +    Empezar  Guardar
  Revisar correos           − 25 +    Empezar  Guardar

Tareas
  Diseñar la pantalla       50 min    Empezar  Hecha  Borrar
```

- La propuesta es un **borrador editable**: se puede cambiar el título y los minutos (de 5 en 5, mínimo 5, máximo 120). Las ediciones viven en estado local, no en el store.
- **Empezar** crea un bloque con los minutos editados y arranca el timer. La fila desaparece de la propuesta.
- **Guardar** crea una tarea persistida. La fila desaparece de la propuesta.
- Si ya hay un bloque en marcha, Empezar queda desactivado con el texto "Ya hay un bloque en marcha".
- Los bloques de pausa de la IA no se muestran como propuesta en esta fase.
- Si la IA no entiende la frase, responde "No te he entendido. ¿Qué quieres hacer hoy? Por ejemplo: diseñar la pantalla y responder emails." y no propone nada.

### En curso

Solo el título del bloque, el tiempo restante en grande y dos controles: **Pausar** y **Terminar**. Todo lo demás desaparece.

### Fin de bloque (modo flujo)

Sin alarma brusca. Una pregunta: "¿Sigues en flujo?" con **+10 min** y **Terminar**. Si la persona sigue, se registran esos minutos como minutos en flujo.

### Pausa

Respiración guiada: una sola forma que se expande y se contrae. Por defecto inspirar 5 segundos y soltar 5. Duración configurable (1, 3 o 5 minutos). Texto mínimo.

### Cierre del día

Una frase y tres números: minutos de foco, bloques completados y minutos en flujo. La frase la genera una plantilla a partir de datos reales.

## 4. Datos

```ts
type TaskKind = 'deep' | 'review' | 'admin'
type BlockKind = 'focus' | 'break' | 'breathe' | 'meditate'

Task  { id, title, estimatedMin, kind: TaskKind, done, createdAt }
Block { id, taskId?, title, kind: BlockKind, plannedMin, status, endsAt, remainingMs, startedAt, completedAt }
Memory { id, text, createdAt, type: 'franja' | 'duracion' | 'arrastre' }
Day   { date, intention, blockIds, summary }
```

- Todo se persiste en localStorage mediante el store (Zustand). El store es la única fuente de verdad.
- Al cambiar un tipo ya persistido, se migra con valores por defecto sin perder datos.

## 5. Reglas técnicas

- **El timer guarda `endsAt`**, el momento exacto en que termina, y calcula el tiempo restante al pintar. Nunca cuenta segundos con un contador. Al pausar guarda `remainingMs`.
- **Empezar un bloque es una única función**, usada desde la propuesta y desde la lista de tareas. No se duplica esa lógica.
- **La IA propone, la persona decide.** Nada de lo propuesto entra en el día ni en las tareas sin una acción de la persona.
- **La IA está detrás de la interfaz `AIProvider`.** Hoy hay un `MockProvider` determinista (mismas palabras, mismo resultado) que emite el texto palabra a palabra con latencia variable y permite cancelar con `AbortSignal`. Cambiarlo por un modelo real debe ser sustituir una implementación.
- Las reglas de decisión de la IA son funciones puras: sin `Date.now` ni `Math.random` (el azar solo para calcular la latencia).
- Todo cambio de lógica lleva test.

## 6. Hitos

Cada hito es una rama, se trabaja en modo plan, termina con `npm test`, `npx tsc --noEmit` y `npm run build` en verde, y se revisa antes de unir a `main`.

### H1: Hoy
Chat primero. Propuesta editable con Empezar y Guardar. Tareas reales en el store (el chat usa esas, no las de ejemplo). Marcar como hecha y borrar. `src/seed/tasks.ts` queda solo como datos de demo, con un botón "Cargar tareas de ejemplo" visible únicamente cuando la lista está vacía.

**Hecho cuando:** escribes una intención, editas los minutos de una fila, pulsas Empezar y el timer arranca; recargas y sigue contando. Guardas otra fila y sigue en tareas tras recargar.

### H2: Foco
Pantalla En curso. Modo flujo al terminar. Pausa con respiración. Sonido ambiente generado con Web Audio, con volumen. Burbuja flotante con Document Picture-in-Picture y una alternativa dentro de la página si el navegador no la soporta.

**Hecho cuando:** la burbuja se ve sobre otra aplicación mientras corre un bloque.

### H3: Cierre
Registro de sesiones reales. Pantalla de cierre. Memoria con tres tipos de aprendizaje que la IA usa al día siguiente. Botón para simular una semana de datos de demo.

**Hecho cuando:** terminas el día, ves el resumen y al día siguiente la propuesta usa lo aprendido.

### H4: Dispositivos
Sincronización con Supabase Realtime (Broadcast) mediante un código de 6 dígitos, sin login. Se comparte el estado del timer, `endsAt` y las tareas. Ruta `/m` (pantalla "Hoy" compacta, con intención y tres opciones: foco, respirar, meditar) y ruta `/watch` (anillo, pausar o continuar, respirar). PWA instalable en ordenador y móvil.

**Hecho cuando:** inicias un bloque en el ordenador y lo ves correr en el móvil sin recargar.
**Si se complica:** BroadcastChannel entre ventanas y dispositivos simulados en la landing, dicho con claridad.

### H5: Landing
Una página con el mismo lenguaje de papel. Una frase, una explicación corta, una demostración real de la pantalla Hoy, instalar y vincular dispositivo, y una sección pequeña "Más adelante" con la hoja de ruta: modo No molestar, mensaje automático y reloj que vibra solo si es importante. Todo lo que no existe se marca como futuro.

**Hecho cuando:** se puede recorrer entera en ordenador y móvil.

## 7. Fuera de alcance

- Apps nativas, incluido el reloj y los widgets.
- IA real.
- Activar No molestar en los dispositivos.
- Hand tracking y partículas.
- Integración real con apps de tareas.

## 8. Bienestar

Presencia no es un dispositivo médico ni promete resultados de salud. La respiración guiada es una práctica de relajación, no un tratamiento. En la landing, ninguna afirmación de salud.
