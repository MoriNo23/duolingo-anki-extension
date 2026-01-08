# Duolingo Anki Extension

Extensión de navegador que captura errores de Duolingo y genera tarjetas en Anki usando Gemini.

## Requisitos

### 1) Anki + AnkiConnect

- Debes tener **Anki abierto** mientras usas la extensión.
- Debes instalar el add-on **AnkiConnect** (código: `2055492159`).
  - En Anki: Tools → Add-ons → Browse & Install → pegar el código.
- AnkiConnect expone una API local en `http://127.0.0.1:8765`.

### 2) API Key de Google Gemini

- Necesitas una API key de Gemini (normalmente empieza con `AIzaSy...`).
- Puedes obtenerla en: https://makersuite.google.com/app/apikey

## Cómo funciona (flujo)

- **1. Captura de errores (Duolingo)**
  - El content script detecta los errores en la página de Duolingo y construye un arreglo con:
    - `textoPrueba`
    - `textoEntrada`
    - `textoSolucion`
  - Esos errores se envían al service worker (background) por `browser.runtime.sendMessage`.

- **2. Procesamiento con Gemini**
  - El background llama a `generarMazoAnkiConDebounce` para evitar múltiples llamadas seguidas.
  - `util/geminiService.ts` arma un prompt y le pide a Gemini que responda **solo JSON** con:
    - nombre del mazo (`mazo`)
    - tarjetas (`tarjetas[]`) con `front`, `back`, `categoria`, `consejo`

- **3. Envío a AnkiConnect**
  - `util/ankiService.ts` verifica AnkiConnect (`action: version`).
  - Crea el mazo si no existe (`action: createDeck`).
  - Detecta el modelo disponible y agrega las tarjetas (`action: addNote`).

## Configuración (API Key)

Edita este archivo:

- `util/geminiService.ts`

Y coloca tu key aquí:

- `export const GEMINI_API_KEY = 'TU_API_KEY_AQUI'`

**Nota:** No subas tu key real al repositorio.

## Desarrollo y build

```bash
pnpm install

# desarrollo firefox
pnpm run dev:firefox

# build firefox MV3
pnpm run build:firefox
```

## Troubleshooting

- **No se crean tarjetas en Anki**
  - Verifica que Anki esté abierto.
  - Verifica que AnkiConnect esté instalado.
  - Revisa que `http://127.0.0.1:8765` no esté bloqueado por firewall.

- **Gemini falla**
  - Confirma que `GEMINI_API_KEY` está configurada.
  - Revisa límites/cuota de tu API key.
