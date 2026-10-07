---
target: Home, segunda corrida sin cambios de codigo
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/carloscubillo/fynn/app/(tabs)/home.tsx"
target_fingerprint: "sha256:b7cd052a9c1cdda1f4bdd275224dee87bc42f7f8077ea081f45dba0c85c1b6cb"
target_path: /Users/carloscubillo/fynn/app/(tabs)/home.tsx
timestamp: 2026-10-07T21-10-25Z
slug: app-tabs-home-tsx
---
Method: dual-agent (A: 1bb24b67-98d2-425d-8d46-000751bc5d02 · B: 7742b4cd-3768-4b58-b8b1-403381b93a6b)

# Critique: Home (segunda corrida)

Target: `app/(tabs)/home.tsx`. El archivo no cambió desde la corrida de 21/40 (mismo sha256). La nota sube por una lectura distinta, no por un cambio en la app. Capturas del simulador iPhone 17 Pro, es-CL, claro y oscuro, Home en reposo. El engranaje azul es Expo Go.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Pestaña, moneda y línea de ejemplo están claras; un guardado exitoso es una frase que desaparece a los 2,2 s |
| 2 | Match System / Real World | 3 | Entran/salen, el agrupado chileno y uber 4500 hablan el idioma de la persona; Ajustes se lee como rótulo |
| 3 | User Control and Freedom | 2 | Cambiar existe antes de confirmar; después de Aceptar no hay deshacer en esta pantalla |
| 4 | Consistency and Standards | 2 | Cintas en Gastos, círculos en los avisos y en la frase trabada |
| 5 | Error Prevention | 2 | Un monto vacío se atrapa; la moneda en pantalla es un filtro, y la frase se guarda en la moneda por defecto |
| 6 | Recognition Rather Than Recall | 3 | El placeholder enseña la gramática y la vista previa nombra la categoría antes de confirmar |
| 7 | Flexibility and Efficiency | 2 | La frase es el atajo; no hay Return para aceptar, ni repetir, ni corregir la categoría en la línea |
| 8 | Aesthetic and Minimalist Design | 3 | El neto manda; el cascarón también carga el descargo, la píldora y un segundo camino |
| 9 | Error Recovery | 2 | «Agrega un monto…» es concreto; «No se pudo guardar» no dice por qué |
| 10 | Help and Documentation | 2 | El placeholder y la línea de ejemplo son la única ayuda en contexto |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment.** Home está escrito para Fynn. En claro, cascarón de tinta sobre piedra (`#1C1B16` sobre `#E4E0D4`), neto condensado en hueso a 76 pt (`$1.071.000`) y un mes hablado: «Entran $1.250.000 y salen $179.000». El fósforo no está en reposo, y eso cumple el contrato. Una app genérica habría puesto tarjeta blanca, total azul y un par verde/rojo. Esta no.

La autoría se suelta en tres sitios. Los avisos identifican la categoría con un círculo y un símbolo, y Gastos usa la cinta. CLP/USD es una píldora segmentada sentada en la tarifa. En oscuro el cascarón (`#12110E`) y el suelo (`#2A2823`) son dos oscuros vecinos, y la casa de tinta deja de sostener la habitación.

La frase trabada y Aceptar no estaban en pantalla. Esas notas salen del código: en cuanto `parsePhrase` devuelve un borrador, el campo se desmonta y `PhrasePreview` entra con opacidad, 8 pt y escala 0,98, en 180 ms.

**Deterministic scan.** `impeccable detect` sobre Home, `HomeScreen.tsx`, `src/components/ui` y el layout de tabs salió limpio: exit 0, JSON `[]`. No vio el desmontaje de la frase, la píldora de moneda ni la cinta partida. Un scan limpio no dice que la pantalla esté bien.

**Visual overlays.** La inyección sí ocurrió, en una pestaña nueva de `http://127.0.0.1:8082/`, no en el simulador. La ruta no era Home: era el error de arranque («Fynn couldn't open the ledger on this device.» / «Try again»). El overlay mostró 4 anti-patrones. Uno es contraste bajo, 2,2:1, texto `#1e5649` sobre `#0c1412` en «Try again». Esos hex no son la paleta actual de la tarifa; el bundle web de ese puerto está en otra apariencia, o viejo. Los otros tres son `transition: padding` en `DIV` y `BODY`, el patrón de layout de React Native Web, no una transición escrita en los archivos. El servidor de overlays se detuvo en el puerto 8400. No hay overlay sobre el Home del teléfono.

## Overall Impression

El primer segundo funciona: un número, una oración. Después la firma no ocurre en el lugar donde se escribió, y la píldora de moneda puede mentir sobre en qué moneda se guarda el viaje. Esa segunda cosa es un error de datos, no de estilo.

## What's Working

- El cascarón claro es el producto. Tinta, polvo de piedra y una sola cara condensada hacen el mes legible de un vistazo, con agrupación chilena.
- «Entran … y salen …» separa el color del dinero que entra, del que sale, y la piedra usa un tercero para el aviso del 80 %.
- Capturar es una frase, con el ejemplo local en el campo. Las cintas de Gastos son la identidad de categoría del contrato.

## Priority Issues

**[P1] La frase se reemplaza. No se traba en su sitio.** En cuanto hay borrador, el campo se desmonta, el teclado se va, y una nota más larga muere en el instante en que aparece el monto. La firma era la línea cruda resolviéndose en descripción, categoría y monto donde se escribió.

Why it matters: el pico prometido sigue fuera del primer frame, y el momento de escribir se interrumpe justo cuando la persona está a mitad de la frase.

Fix: una sola línea. Resolver los tokens sobre esa baseline y dejar el campo montado hasta Aceptar. La cinta de categoría va en esa misma línea.

Suggested command: /impeccable animate

**[P1] La píldora de moneda es el control más ruidoso del cascarón, y no gobierna la tarifa.** CLP es la mitad rellena de una píldora ancha entre el mes y la frase. `setViewCurrency` solo cambia las cifras. `parsePhrase` cae a la moneda por defecto. Mirar USD y escribir `uber 4500` puede guardar CLP.

Why it matters: entre tareas, eso es un apunte en la moneda equivocada.

Fix: bajar la píldora a un control quieto, o moverla a la piedra. La moneda del borrador sigue a la moneda en pantalla, y esa moneda se ve en la línea antes de Aceptar.

Suggested command: /impeccable quieter

**[P1] La identidad de categoría está partida.** Presupuestos y la frase usan un círculo al 14 % con un símbolo. Gastos usa una cinta de 28×8. El contrato dice que la identidad es la cinta.

Why it matters: el primer bloque de piedra y la fila de la firma usan el punto que el contrato rechazó.

Fix: cinta en los avisos y en la frase trabada. El nombre ya está en tipo.

Suggested command: /impeccable colorize

**[P2] El cascarón es demasiado alto para la segunda lectura del mes.** El descargo, la píldora, el campo e «Ingresar a mano» empujan los avisos al fondo. La dona queda cortada por la barra. Seis meses no entra. La dona repite las cuatro cintas ya listadas.

Fix: sacar el descargo y el camino manual de la tinta. Que las cintas sean el desglose.

Suggested command: /impeccable distill

**[P2] Confirmar no deja rastro.** Guardar limpia el campo, pone «Aceptado» en fósforo 2,2 s y un háptico leve. No hay deshacer. El fósforo, reservado a Aceptar, se va al recibo. Return no acepta.

Fix: un recibo en la piedra con Deshacer hasta la próxima frase. El fósforo se queda en el botón. El neto se mueve desde el monto aceptado.

Suggested command: /impeccable delight

## Cognitive load

4 fallos, carga alta: foco único, troceo, una cosa a la vez, pocas opciones. Pasan agrupación, jerarquía, memoria de trabajo y divulgación progresiva.

En reposo hay 9 blancos: Ajustes, CLP, USD, la frase, Ingresar a mano y cuatro pestañas.

## Emotional journey

La llegada es segura: una cifra de hueso, una oración. La línea siguiente la pincha: «Datos de ejemplo, no es una cuenta real.» El valle son Comida al 80 % y Suscripciones pasadas, sobre datos que la pantalla acaba de llamar ficticios. El viewport termina en una dona cortada. El pico del contrato, la frase que se traba y Aceptar en fósforo, no está en reposo. El fin de la tarea es un recibo que se esfuma.

## Persona Red Flags

**Alex.** El campo se confisca en el instante en que aparece un número, antes de terminar la nota. Return no hace nada. Un aceptar equivocado obliga a abrir Movimientos para borrar. La moneda se interpone en el único camino rápido. La escala al presionar solo está en `Button`.

**Jordan.** El primer segundo funciona. Después el héroe se desmiente y dos alarmas disparan sobre datos de ejemplo. «uber 4500» está dibujado como un valor lleno, con subrayado y sin Aceptar, así que el demo parece enviado o trabado. El fósforo no suena salvo que alguien escriba.

**Alguien en Chile, entre tareas.** El placeholder coincide con lo que diría, y `$1.071.000` agrupa bien. Aceptar caerá en la parte alta del cascarón, lejos del pulgar. Si tocó USD de pasada, 4500 puede guardarse en CLP. El teclado se cae cuando la línea se reemplaza. Las alarmas de comida y suscripciones son ruido de camino al ascensor.

## Minor Observations

- Ajustes es hueso semibold junto a un mes más quieto, sin cromo de botón.
- La etiqueta de accesibilidad de la moneda sigue en inglés (`Show CLP`) en una pantalla es-CL.
- En oscuro el paso de cascarón a suelo es de un stop.
- Las filas de presupuesto no se pueden tocar. Un aviso es un callejón.
- La F en círculo a 28 pt comparte la fila del mes.
- La dona no tiene separación entre gajos. Las etiquetas de la tendencia son de 12 pt.
- Movimiento que existe: escala de Aceptar a 0,97 en 160 ms; revelado de la frase en 180 ms; fundido del neto solo en cambios posteriores al primer paint; pulso del esqueleto; háptico leve al guardar. Movimiento que no existe: traba en el sitio, respuesta al presionar en los otros controles, dibujo de gráficos, conteo, springs, deshacer.

## Questions to Consider

- Si la frase es la tarifa, por qué el control más ruidoso en reposo es una píldora de moneda.
- Qué cambiaría si «uber 4500» no saliera de la página, y Aceptar fuera lo único nuevo.
- Para quién es la dona, si las cintas ya dicen Comida 48 %.
