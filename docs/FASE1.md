# Fase 1: orden de ejecución

Este documento le dice al agente exactamente qué hacer, en qué orden y cuándo parar. La fase 1 se ejecuta **de una vez**: la persona aprueba el plan una sola vez y prueba al final.

## 1. Objetivo

Construir Presencia tal como describe SPEC.md: la web responsive con el plan del día con IA, el temporizador, el descanso, Respirar, los ajustes y la cuadrícula de días, con la preparación para un agente (acciones y herramientas), accesible y probada.

## 2. Punto de partida

Hay trabajo de sesiones anteriores en el repositorio, parte sin guardar: el temporizador con `endsAt`, la IA simulada, el componente Orb, los tokens, DESIGN.md, PRODUCT.md, `.claude/` y `.impeccable/`, además de código que ya no entra (lista de tareas, botones "Guardar", cualquier resto de cuentas). **Comprueba el estado real con git antes de asumir nada.**

## 3. Reglas de autonomía

- Trabaja en una rama nueva llamada `fase-1`, creada a partir de la rama actual.
- Avanza grupo a grupo sin pedir permiso entre ellos.
- Al terminar cada grupo, ejecuta `npm run verify`. Si no está en verde, arréglalo antes de seguir.
- Un commit por grupo, con los IDs de sus historias en el mensaje.
- Si algo no está en SPEC.md, no lo añadas.
- Haz push de `fase-1` en los puntos de despliegue (apartado 4 bis) y al final. No te unas a `main`.

**Paradas.** Detente y pregunta solo si: (1) dos documentos se contradicen, (2) el mismo fallo se repite dos veces, (3) hace falta instalar algo que no sea Playwright y axe, (4) hay que modificar SPEC.md, (5) hay cambios en git que no sabes clasificar.

**Lo que NO es motivo de parada.** Si una historia necesita algo que DESIGN.md no define (el aspecto de la franja del bloque en curso, del aviso de fin de bloque, del diálogo de "Más tarde" o de los estados vacíos), no pares: aplica la solución mínima coherente con los tokens y los componentes existentes, y anótala en la lista "Decisiones de diseño pendientes" del informe final. Si la accesibilidad exige apartarse de DESIGN.md (por ejemplo, un campo de texto sin contraste suficiente con su fondo), manda la accesibilidad: ajusta el componente usando tokens (por ejemplo, un borde con el token de línea fuerte) y anótalo también. No edites el texto de DESIGN.md.

**Permisos expresos.** Puedes modificar `package.json` para añadir Playwright y @axe-core/playwright como dependencias de desarrollo. Puedes modificar el store, los tipos y el temporizador, conservando el cálculo con `endsAt`. Puedes eliminar el código que ya no entra, después de listarlo en el plan. No puedes modificar DESIGN.md.

## 4. Pasos

### Paso 0: plan

Entra en modo plan. Enseña un plan por grupos (G1 a G10) con las historias que cubre cada uno, qué archivos tocarás y qué vas a eliminar. Espera la aprobación.

### Paso 1: orden del repositorio

1. Ejecuta `git status`. Guarda el trabajo pendiente en commits por tema (IA, diseño, documentación). Si hay cambios que no sabes clasificar, pregunta.
2. `.claude/` se guarda, excepto `settings.local.json`, que se añade a `.gitignore`. `.impeccable/` se guarda junto con DESIGN.md.
3. Mueve ACCEPTANCE.md, ARCHITECTURE.md, PROCESS.md, FASE1.md y ANALISIS-COMPETITIVO.md a `docs/`, y deja SPEC.md en la raíz.
4. Crea la rama `fase-1`.

### Paso 2: limpieza

Elimina la lista de tareas, los botones "Guardar" y cualquier código de cuentas o de tareas. Conserva el temporizador con `endsAt`, la IA simulada, el Orb y los tokens.

**Rutas.** La app vive en `/`. Elimina la landing y las rutas `/m` y `/watch`. La ruta `/app` redirige a `/`. Añade un `vercel.json` con una reescritura de cualquier ruta a `index.html`, para que un enlace directo no dé un 404 en Vercel.

### Paso 3: herramientas de calidad

1. Añade Playwright y @axe-core/playwright. Crea `e2e/` con una prueba de humo.
2. Crea `npm run verify`: ejecuta `npm test`, `npx tsc --noEmit`, `npm run build`, las pruebas de extremo a extremo y las de accesibilidad (axe), e imprime una matriz con cada ID de historia de SPEC.md, su prueba y si pasa. Las pruebas de extremo a extremo llevan el ID de la historia en el nombre (`A6.spec.ts` o `A6 minutos editables`). Falla si una historia que debería estar hecha en el grupo actual no tiene prueba.
3. Crea un flujo de GitHub Actions que instale los navegadores de Playwright y ejecute `npm run verify` en cada push y pull request.
4. En las pruebas de extremo a extremo, usa el reloj simulado de Playwright (`page.clock`) para avanzar el tiempo. No esperes tiempo real: ni 25 minutos, ni 1 minuto. Así las pruebas del temporizador, del aviso, de "Más tarde" y del cambio de día son rápidas y estables.
5. La matriz de `verify` acepta como prueba de una historia cualquier test, de unidad o de extremo a extremo, cuyo título lleve el ID de la historia.
   Las pruebas de extremo a extremo (`e2e/`) tienen su propio `tsconfig` y Vitest las excluye, para que ni `npm run build` ni `npm test` se rompan por ellas. `npm run build` debe seguir siendo exactamente lo que ejecuta Vercel, y debe pasar en cada grupo.
6. Reconcilia CLAUDE.md y PRODUCT.md con SPEC.md: deben enlazar a `docs/` y resumir en pocas líneas qué es Presencia y qué no. No toques DESIGN.md.

Commit: `chore: calidad y orden`.

### Paso 4: grupos de trabajo

Cada grupo termina con sus pruebas en verde y un commit.

| Grupo | Historias | Contenido |
| --- | --- | --- |
| G1 | X3, B2, B3, B7, B9 | `src/storage`, tipos, `src/actions` y el temporizador por `endsAt` con pausa, reanudación, un solo bloque activo y tiempo en la pestaña |
| G2 | A1, B1, B5, B8, B10, B11 | Pantalla Hoy casi vacía, Temporizador, En curso, Terminar con confirmación, volver a Hoy y atajos |
| G3 | R1 a R7 | Respirar |
| G4 | X1, X2, A2, A3, A4, A5, A15 | La IA simulada con herramientas: `propose_plan`, `read_day`, `read_history`, y la propuesta del plan del día |
| G5 | A6, A7, A8, A9 | Edición del plan: título, minutos, quitar con deshacer y añadir |
| G6 | A10, A11, A12, A13, A14, B4 | Empezar un bloque del plan, marcarlo hecho, "Más tarde" (también con un bloque en marcha), plan de un solo día y persistencia |
| G7 | B6, C1, C2 | Aviso suave al terminar, "+5 min", descanso y que no cuenta como foco |
| G8 | E1, E2, E3, E4 | Ajustes: sonido, avisos, tema y "Ver lo que hace la IA" |
| G9 | G1 a G8, H1, H2 | Pasada de accesibilidad y responsive en todas las pantallas: axe, teclado, contrastes, zoom, 320 a 1440 px |
| G10 | D1 a D16 | Días: la cuadrícula, la leyenda, el detalle, el ejemplo y el borrado de datos |

### Paso 5: cierre

1. Ejecuta `npm run verify` completo y confirma que todas las historias de SPEC.md tienen prueba y pasan.
2. Haz push de `fase-1` y comprueba que la integración continua queda en verde.
3. Entrega el informe final de PROCESS.md: una fila por historia, y cuatro listas: lo que no has podido verificar, lo que has dejado fuera, las decisiones que has tomado sin preguntar y las **decisiones de diseño pendientes** (lo que DESIGN.md no definía y resolviste con una solución mínima, y los desvíos por accesibilidad).
4. Para. No te unas a `main`. La persona ejecuta la prueba rápida y el guion de ACCEPTANCE.md, y une a `main`.

## 4 bis. Puntos de despliegue

El objetivo es que **hoy quede una versión funcional subida**, aunque no esté todo. Por eso, en tres momentos:

| Punto | Cuándo | Qué hay en pie |
| --- | --- | --- |
| P1 | Tras G3 | Hoy casi vacía, el temporizador completo y Respirar |
| P2 | Tras G6 | Además, el plan del día con IA, editable, con "Más tarde" |
| P3 | Tras G10 | Todo: ajustes, descanso, accesibilidad y la cuadrícula de días |

En cada punto: ejecuta `npm run verify`, haz push de `fase-1`, y anota en el informe parcial qué historias están en verde. No te detengas a esperar nada: sigue con el grupo siguiente. La persona decide cuándo unir a `main` mirando esa lista.

El agente no puede comprobar el despliegue de Vercel. Lo debe decir como "no verificado" y dejar escrito qué mirar: que el último commit de `fase-1` tenga la marca verde en GitHub y que la previsualización de Vercel cargue en la raíz.

## 5. Qué NO hacer

Cuentas, servidor, base de datos, lista de tareas aparte del plan del día, landing, Premium, estadísticas con números, rachas, puntos, apps nativas, instalación como app, y cualquier modelo de IA real. Nada que no esté en SPEC.md.
