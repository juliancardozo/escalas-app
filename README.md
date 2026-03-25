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

- **14 escalas**: Mayor, menores (natural, armónica, melódica), modos griegos, pentatónicas, blues, tonos enteros, disminuida, cromática
- **12 tónicas** con notación en sostenidos ♯ o bemoles ♭
- **Teclado visual** con 1 o 2 octavas, notas de la escala resaltadas
- **Grados** con nombre, nota e intervalo
- **Acordes diatónicos** con calidad (mayor, menor, disminuido, aumentado, dominante)
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
