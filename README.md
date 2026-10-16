# Escalas para Improvisación — App Electron

Referencia de escalas musicales para músicos de improvisación.

## Requisitos

- [Node.js](https://nodejs.org/) v18 o superior

## Instalación

```bash
cd escalas-app
npm install
npm start
```

## Compilar instalador

```bash
npm run build-win    # Windows .exe
npm run build-mac    # Mac .dmg
npm run build-linux  # Linux .AppImage
```

## Funcionalidades

- **Armonía aplicada a la guitarra · Intermedio** (pestaña Armonía): 10 lecciones para entender y tocar acordes en el mástil
  - armonizar la escala, funciones (T–SD–D) y sustituciones, inversiones de tríadas, cadencias (con quiz de oído), cuatriadas con shells, ii–V–I con conducción de voces, dominantes secundarios, préstamo modal, armonía en menor y sustitución tritonal
  - diagramas de acordes generados en cualquier tonalidad, en tres tipos de forma (cejilla E/A, tríadas en cuerdas agudas, shells), eligiendo cada forma lo más cerca posible de la anterior
  - tocar la progresión con la banda y verificar con el micrófono que cada acorde que rasgueás coincida con el que suena
- **Curso "improvisar razonando"** (pestaña 🎓 Curso): 15 lecciones de básico a avanzado para aprender *qué, cómo y cuándo* tocar, no a memorizar escalas.
  - Cada lección explica la idea, cómo pensarla y cuándo usarla, con pasos concretos en la guitarra
  - Se toca sobre un backing preparado por la lección; el micrófono evalúa **decisiones**: terminar frases en la tónica o en el acorde, dejar espacio, caer en la 3ra en cada cambio, resolver tensiones, aproximaciones cromáticas, nota característica del modo, repetir un motivo
  - "Otra tonalidad" transpone la lección completa (textos incluidos) para razonar en vez de repetir digitaciones
  - Pregunta de reflexión al terminar y progreso guardado; opción "Lo hice sin micrófono"
- **Modo jam con backing track** (visible en Estudio y en Jam):
  - batería, bajo y acordes sintetizados con 6 grooves: rock, funk, blues shuffle, bossa nova, balada y metrónomo
  - scheduler sobre el reloj de Web Audio: tempo estable y BPM que cambia sin cortar el loop
  - tap tempo, cuenta de entrada, volumen por pista y cambio de tonalidad en vivo
  - acordes con 7mas/9nas diatónicas en funk, bossa y balada
  - panel "Ahora / Sigue" con las notas del acorde y la nota objetivo (3ra)
  - rotación automática de tonalidad (por cuartas, quintas, medio tono o al azar) y tiempo practicado por día
  - blues de 12 compases (clásico, quick change y menor) con los acordes correctos
  - "Escuchar mi guitarra": te dice si la nota que tocás está en el acorde, en la escala o afuera
  - link de jam compartido, con arranque sincronizado por reloj
- **Posiciones reales en el diapasón**: las 5 cajas de la pentatónica (y del blues, con la blue note) con su forma CAGED, y 3 notas por cuerda en escalas de 7 notas. Con el jam sonando, la guitarra sigue el acorde actual.
- **Pestaña Práctica**:
  - *Afinador* cromático con aguja en cents, cuerda detectada y notas de referencia
  - *Entrenador de velocidad*: sube el BPM cada N vueltas hasta tu objetivo, botón "Me trabé" y récord de BPM limpio por escala y progresión
  - *Ejercicios con micrófono*: escala sube/baja, terceras, grupos de 3, arpegios de cuatriadas por grado y notas guía del ii–V–I; la app escucha y avanza nota por nota, con tiempo, errores y récord
- **Entrenador de teoría**: además de intervalos, preguntas de *escalas y modos* (notas, armaduras, relativas, color modal, escala madre) y de *armonía* (cuatriadas diatónicas, funciones, V7, ii–V–I, notas del acorde, qué modo tocar sobre cada acorde, dominantes secundarios), con notas escritas con la ortografía correcta de cada tonalidad y explicación en cada respuesta
- **Entrenador de intervalos** con 3 tipos de ejercicio:
  - *Identificar*: "¿qué intervalo hay entre Do y Lab?"
  - *Construir*: "dame la 6ª menor de Mi"
  - *Encontrar raíz*: "¿qué nota está una 5ª justa por debajo de Re?"
  - Modo **Examen** con cuenta regresiva por pregunta (5 / 10 / 15 s)
  - Corrección instantánea con marcado de botones y piano mini (raíz en azul, nota objetivo en naranja)
  - Filtro de intervalos activos (toggle por intervalo)
  - Score de sesión en tiempo real (correctas, racha, racha máxima)
- **14 escalas**: Mayor, menores (natural, armónica, melódica), modos griegos, pentatónicas, blues, tonos enteros, disminuida, cromática
- **12 tónicas** con notación en sostenidos ♯ o bemoles ♭
- **Teclado visual** con 1 o 2 octavas, notas de la escala resaltadas
- **Grados** con nombre, nota e intervalo
- **Acordes diatónicos** con calidad (mayor, menor, disminuido, aumentado, dominante)
- **Círculo de quintas interactivo (SVG responsive)** con:
  - 12 tonalidades mayores, 12 relativas menores y anillo de armaduras
  - selección contextual (tónica, dominante y subdominante) + atenuación del resto
  - distancia tonal para modulación (suave/media/dramática) con gradiente visual
  - panel contextual con armadura, relativa menor, funciones IV/V, progresiones y tip por tonalidad
  - sincronización bidireccional con la app (sidebar ↔ círculo)
  - resaltado en pulso de acordes del beat player según BPM/progresión
- **Modos** relativos con "feeling" de cada uno
- **Tips de improvisación** específicos para cada escala
- **Navegación por teclado**: ← → para cambiar tónica, ↑ ↓ para cambiar escala

## Estructura

```
escalas-app/
├── main.js       ← proceso Electron
├── index.html    ← UI completa
├── package.json
└── README.md
```

## Notas

- **Micrófono**: usá auriculares para que no escuche la pista. En la web necesita HTTPS (Netlify ya lo da).
- **Jam compartido desde la app de escritorio**: configurá `SHARE_BASE_URL` en `index.html` con la URL pública de la app web.
- **Sincronizado por reloj**: requiere la hora automática activada en cada dispositivo. La rotación de tonalidad no se sincroniza.
