# Jam Listener — Diseño Técnico & Funcional

> Feature de detección armónica en tiempo real para la app JAM.
> Documento de referencia para desarrollo. Rama: `escuchando-armonia`.

---

## 1. Resumen del concepto

**Jam Listener** escucha el audio del entorno (micrófono o entrada de línea), extrae los pitch classes dominantes mediante análisis espectral, infiere la tonalidad / escala más probable y mapea ese resultado a los recursos de improvisación ya existentes en la app: visualizador de escala, diapasón, acordes compatibles y sugerencias de notas objetivo.

**En una oración para el usuario:**
> "Ponele play a tu backing track, apuntá el micrófono, y la app te dice qué podés tocar encima."

---

## 2. Problema que resuelve

| Situación actual | Con Jam Listener |
|---|---|
| El usuario sabe que hay algo sonando pero no sabe en qué tonalidad está | La app detecta el centro tonal y lo muestra en 3–5 seg |
| El usuario tiene que identificar la escala manualmente, cambiando en el panel lateral | La app cambia el contexto de la app directamente si el usuario lo acepta |
| Contexto ambiguo → el usuario adivina | La app muestra confianza + alternativa + "necesitamos más audio" |

---

## 3. User Stories

```
US-01  Como improvisador, quiero que la app escuche lo que está sonando
       para saber en qué tonalidad estoy sin tener que identificarla yo.

US-02  Como improvisador, quiero ver qué escala es compatible con lo que suena
       para elegir directamente qué tocar.

US-03  Como improvisador, quiero ver las notas objetivo y shapes sugeridos
       para empezar a tocar sin pensar.

US-04  Como usuario, quiero que la app sea honesta cuando no está segura
       para no confiarme en resultados inciertos.

US-05  Como usuario, quiero poder aceptar el contexto detectado con un toque
       para que el diapasón y la escala se actualicen solos.

US-06  Como usuario, quiero que la feature funcione sin internet
       para usarla en un ensayo o en vivo.
```

---

## 4. Diseño funcional

### 4.1 Qué hace paso a paso

1. Usuario toca **▶ Escuchar** → se pide permiso de micrófono
2. La app captura audio en ventanas de **~2 segundos** con overlap del 50%
3. Cada ventana se procesa:
   - FFT → espectro de frecuencias
   - Extracción de pitch classes con pesos por amplitud → **Chroma vector** (12 bins)
   - Scoring contra las 12 tonalidades × {mayor, menor natural} → **24 candidatos**
   - Se aplica smoothing temporal (últimas 4 ventanas) 
4. El resultado se muestra en tiempo real:
   - Centro tonal probable (ej: `E menor`)
   - Alternativa (ej: `G Mayor`)
   - Confianza en %
   - Escala sugerida para improvisar
   - Acorde probable si hay evidencia fuerte
5. Usuario puede tocar **Usar este contexto** → actualiza `rootIdx` + `scaleIdx` en la app
6. La app muestra el diapasón / teclado resaltado con esa escala

### 4.2 Lo que NO hace el MVP

- Transcripción nota por nota
- Detección de progresiones complejas
- Separación de instrumentos
- Funcionar bien con percusión pura o ruido blanco
- Análisis de intervalos < 100Hz con precisión (subgraves)

---

## 5. Arquitectura técnica

### 5.1 Stack

Esta app es vanilla JS + Web Audio API en un único `index.html`. El MVP sigue el mismo patrón: **todo inline**, sin build step, sin dependencias externas.

### 5.2 Pipeline de análisis

```
Micrófono
    │
    ▼
MediaStream (getUserMedia)
    │
    ▼
AudioContext.createMediaStreamSource()
    │
    ▼
AnalyserNode (FFT size: 4096, smoothing: 0.7)
    │
    ├── frequencyBinCount bins de magnitud (Float32Array)
    │
    ▼
mapFreqBinsToChroma(binData, sampleRate)
    │   Para cada bin: freq → midi → pitchClass(0-11) → acumular magnitud
    │   Solo bins > threshold de silencio
    │
    ▼
chromaVector[12]   ← normalizado 0..1
    │
    ▼
temporalSmoothing(chromaHistory, 4 ventanas)
    │
    ▼
scoreTonalities(smoothedChroma)
    │   Para cada una de las 24 tonalidades (12 roots × mayor/menor):
    │   score = Σ(chromaVector[pc] × KRUMHANSL_WEIGHTS[mode][pc])
    │   → ordena candidatos por score
    │
    ▼
detectChord(smoothedChroma)
    │   Matching contra plantillas de triadas + séptimas básicas
    │   Solo si score del mejor candidato > threshold
    │
    ▼
buildRecommendation(topCandidate, chordCandidate)
    │
    ▼
renderListenerResult(result)  → UI
```

### 5.3 Perfiles de Krumhansl-Schmuckler

Pesos cognitivos de cada pitch class en contexto mayor/menor (valores normalizados):

```js
// Perfil mayor (Krumhansl 1990)
const KK_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
// Perfil menor natural
const KK_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
```

Para cada tonalidad candidata `root` (0..11), el score de correlación es:
```
score_major(root) = Σ_{pc=0}^{11} chroma[(pc - root + 12) % 12] × KK_MAJOR[pc]
score_minor(root) = Σ_{pc=0}^{11} chroma[(pc - root + 12) % 12] × KK_MINOR[pc]
```

### 5.4 Plantillas de acordes

```js
const CHORD_TEMPLATES = {
  maj:  [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],  // 1 3 5
  min:  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],  // 1 b3 5
  dom7: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],  // 1 3 5 b7
  m7:   [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],  // 1 b3 5 b7
  maj7: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],  // 1 3 5 7
  dim:  [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],  // 1 b3 b5
  sus4: [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],  // 1 4 5
};
```

Score de acorde = correlación entre chroma normalizado y plantilla:
```
chordScore(root, type) = Σ_{pc=0}^{11} chroma[(pc-root+12)%12] × CHORD_TEMPLATES[type][pc]
```

### 5.5 Mapeo a escalas de la app

```js
// rootIdx semitone (0=C) + scale id → ya existen en SCALES[]
const TONALITY_TO_SCALE = {
  'major':         'major',
  'natural_minor': 'natural_minor',
  // si confianza < 60% → sugerir pentatónica (más tolerante a errores)
  'major_penta':   'pentatonic_major',
  'minor_penta':   'pentatonic_minor',
};
```

### 5.6 Estados del sistema

```
IDLE              → UI vacía, botón "Escuchar"
REQUESTING        → esperando getUserMedia
PERMISSION_DENIED → mensaje de error, instrucciones para habilitar mic
LISTENING         → procesando, mostrando nivel de entrada
NO_SIGNAL         → señal demasiado baja, pedir más audio
ANALYZING         → suficiente señal, computando
STABLE            → resultado con confianza ≥ 65%
UNCERTAIN         → resultado con confianza < 65%, muestra ambas opciones
NOISY             → señal demasiado ruidosa (RMS alta pero sin estructura tonal)
ERROR             → fallo de AudioContext o navegador incompatible
```

---

## 6. Algoritmo recomendado para MVP

### Elección: Opción C — Pipeline híbrido (con simplificaciones)

**Justificación:**

| Criterio | Opc A Heurística | Opc B Templates | Opc C Híbrido | Opc D ML |
|---|---|---|---|---|
| Precisión | Media | Baja-media | Buena | Alta |
| Latencia | Muy baja | Baja | Baja-media | Media-alta |
| Complejidad impl. | Baja | Baja | Media | Alta |
| Sin dependencias | ✓ | ✓ | ✓ | ✗ |
| Mantenible | ✓ | ✓ | ✓ | ✗ |
| **Veredicto** | Backup | Solo acordes | **MVP** | V2 online |

**Decisiones concretas del pipeline MVP:**
1. FFT size 4096 @ 44100 Hz → resolución de ~10.7 Hz/bin (suficiente para pitch)
2. Solo bins en rango 80–2000 Hz (guitarra, piano, voz — ignorar subgraves y agudos extremos)
3. Mapeo bin→pitchClass con octave folding (acumular todas las octavas del mismo PC)
4. Pesos Krumhansl-Schmuckler para scoring tonal
5. Suavizado temporal: media exponencial de las últimas 4 ventanas (λ=0.6)
6. Chord matching: solo si el top candidate de acorde supera 0.70 de correlación normalizada
7. Detección de drones: si un único PC domina > 55% del chroma → reportar como "nota pedal"

---

## 7. Modelo de datos / estado

```js
// Estado global de la feature
const listenerState = {
  status: 'idle',           // ver 5.6
  stream: null,             // MediaStream
  sourceNode: null,         // MediaStreamAudioSourceNode
  analyserNode: null,       // AnalyserNode
  animFrameId: null,        // requestAnimationFrame id
  chromaHistory: [],        // últimas N ventanas de chroma vectors
  result: null,             // DetectedHarmonyContext | null
};

// Resultado de una detección
// DetectedHarmonyContext
{
  rootPc: 9,                        // pitch class 0-11 (9 = A)
  rootName: 'A',
  mode: 'natural_minor',            // scale id
  scaleName: 'Menor Natural',
  confidence: 0.78,                 // 0..1
  altRootPc: 0,                     // alternativa (A menor relativa de C Mayor)
  altMode: 'major',
  altName: 'C Mayor',
  chord: {                          // null si no hay evidencia suficiente
    rootPc: 9,
    rootName: 'A',
    type: 'min',
    label: 'Am',
    score: 0.82
  },
  isDrone: false,
  droneNote: null,
  suggestedScaleId: 'pentatonic_minor',   // puede diferir de mode si conf < 0.65
  suggestedRootPc: 9,
  safeNotes: ['A','C','E'],               // notas del acorde tónico
  avoidNotes: [],                          // notas de máxima fricción
  timestamp: 1712600000000
}

// Frame de análisis intermedio
// AudioAnalysisFrame
{
  chroma: Float32Array(12),   // magnitudes por pitch class, normalizadas
  rms: 0.34,                  // nivel de señal
  dominantPc: 9,
  timestamp: 1712600000000
}
```

---

## 8. Flujo de UI

### 8.1 Layout del tab "Escuchar"

```
┌─────────────────────────────────────────────────────────┐
│  🎙 Escuchar Armonía                                    │
│  Escuchá lo que suena y tocá encima                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [  ▶ Empezar a escuchar  ]    nivel: ▁▂▄▆▄▂▁          │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  DETECCIÓN PRINCIPAL                                    │
│  ┌─────────────────┐  Confianza: 78%  ████████░░        │
│  │   A menor        │                                   │
│  │   Menor Natural  │  Alternativa: C Mayor             │
│  └─────────────────┘                                    │
│                                                         │
│  Acorde probable: Am                                    │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  QUÉ TOCAR                                              │
│  Escala: Pentatónica Menor A    [ Ver en diapasón ]     │
│  Notas objetivo: A · C · E                              │
│  Evitar insistir en: C# (tensión máxima)                │
│                                                         │
│  [ ✓ Usar este contexto en la app ]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Estados visuales

| Estado | Visual |
|---|---|
| `idle` | Botón "Empezar a escuchar", sin medidor |
| `requesting` | Spinner + "Esperando permiso de micrófono…" |
| `permission_denied` | Ícono 🚫 + instrucciones para habilitar en browser |
| `listening / no_signal` | Medidor de nivel activo, "Esperando señal…" |
| `analyzing` | Barra de chroma animada, resultado provisorio con baja conf |
| `stable` | Resultado principal con confianza ≥ 65%, todo visible |
| `uncertain` | Resultado con `?` + ambas opciones visibles + "necesitamos más audio" |
| `noisy` | Advertencia "Hay demasiado ruido, intentá con menos reverb o más volumen" |
| `error` | Mensaje técnico + sugerencia de usar Chrome/Firefox |

---

## 9. Integración con funcionalidades existentes

### 9.1 Mapa de integración

La función clave que ya existe:
```js
// index.html — render() actualiza todo el UI con rootIdx + scaleIdx
function render() { ... }
```

Cuando el usuario toca **"Usar este contexto"**:
```js
function applyListenerResult(result) {
  rootIdx  = result.suggestedRootPc;
  scaleIdx = SCALES.findIndex(s => s.id === result.suggestedScaleId);
  if (scaleIdx < 0) scaleIdx = 0;
  render();        // actualiza teclado, fórmula, acordes
  setTab('guitar'); // o mantener 'listener' y mostrar acceso directo
}
```

### 9.2 Lo que se actualiza automáticamente post-apply

| Componente | Qué muestra |
|---|---|
| Tab Teclado | Escala detectada resaltada en piano |
| Tab Guitarra | Diapasón con notas de la escala detectada |
| Tab Quintas | Círculo de quintas con nueva tónica marcada |
| Tab Constructor | Escala cargada para explorar shapes |
| Tab Menores | Si es escala menor, carga las 3 variantes |
| Tab Armonía | Armonización diatónica de la tonalidad detectada |
| Panel lateral | Root button + scale list actualizados |

### 9.3 Casos de detección → acción

```
Detecta Am pentatónica  →  rootIdx=9, scaleId='pentatonic_minor'
Detecta G Mayor          →  rootIdx=7, scaleId='major'
Detecta C Mayor/Am       →  muestra ambos botones; usuario elige
Detecta D7 (dominante)   →  sugiere D mixolydian o G major (contexto V7)
Detecta drone en E       →  sugiere E minor pentatonic como punto de partida
```

---

## 10. Roadmap de implementación

### MVP (esta rama — `escuchando-armonia`)

**Fase 1 — Infraestructura audio** (1–2 días)
- [ ] Clase/módulo `JamListenerAudio`: `start()`, `stop()`, callback `onFrame(chroma, rms)`
- [ ] `getUserMedia` con manejo de errores y estados
- [ ] Loop de análisis con `requestAnimationFrame` o `setInterval(250ms)`
- [ ] `AnalyserNode` configurado (FFT 4096, smoothing 0.7)
- [ ] Función `extractChroma(frequencyData, sampleRate)` → Float32Array(12)

**Fase 2 — Análisis musical** (1–2 días)
- [ ] Constantes `KK_MAJOR`, `KK_MINOR`
- [ ] `scoreTonalities(chroma)` → array de 24 `{rootPc, mode, score}` ordenados
- [ ] `smoothChroma(history, lambda)` → suavizado exponencial
- [ ] `detectChord(chroma, topTonality)` → `{rootPc, type, label, score}` | null
- [ ] `classifySignal(rms, entropy)` → `'silent' | 'noisy' | 'tonal' | 'drone'`
- [ ] `buildRecommendation(topCandidate, chord)` → `DetectedHarmonyContext`

**Fase 3 — UI del tab** (1–2 días)
- [ ] Nuevo tab "Escuchar" en barra de tabs (ícono 🎙)
- [ ] Panel HTML + CSS inline al estilo del resto de la app
- [ ] Barra de nivel de micrófono (canvas o div animado)
- [ ] Visualización del chroma vector (12 barras, 1 por semitono)
- [ ] Tarjeta de resultado principal con confianza
- [ ] Botón "Usar este contexto"
- [ ] Botones de acceso rápido: "Ver en diapasón", "Ver en teclado"
- [ ] Todos los estados del sistema visualmente representados

**Fase 4 — Integración y polish** (1 día)
- [ ] `applyListenerResult(result)` → conecta con `rootIdx`/`scaleIdx`/`render()`
- [ ] `cancelListenerAudio()` en `setTab()` (como `cancelHarmPlay`)
- [ ] Tests manuales con guitarra, piano, backing tracks, material ambiguo
- [ ] `renderListenerResult()` actualiza cada ~500ms sin parpadeo

### V2 (futura)

- Detección de **cambios de acorde** (ventana deslizante con diff de chroma)
- **Historial de acordes** detectados (últimos 8)
- Sugerencias de **modo específico** (dórico sobre Am, mixolidio sobre G7)
- Exportar contexto detectado como preset
- Integración con **Armonía** tab — mostrar progresión inferida
- Modo "silencioso cuando para" — pausa automática cuando hay silencio
- **ML ligero**: modelo ONNX de ~200KB para chord recognition

### Experimental (no comprometido)

- Separación básica armónicos/percusión por filtrado
- Detección de BPM del ambiente
- Sugerencia de **licks** de la base de datos existente contextualizados

---

## 11. Riesgos y limitaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Navegador sin `getUserMedia` | Bloqueante | Fallback claro + link a docs |
| Latencia de AudioContext iOS | Alta en iPhone | Documentar limitación; probar en Chrome desktop |
| FFT no resuelve bien fundamentales bajas (bajo eléctrico < 80Hz) | Medio | Filtrar por octava, ignorar <80Hz |
| Ambigüedad relativa mayor/menor (siempre existe) | Medio | Mostrar ambas siempre, sugerir la menor si hay contexto previo |
| Ruido de fondo en laptop | Alto | Threshold de RMS; advertencia visual |
| Permiso de micrófono denegado por usuario | Medio | UI clara con instrucciones |
| Chroma no resuelve acordes complejos (maj7#11) | Bajo | MVP solo sugiere triadas y séptimas básicas |

---

## 12. Criterios de aceptación

```
CA-01  Guitarra tocando Am sostenido 4 segundos:
       → rootPc=9, mode='natural_minor', confianza ≥ 65% en ≤ 5 seg.

CA-02  Backing track de G Mayor claro:
       → rootPc=7, mode='major', confianza ≥ 70%.

CA-03  Solo ruido blanco de ventilador:
       → estado 'noisy' o 'no_signal'. NO muestra resultado falso.

CA-04  Silencio total:
       → estado 'no_signal'. Medidor en 0.

CA-05  Toque "Usar este contexto" con A menor detectado:
       → rootIdx=9, scaleIdx → pentatonic_minor o natural_minor, render() ejecutado.

CA-06  Cambio de tab mientras escucha:
       → stream detenido, botón resetea a "Empezar a escuchar".

CA-07  Permiso de micrófono denegado:
       → estado 'permission_denied' + instrucciones visibles.

CA-08  D7 sostenido:
       → chord.label='D7', sugerencia de D mixolydian o G major.
```

---

## 13. Ideas para V2

1. **Chord progression history** — últimos 4–8 acordes detectados como timeline
2. **Modo comparativo** — muestra qué tab / posición ya tenés abierta vs lo detectado
3. **Lick suggester** — conecta con la base de rutinas de jam ya existente
4. **Transpose detector** — "esta backing está en Bb, ¿querés cambiar la notación a bemoles?"
5. **Confidence timeline** — gráfica de confianza de los últimos 30 segundos
6. **Drum-aware mode** — ignora ventanas con mucho ataque percusivo
7. **Export snapshot** — guarda el contexto detectado como preset nombrado
8. **Online ML** — usar un modelo ONNX liviano para chord recognition si hay conexión

---

## 14. Nombres sugeridos

| Nombre | Feeling |
|---|---|
| **Escuchar** | Simple, directo, en el idioma de la app |
| **Jam Listener** | Inglés técnico, claro |
| **Play Over** | Orientado a acción |
| **Detectar armonía** | Descriptivo |
| **Escuchando...** | Estado como identidad (llamativo) |
| **∿ Ambiente** | Minimalista, visual |

**Recomendación:** `Escuchar` como label del tab, `Jam Listener` como nombre técnico interno.

---

## 15. Estructura de archivos (si se extrae a módulos)

> Por ahora todo va inline en `index.html` siguiendo el patrón del proyecto.
> Si se extrae en el futuro:

```
/features/jam-listener/
  JamListenerAudio.js       ← captura, AnalyserNode, extracción de chroma
  TonalAnalysis.js          ← Krumhansl scoring, chord matching, smoothing
  RecommendationMapper.js   ← mapeo a SCALES[], notas objetivo, evitar
  listenerState.js          ← estado reactivo de la feature
  renderListener.js         ← toda la UI del tab
  constants.js              ← KK_MAJOR, KK_MINOR, CHORD_TEMPLATES, thresholds
  __tests__/
    TonalAnalysis.test.js
    RecommendationMapper.test.js
```

---

## 16. Pseudocódigo de servicios

### 16.1 Audio capture service

```js
function startJamListener() {
  listenerState.status = 'requesting';
  renderListenerState();

  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
      initAudio(); // reusar audioCtx existente
      listenerState.stream = stream;
      listenerState.sourceNode = audioCtx.createMediaStreamSource(stream);
      listenerState.analyserNode = audioCtx.createAnalyser();
      listenerState.analyserNode.fftSize = 4096;
      listenerState.analyserNode.smoothingTimeConstant = 0.7;
      listenerState.sourceNode.connect(listenerState.analyserNode);
      // NO conectar a destination → no feedback de audio

      listenerState.status = 'listening';
      scheduleAnalysisLoop();
    })
    .catch(err => {
      listenerState.status = err.name === 'NotAllowedError'
        ? 'permission_denied' : 'error';
      renderListenerState();
    });
}

function stopJamListener() {
  if (listenerState.animFrameId) cancelAnimationFrame(listenerState.animFrameId);
  if (listenerState.stream) listenerState.stream.getTracks().forEach(t => t.stop());
  if (listenerState.sourceNode) listenerState.sourceNode.disconnect();
  listenerState.status = 'idle';
  listenerState.chromaHistory = [];
  listenerState.result = null;
  renderListenerState();
}
```

### 16.2 Tonal analysis

```js
function analyzeFrame() {
  const freqData = new Float32Array(listenerState.analyserNode.frequencyBinCount);
  listenerState.analyserNode.getFloatFrequencyData(freqData);

  const sampleRate = audioCtx.sampleRate;
  const chroma = extractChroma(freqData, sampleRate);
  const rms = computeRMS(freqData);

  const signalType = classifySignal(rms, computeEntropy(chroma));
  if (signalType === 'silent') {
    listenerState.status = 'no_signal';
    renderListenerState(); return;
  }
  if (signalType === 'noisy') {
    listenerState.status = 'noisy';
    renderListenerState(); return;
  }

  // Acumular historial
  listenerState.chromaHistory.push(chroma);
  if (listenerState.chromaHistory.length > 6) listenerState.chromaHistory.shift();

  const smoothed = smoothChroma(listenerState.chromaHistory, 0.6);
  const candidates = scoreTonalities(smoothed); // 24 candidatos ordenados
  const top = candidates[0];
  const chord = detectChord(smoothed, top);

  const confidence = normalizeConfidence(top.score, candidates[1].score);

  listenerState.status = confidence >= 0.65 ? 'stable' : 'uncertain';
  listenerState.result = buildRecommendation(top, candidates[1], chord, confidence);
  renderListenerResult(listenerState.result);
}

function extractChroma(freqDataDb, sampleRate) {
  const N = freqDataDb.length;
  const chroma = new Float32Array(12).fill(0);
  const binWidth = sampleRate / (N * 2);
  for (let i = 1; i < N; i++) {
    const freq = i * binWidth;
    if (freq < 80 || freq > 2000) continue;
    const mag = Math.pow(10, freqDataDb[i] / 20); // dB → linear
    if (mag < 0.001) continue;
    const midi = 69 + 12 * Math.log2(freq / 440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] += mag;
  }
  // Normalizar
  const max = Math.max(...chroma);
  if (max > 0) for (let i = 0; i < 12; i++) chroma[i] /= max;
  return chroma;
}

function scoreTonalities(chroma) {
  const results = [];
  for (let root = 0; root < 12; root++) {
    let scoreMaj = 0, scoreMin = 0;
    for (let pc = 0; pc < 12; pc++) {
      const idx = (pc - root + 12) % 12;
      scoreMaj += chroma[pc] * KK_MAJOR[idx];
      scoreMin += chroma[pc] * KK_MINOR[idx];
    }
    results.push({ rootPc: root, mode: 'major',         score: scoreMaj });
    results.push({ rootPc: root, mode: 'natural_minor', score: scoreMin });
  }
  return results.sort((a, b) => b.score - a.score);
}
```

### 16.3 Recommendation mapper

```js
function buildRecommendation(top, alt, chord, confidence) {
  // Si confianza baja → recomendar pentatónica (más forgiving)
  const scaleId = confidence >= 0.65
    ? top.mode
    : (top.mode === 'major' ? 'pentatonic_major' : 'pentatonic_minor');

  const scaleObj = SCALES.find(s => s.id === scaleId);
  const rootName = NOTES_SHARP[top.rootPc];
  const safeNotes = scaleObj
    ? [0, 2, 4].map(i => NOTES_SHARP[(top.rootPc + scaleObj.intervals[i]) % 12])
    : [];

  return {
    rootPc: top.rootPc,
    rootName,
    mode: top.mode,
    scaleName: scaleObj ? scaleObj.name : top.mode,
    confidence,
    altRootPc: alt.rootPc,
    altMode: alt.mode,
    altName: `${NOTES_SHARP[alt.rootPc]} ${alt.mode === 'major' ? 'Mayor' : 'Menor'}`,
    chord,
    suggestedScaleId: scaleId,
    suggestedRootPc: top.rootPc,
    safeNotes,
    timestamp: Date.now()
  };
}
```

### 16.4 UI state reducer (simplificado)

```js
function renderListenerState() {
  // Status display
  // Botones habilitados/deshabilitados
  // Medidor de nivel
  // Resultado principal si existe
}
```

---

## 17. Plan de testeo

### Manual (MVP)

| Test | Herramienta | Criterio |
|---|---|---|
| Guitarra acústica, A menor, acorde sostenido | Micrófono laptop | Am detectado, conf ≥ 65% |
| Backing track G mayor (YouTube / Spotify) | Speaker → mic | G major detectado |
| Silencio total | — | no_signal |
| Ruido ventilador | Ventilador real | noisy o no_signal, NO resultado falso |
| D7 sostenido | Piano o guitarra | chord.label = 'D7' |
| Cambiar de tab mientras escucha | Click en tab | Stream detenido, sin leak de audio |
| Denegación de permiso | Browser settings → bloquear mic | permission_denied state visible |
| iPhone Safari | Physical device | Degradación aceptable o error claro |

### Automatizado (si se extrae a módulos)

```js
// TonalAnalysis.test.js
test('chroma C mayor → detecta C mayor', () => {
  // [1,0,0,0,1,0,0,1,0,0,0,1] = C E G B (Cmaj7 shape)
  const chroma = new Float32Array([1,0,0,0,1,0,0,1,0,0,0,1]);
  const top = scoreTonalities(chroma)[0];
  expect(top.rootPc).toBe(0);
  expect(top.mode).toBe('major');
});

test('chroma A menor natural → detecta Am', () => {
  const chroma = new Float32Array([0,0,0,0,0,0,0,0,0,1,0,0]);
  // A como PC dominante — debe sugerir Am como candidato top
  const results = scoreTonalities(chroma);
  const topMinor = results.find(r => r.mode === 'natural_minor' && r.rootPc === 9);
  expect(topMinor).toBeDefined();
});
```

---

## 18. Métricas de producto

| Métrica | Target MVP | Medición |
|---|---|---|
| Tiempo hasta primera detección (señal clara) | ≤ 5 segundos | Cronometrar manualmente |
| Tasa de detección correcta (tests manuales 10 acordes comunes) | ≥ 70% | Test manual rutinario |
| False positive en silencio | 0% | Test silencio |
| Crash / error no manejado | 0 | QA manual cross-browser |
| Tiempo de parada al cambiar tab | ≤ 100ms | DevTools audio |
| Satisfacción usuario (encuesta informal) | "útil" en contexto real | Feedback directo |

---

## 19. Estructura interna del tab en `index.html`

### HTML del panel (a insertar en la barra de tabs y paneles)

**Tab button:**
```html
<button type="button" class="tab-btn" role="tab" 
        id="tabBtnListener" data-tab="listener" aria-selected="false">
  Escuchar
</button>
```

**Panel:**
```html
<div class="tab-panel" id="tab-panel-listener" data-tab-panel="listener" hidden>
  <div class="listener-wrap" id="listenerWrap">
    <!-- renderListener() -->
  </div>
</div>
```

### CSS skeleton

Variables reutilizadas: `--accent`, `--green`, `--blue`, `--muted`, `--s1`, `--s2`, `--border`.

Nuevas clases necesarias:
- `.listener-wrap` — layout column, gap 20px
- `.listener-mic-btn` — botón principal grande (verde cuando activo)
- `.listener-level-bar` — barra de nivel de entrada (13 segmentos animados)
- `.listener-chroma-viz` — 12 barras de pitch class
- `.listener-result-card` — tarjeta de resultado principal
- `.listener-confidence-bar` — barra de confianza coloreada
- `.listener-safe-notes` — chips de notas objetivo
- `.listener-apply-btn` — CTA "Usar este contexto"
- `.listener-status-[state]` — modificadores por estado

---

*Documento generado: 8 de abril de 2026. Rama: `escuchando-armonia`.*
