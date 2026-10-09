# Cómo se trabaja

Reglas para la persona y para cualquier agente de IA que trabaje en este proyecto. Existen porque ya se dio por terminado trabajo que no funcionaba, y porque se añadió más de lo que se pedía.

## Principio rector: lo simple

Presencia es un concepto de portfolio y su filosofía es lo vacío, lo simple, lo que está pero no molesta.

1. **Ante la duda, quita.** Si algo no está en SPEC.md, no se añade, aunque parezca buena idea.
2. **Una pantalla, una cosa principal.**
3. **Nada se promete que no existe.** Si algo es futuro, se dice que es futuro o no se muestra.
4. **Todo cambio de alcance empieza editando SPEC.md**, no el código.

## Definición de terminado

Una historia está terminada solo cuando se cumplen las seis cosas:

1. Está implementada tal como la describe SPEC.md.
2. Tiene una prueba automática de extremo a extremo (Playwright) que reproduce su prueba de SPEC.md, y pasa.
3. `npm test`, `npx tsc --noEmit`, `npm run build` y `npm run test:e2e` están en verde.
4. Las pruebas de accesibilidad automáticas (axe) no dan violaciones en las pantallas tocadas.
5. Está en un commit que lleva los IDs de sus historias en el mensaje, por ejemplo `feat(A6,A7,A8,A9): edición del plan`.
6. La persona ha ejecutado el guion de ACCEPTANCE.md del hito y ha pasado.

La fase 1 no se une a `main` hasta que todas sus historias cumplen las seis.

## Reglas para el agente

1. Lee SPEC.md (empezando por la sección 0), DESIGN.md, docs/ARCHITECTURE.md y este documento antes de empezar.
2. Trabaja en modo plan: enseña el plan y espera la aprobación antes de editar.
3. Trabaja en el orden de docs/FASE1.md y no toques nada fuera del grupo de trabajo en curso.
4. Si hay una contradicción entre documentos, para y pregunta. Si una historia necesita algo que DESIGN.md no define, no pares: aplica la solución mínima con los tokens existentes y anótala como decisión de diseño pendiente. Si la accesibilidad y DESIGN.md chocan, manda la accesibilidad y se anota. Nunca edita DESIGN.md.
5. Si falta algo en SPEC.md, propone el cambio al documento y espera. No construye una versión propia.
6. Nunca dice "terminado" sin haber ejecutado las pruebas. Si no ha podido ejecutar algo, lo dice con esas palabras: "no verificado".
7. Si algo falla dos veces seguidas, para y enseña el error.
8. No instala paquetes ni toca `package.json` sin permiso expreso en el prompt.
9. Solo `src/storage` toca localStorage.
10. Una sola sesión de agente por carpeta.

## Informe final obligatorio

Al cerrar un hito, el agente entrega una tabla con una fila por historia:

| Historia | Estado (hecha, parcial, no hecha) | Prueba automática que la cubre | Notas |
| --- | --- | --- | --- |

Y debajo, cuatro listas: lo que no ha podido verificar, lo que ha dejado fuera, las decisiones que ha tomado sin preguntar y las decisiones de diseño pendientes.

## Modo continuo (fase 1)

La fase 1 se ejecuta de una vez, sin pedir permiso entre grupos de trabajo:

1. La persona aprueba el plan **una sola vez**.
2. El agente avanza grupo a grupo (docs/FASE1.md). Al terminar cada grupo ejecuta `npm run verify`. Si no está en verde, arregla antes de seguir.
3. El agente **solo se detiene** en estos casos: una contradicción entre documentos, un fallo que se repite dos veces, la necesidad de instalar algo que no está autorizado, un cambio que obligaría a modificar SPEC.md, o cambios en git que no sabe clasificar. Lo que DESIGN.md no define no es motivo de parada.
4. Al final entrega el informe final y la persona ejecuta ACCEPTANCE.md.

`npm run verify` ejecuta las pruebas de unidad, `tsc`, el build, las pruebas de extremo a extremo y las de accesibilidad, e imprime una matriz de historias: cada ID de SPEC.md con su prueba y si pasa. Falla si alguna historia de las que ya deberían estar hechas no tiene prueba.

## Qué hace la persona

1. Revisa el plan antes de aprobarlo. Comprueba que cubre todos los grupos de FASE1.md.
2. Al terminar, ejecuta el guion completo de ACCEPTANCE.md.
3. Si algo falla, pega al agente solo el paso que falla y lo que ve.
4. Une el hito a `main` cuando todo pasa.

## Ramas y commits

- Una rama para la fase 1 (`fase-1`) y un commit por grupo de historias.
- Mensaje con el formato `tipo(ID): qué cambia`. Tipos: feat, fix, refactor, test, docs, style.
- La integración continua ejecuta test, tsc, build y e2e en cada push. Nada se une con la integración en rojo.
