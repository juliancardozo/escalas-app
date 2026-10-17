# Escalas para Improvisación

App para **aprender a zapar con la guitarra**: tocar sobre una banda de acompañamiento, entender qué notas y acordes usar en cada momento, y practicar con ejercicios que escuchan tu guitarra por el micrófono.

Funciona como app de escritorio (Electron) y como sitio web estático (Netlify). No usa servidor ni cuenta: el progreso se guarda en tu navegador.

**Versión actual: 1.1.0** · [Novedades](#novedades)

---

## Por dónde empezar

1. **Afiná** en la pestaña *Práctica*.
2. Hacé el curso **🎓 Curso** (improvisación), desde la lección 1. Cada lección arma su propio backing y el micrófono evalúa tus decisiones.
3. En paralelo, seguí el curso de **Armonía** para entender y tocar los acordes en el mástil.
4. Consolidá con los **ejercicios con micrófono** y el **entrenador de velocidad** (*Práctica*), y con el **Entrenador** de teoría.
5. Zapá libre en el **Modo jam** (pestaña *Teclado*): elegí tonalidad, escala, progresión y groove.

> Usá **auriculares** con todo lo que use micrófono: si no, la app escucha la pista además de tu guitarra.

---

## Qué hay en cada pestaña

La tónica y la escala del panel lateral se aplican a toda la app.

### Teclado: referencia y Modo jam
- Teclado visual, grados, acordes diatónicos, círculo de quintas, modos (con audio) y tips por escala.
- **Modo jam con backing track**, visible en las vistas *Estudio* y *Jam*:
  - batería, bajo y acordes sintetizados con 6 grooves: rock, funk, blues shuffle, bossa nova, balada y metrónomo;
  - tempo estable (se programa sobre el reloj de Web Audio) y BPM que cambia sin cortar el loop; tap tempo y cuenta de entrada;
  - volumen por pista y voicings con 7mas/9nas diatónicas en funk, bossa y balada;
  - panel **Ahora / Sigue** con las notas del acorde y la nota objetivo (3ra);
  - progresiones por escala, incluidos blues de 12 compases (clásico, *quick change* y menor);
  - **modo práctica**: rotación de tonalidad cada N vueltas (por cuartas, quintas, medio tono o al azar) y tiempo practicado por día;
  - **Escuchar mi guitarra**: te dice si cada nota que tocás está en el acorde, en la escala o afuera, con estadísticas;
  - **jam compartido**: un link con tonalidad, progresión, groove y BPM; con *sincronizado por reloj*, todos arrancan en el mismo compás.
- Vista **Jam**: mapa rápido de notas, fraseo, presets y "Me perdí — resumen".

### 🎓 Curso: improvisar razonando
15 lecciones, de básico a avanzado, para aprender **qué, cómo y cuándo** tocar en lugar de memorizar escalas. Se basa en el *método de las 3 preguntas*: ¿qué acorde suena?, ¿qué notas son seguras?, ¿quiero reposo o tensión?

- **Básico**: dónde está "casa", tres notas alcanzan, la caja 1, pregunta y respuesta, dos acordes con dos destinos.
- **Intermedio**: notas guía (3ra en cada cambio), tensión y resolución, ♭3 → 3 en el blues, seguir los cambios del blues, elegir la escala a partir de los acordes.
- **Avanzado**: ii–V–I (7ma → 3ra), color dórico, aproximación cromática, tensión del V7 en menor, motivo y desarrollo.

Cada lección prepara su backing y el micrófono evalúa **decisiones**: terminar frases en la tónica o en el acorde, dejar espacio, caer en la 3ra en cada cambio, resolver tensiones por grado conjunto, aproximaciones cromáticas, la nota característica del modo o repetir un motivo. **Otra tonalidad** transpone la lección entera, textos incluidos. Al terminar hay una pregunta de reflexión. También se puede marcar "Lo hice sin micrófono".

### Guitarra: diapasón
- Escala en el mástil con orientación física o de tablatura, modo **PUA** (pasar el mouse para tocar) y acorde foco.
- **Posiciones reales de la escala**: las 5 cajas de la pentatónica (y del blues, con la blue note) con su forma **CAGED**, y 3 notas por cuerda en escalas de 7 notas.
- Con el jam sonando, el diapasón sigue el acorde actual.

### Armonía: curso intermedio aplicado a la guitarra
10 lecciones: armonizar la escala, funciones (T–SD–D) y sustituciones, inversiones de tríadas, cadencias (con quiz de oído), cuatriadas con *shells*, ii–V–I con conducción de voces, dominantes secundarios, préstamo modal, armonía en menor y sustitución tritonal.

- **Diagramas de acordes** generados en cualquier tonalidad, en tres tipos de forma: cejilla E/A, tríadas en cuerdas 3-2-1 y *shells* (raíz + 3ª + 7ª). Cada forma se elige lo más cerca posible de la anterior, así se ve cómo conectar los acordes moviendo la mano lo mínimo.
- Escuchá la progresión con esas formas, tocala con la banda y **verificá con el micrófono** que cada acorde que rasgueás coincida con el que suena.

### Práctica
- **Afinador** cromático: aguja en cents, Hz, cuerda detectada y notas de referencia.
- **Entrenador de velocidad**: sube el BPM cada N vueltas hasta tu objetivo, con botón "Me trabé" y récord de BPM limpio por escala y progresión.
- **Ejercicios con micrófono**: escala sube y baja, terceras, grupos de 3, arpegios de cuatriadas por grado y notas guía del ii–V–I. La app avanza nota por nota y mide tiempo, errores y récord.

### Entrenador: teoría
- **Intervalos**: identificar, construir y encontrar la raíz, con modo examen y filtro de intervalos.
- **Escalas y modos**: notas de un modo, armaduras, relativas, nota característica, escala madre.
- **Armonía**: cuatriadas diatónicas, funciones, V7, ii–V–I, notas del acorde, qué modo tocar sobre cada acorde, dominantes secundarios.
- Las notas se escriben con la ortografía correcta de cada tonalidad, y cada respuesta trae su explicación.

### Otras pestañas
- **Quintas**: círculo de quintas y guía de intervalos.
- **Constructor**: cómo se arma cada escala mayor y su armadura.
- **Menores**: menor natural, armónica y melódica, comparadas y con audio.
- **🎙 Escuchar** (Jam Listener): detecta tonalidad y acordes de lo que suena alrededor. Ver [JAMLISTENER.md](JAMLISTENER.md).

### Atajos de teclado
| Tecla | Acción |
|---|---|
| ← → | Cambiar tónica |
| ↑ ↓ | Cambiar escala |
| Espacio | Play / Stop del jam |

---

## Instalación y uso

### App de escritorio
Requiere [Node.js](https://nodejs.org/) 18 o superior.

```bash
npm install
npm start
```

Instaladores:

```bash
npm run build-win    # Windows (.exe)
npm run build-mac    # macOS (.dmg)
npm run build-linux  # Linux (.AppImage)
```

### Web
Es un sitio estático, sin build. En Netlify (ver `netlify.toml`), `/` sirve la landing y `/app` la aplicación. Para probarlo localmente alcanza con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

El micrófono en la web necesita HTTPS (Netlify ya lo da) o `localhost`.

---

## Estructura

```
escalas-app/
├── index.html          ← la app completa (UI, audio, cursos y ejercicios)
├── landing.html        ← página de presentación
├── main.js             ← proceso principal de Electron
├── netlify.toml        ← deploy web y redirecciones
├── resources/          ← guías de práctica en Markdown
├── JAMLISTENER.md      ← diseño técnico del Jam Listener
└── package.json
```

Todo el audio se sintetiza con Web Audio (sin samples ni dependencias). La detección de notas usa autocorrelación; la de acordes y tonalidad, croma por FFT.

---

## Notas

- **Datos**: progreso, récords, presets y ajustes se guardan en `localStorage` del navegador.
- **Jam compartido desde la app de escritorio**: configurá `SHARE_BASE_URL` en `index.html` con la URL pública de la versión web.
- **Sincronizado por reloj**: requiere la hora automática activada en cada dispositivo. La rotación de tonalidad no se sincroniza.

---

## Novedades

### 1.1.0
- **Modo jam con backing track**: banda sintetizada con 6 grooves, tempo estable, tap tempo, volumen por pista, rotación de tonalidad, jam compartido y feedback de notas por micrófono.
- **Curso "improvisar razonando"**: 15 lecciones evaluadas por micrófono.
- **Armonía** convertida en un curso intermedio aplicado a la guitarra, con diagramas de acordes y verificación por micrófono.
- **Pestaña Práctica**: afinador, entrenador de velocidad y ejercicios con micrófono.
- **Entrenador de teoría**: preguntas de escalas, modos y armonía.
- **Diapasón**: posiciones reales de la escala con formas CAGED.
- **Arreglos**: el blues de 12 compases tocaba los acordes equivocados (F# y B♭ en lugar de IV7 y V7) y los acordes no sonaban en blues y pentatónicas; las flechas ya no cambian la tónica mientras usás un desplegable.
- Se quitó el wishlist de la app y de la landing.

### 1.0.0
- Referencia de escalas, teclado, acordes diatónicos, círculo de quintas, modos, diapasón, entrenador de intervalos, constructor de escalas, menores y Jam Listener.
