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
