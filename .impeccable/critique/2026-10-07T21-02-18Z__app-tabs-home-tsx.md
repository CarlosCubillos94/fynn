---
target: Home, la pantalla que se ve monotona
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/carloscubillo/fynn/app/(tabs)/home.tsx"
target_fingerprint: "sha256:b7cd052a9c1cdda1f4bdd275224dee87bc42f7f8077ea081f45dba0c85c1b6cb"
target_path: /Users/carloscubillo/fynn/app/(tabs)/home.tsx
timestamp: 2026-10-07T21-02-18Z
slug: app-tabs-home-tsx
---
Method: dual-agent (A: 8e24bc23-8a31-4982-9b6e-2a219c9ea3a3 · B: 80b88f81-7cc9-4cb5-93b3-ac6539432b23)

# Critique: Home

Target: `app/(tabs)/home.tsx`. Capturas del simulador iPhone 17 Pro, es-CL, claro y oscuro, primer viewport. El engranaje azul es el menú de Expo Go.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | El mes y la pestaña están marcados; el neto no tiene nombre, y Aceptar no existe hasta que la frase parsea |
| 2 | Match System / Real World | 3 | El dinero habla en es-CL; la cifra gigante no dice que es el neto de octubre |
| 3 | User Control and Freedom | 2 | No hay viaje de mes, ni deshacer tras aceptar, ni Return para aceptar la frase |
| 4 | Consistency and Standards | 2 | Cintas de color en la leyenda, círculos lavados en los avisos; la tab bar es un relleno opaco |
| 5 | Error Prevention | 2 | Falta de monto se bloquea; una categoría adivinada entra al libro en un toque |
| 6 | Recognition Rather Than Recall | 2 | El atajo del producto es un subrayado sin etiqueta; el verbo visible es «Ingresar a mano» |
| 7 | Flexibility and Efficiency | 2 | La frase es el atajo y está a medias: sin Return, sin recientes, sin repetir |
| 8 | Aesthetic and Minimalist Design | 2 | Un número claro y después un solo tono; el fósforo no aparece en reposo |
| 9 | Error Recovery | 2 | Los fallos están en español; un aceptar equivocado no se deshace en esta pantalla |
| 10 | Help and Documentation | 2 | El placeholder y la línea de ejemplo son el manual entero |
| **Total** | | **21/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment.** La tesis es de Fynn: cascarón de tinta, hueso, polvo de piedra, Barlow Condensed solo en el neto, miles chilenos, y la frase «Entran $1.250.000 y salen $179.000». La foto que ve una persona es un póster oscuro, una lista beige, una dona chica y cuatro pestañas. Cualquier tracker sobrio puede ponerse eso. La firma —la frase que se traba, Aceptar en fósforo— no está en el primer frame. `uber 4500` es el placeholder, en el gris del cascarón. El fósforo `#C8F24A` no sale hasta que hay un parse, y ese parse es un fade de 180 ms, no un cierre.

El vidrio que pediste apunta a medias al lugar equivocado. Un hero esmerilado a mano pelea con iOS (el material del sistema va en barras y sheets, no en tarjetas inventadas) y con el contrato, que ya prohibió la tarjeta blanca bajo el número. Negar ese vidrio fue correcto. La pantalla igual está muerta, porque el contrato gastó todo el presupuesto visual en un corte de material y en un acento que el frame en reposo tiene prohibido mostrar. El neto no se asienta. La dona no se dibuja. La línea de seis meses ni entra en el primer viewport. El press es una escala a 0.97 en 160 ms. El único movimiento del número se salta el primer paint, así que `$1.071.000` simplemente está ahí.

En oscuro el corte sobrevive, pero es débil: el cascarón `#12110E` contra el suelo `#2A2823`. La idea de la composición casi se apaga. El objeto más acabado de las dos capturas sigue siendo el engranaje azul de Expo.

El blur que iOS sí quiere está en la tab bar. Esa barra se pintó opaca (`colors.surface`). El vidrio legal se tapó. El vidrio ilegal se evitó. Quedó un póster.

**Deterministic scan.** `impeccable detect` sobre Home, `HomeScreen.tsx`, `src/components/ui` y el layout de tabs salió limpio: exit 0, JSON `[]`, cero reglas. El detector no vio monotonía, ausencia de movimiento, ni el fósforo escondido. Un scan limpio aquí no es evidencia de que el diseño funcione; es un falso consuelo. No hay falsos positivos que descartar porque no hubo hallazgos.

**Visual overlays.** No hay overlay. En `http://127.0.0.1:8082/` la mutación del título funcionó, pero la ruta cargada fue onboarding, no Home, y no se inyectó `detect.js`. La evidencia visual de esta revisión son las capturas del simulador.

## Overall Impression

El número es de verdad monumental y la frase de entran/salen está bien dicha. Después la pantalla no actúa. La queja de monotonía es el contrato cumplido al pie de la letra: un solo material, un acento que no puede aparecer, y nada que llegue. La oportunidad única es hacer que la tarifa ocurra en el primer segundo, sin esmerilar el hero.

## What's Working

- El neto usa la única cara condensada, con agrupación chilena, y entran/salen es una oración, no dos chips.
- «Datos de ejemplo, no es una cuenta real» vive dentro del cascarón, chico y honesto.
- Los avisos son oraciones («Comida pasó el 80% de su límite») y la leyenda de la dona sí usa la cinta de color del contrato.

## Priority Issues

**[P0] La tarifa no ocurre en el frame que la gente ve.** El fósforo está detrás de escribir. El cierre desmonta el input y muestra `PhrasePreview` con fade, 8 px y escala desde 0.98. Los glifos no se reordenan. Los gráficos son SVG estáticos. `MoneyText` no se mueve en el primer paint.

Why it matters: la queja es de vida. El único teatro del contrato es invisible, así que la obediencia se lee como un póster en blanco. Revolut y Copilot, la barra del brief, se sienten vivos en el primer segundo.

Fix: dejar el bloque plano. Al aparecer, asentar el neto. Hacer de la frase vacía una ranura viva, no un ejemplo gris. Al parsear, transformar esa misma línea en descripción, categoría y monto, y golpear Aceptar en fósforo. Dibujar una vez el trazo de la dona y la línea de seis meses. Aceptar con Return.

Suggested command: /impeccable animate

**[P1] El cascarón se come el teléfono y de noche casi se funde.** En claro, la tinta ocupa cerca de la mitad de la pantalla y «Seis meses» queda fuera del primer viewport, en contra del propio first frame del contrato. En oscuro el paso de cascarón a suelo es de 16 a 39 en luminancia.

Why it matters: la monotonía aquí es contraste flojo más un layout que esconde la segunda mitad de la tarifa.

Fix: recortar el vacío del cascarón para que la tendencia empiece en pantalla. En oscuro, separar banda y suelo con un paso visible a la distancia del brazo. El hero sigue sin blur.

Suggested command: /impeccable layout

**[P1] El color está en cuarentena.** En los avisos la categoría es un círculo al ~14% más un símbolo. La cinta solo está junto a la dona. El fósforo no está. El engranaje de Expo tiene más color que el producto.

Why it matters: es la queja de «nada atractivo» en píxeles. Una cinta que aparece en una leyenda no carga una pantalla.

Fix: la misma cinta en las filas de aviso, sin discos pastel. Color de categoría a plena fuerza sobre la piedra. El fósforo sigue exclusivo de Aceptar, y ese botón es el evento cromático del flujo.

Suggested command: /impeccable colorize

**[P2] El vidrio legal se pintó encima.** `tabBarStyle.backgroundColor` es crema u carbón opaco. iOS habría desenfocado esa barra. Un hero esmerilado seguiría siendo la respuesta incorrecta.

Why it matters: pediste vidrio y no quedó ni el material de la plataforma ni un sustituto con oficio. La barra además tapa el final de la dona.

Fix: quitar el relleno opaco de la tab bar y dejar el material del sistema. Headers, cascarón y gráficos siguen planos.

Suggested command: /impeccable polish

**[P2] El número y la frase no tienen título.** Nada dice que la cifra gigante es el neto del mes. La etiqueta de la tarea solo existe para el lector de pantalla. «Ingresar a mano» es el verbo que encuentra el ojo.

Why it matters: entre tareas, una persona escribe en lo que parece un campo. Aquí el campo parece copia de ejemplo, y el millón parece un saldo.

Fix: una palabra quieta bajo el mes («neto de octubre»). Placeholder con contraste real de placeholder, y la tarea en la línea de arriba, en tipo de sistema. La cara condensada se queda en el neto.

Suggested command: /impeccable typeset

## Cognitive load

6 fallos (alto): foco único, troceo, jerarquía visual, una cosa a la vez, pocas opciones, divulgación progresiva. Pasan agrupación y memoria de trabajo.

En reposo hay nueve blancos antes de anotar un peso: Ajustes, CLP, USD, la línea de la frase, Ingresar a mano y cuatro pestañas.

## Emotional journey

El pico prometido es el cierre y el golpe de fósforo. Está entre bastidores. El pico en pantalla es un número frío, grande, correcto, quieto. El valle es la tinta vacía bajo el placeholder. El viewport termina en una dona cortada por una barra opaca. El fin de un guardado, en código, es el campo limpio y «Aceptado» en fósforo por 2,2 segundos. La línea de datos de ejemplo no alcanza: `$1.071.000` se puede leer como plata propia.

## Persona Red Flags

**Alex (usuario impaciente).** El atajo está en pantalla y sigue lento. Reemplaza `uber 4500`, espera un crossfade y tiene que encontrar Aceptar: no hay `onSubmitEditing`. Cambiar tira la fila parseada. El recibo dura 2,2 segundos y no hay deshacer. Se va a Movimientos a comprobar, que es la ceremonia que Inicio debía evitar.

**Jordan (reclutador, primer abierto).** Tres segundos: header estático, lista beige, dona de plantilla, sin movimiento, sin acento. El engranaje azul parece el control más terminado, y es Expo. No puede decir qué es `$1.071.000`. Lo que vende el README, una frase que se vuelve tarifa, es invisible hasta que adivina que la línea gris se edita. En oscuro la tesis apenas sobrevive.

**Alguien en Chile, «uber 4500» entre tareas.** El placeholder es su frase y se ve inerte. El neto de ejemplo es un millón contra un viaje de 4.500; el descargo es fácil de perder bajo la cifra. CLP/USD es un control grande al lado de esa tarea. La confirmación no muestra el viaje aterrizando en Transporte.

## Minor Observations

- La F es un círculo de línea fina, más tímida que Ajustes en la misma fila.
- La pestaña Presupuestos usa un ícono de torta, y la torta de esta pantalla está bajo Gastos.
- Los divisores de aviso son `#D4CFC2` sobre `#E4E0D4`.
- La dona mide 112 pt, centro vacío, sin total. La tendencia es una polilínea de 3 px con ancho fijo de 320.
- Presupuestos, Gastos y Seis meses comparten el mismo título de 22 semibold.
- La confirmación de guardado usa fósforo, una fuga pequeña de «fósforo solo en Aceptar», y es el mejor instinto. Reduce motion se respeta. No hay ningún spring.

## Questions to Consider

- Si el fósforo solo es legal en Aceptar, por qué el primer frame del producto es una pantalla donde ese color tiene prohibido aparecer.
- El contrato prohibió la tarjeta blanca y el segundo héroe. Quién decidió que también prohibía que la pantalla se moviera.
- iOS ya desenfoca la tab bar. Si ese material vuelve y el héroe sigue siendo una losa de tinta, la queja de vidrio sigue en pie, y si sigue, hay que romper la tarifa para esmerilar el número.
