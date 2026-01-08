# Tutorial: Duolingo Anki Extension

> **Aprende a crear una extensión de Firefox que integra Duolingo con Anki usando IA**

## Requisitos Indispensables

**Para usar este proyecto NECESITAS obligatoriamente:**

1. **AnkiConnect Plugin** - Código: `2055492159`
    - Instalar en Anki: Tools → Add-ons → Browse & Install
    - Sin esto, la extensión no puede crear tarjetas

2. **Google Gemini API Key** - Empieza con `AIzaSy`
    - Obtener en: https://makersuite.google.com/app/apikey
    - Sin esto, la extensión no puede procesar errores con IA

**Ambos son REQUERIDOS. Sin ellos, la extensión no funcionará.**

---

## ¿Qué aprenderás en este tutorial?

- **Extension Development** - Cómo crear extensiones para Firefox
- **DOM Manipulation** - Extraer datos de páginas web
- **API Integration** - Conectar con Gemini y AnkiConnect
- **Modern TypeScript** - Patrones y buenas prácticas
- **AI Prompt Engineering** - Cómo usar Gemini de forma efectiva
- **Storage Security** - Manejo seguro de API keys

## Objetivo del Proyecto

Crear una extensión que:

1. **Capture errores** automáticamente de Duolingo
2. **Procese con IA** para categorizar y dar consejos
3. **Genere tarjetas** en Anki automáticamente
4. **Sea configurable** mediante un popup elegante

---

## Tutorial Paso a Paso

### Paso 1: Configuración del Entorno

```bash
# Clonar el repositorio
git clone https://github.com/MoriNo23/duolingo-anki-extension.git
cd duolingo-anki-extension

# Instalar dependencias
pnpm install

# Configurar WXT Framework
pnpm run dev:firefox
```

### Paso 2: Arquitectura Básica

**Estructura de archivos explicada:**

```
entrypoints/
├── background.ts      # Service Worker - Corre en background
├── content.ts         # Content Script - Se inyecta en Duolingo
└── popup/             # Popup de configuración
    ├── popup.html     # Interfaz usuario
    └── popup.ts       # Lógica del popup

util/
├── almacenamiento.ts      # Almacenamiento de errores
├── geminiService.ts       # Integración con Gemini AI
├── ankiService.ts         # Integración con AnkiConnect
└── storageService.ts      # Manejo seguro de API keys
```

### Paso 3: Captura de Errores en Duolingo

**Concepto clave:** Usar `MutationObserver` para detectar cambios en el DOM

```typescript
// observadorDeErrores.ts
const observer = new MutationObserver(() => {
    // Detectar cuando el usuario hace clic en "Next"
    const buttonNext = document.querySelector('button[data-test="player-next"]')

    if (buttonNext && tieneColorVerde) {
        // Extraer errores del DOM
        extraerErrores()
    }
})
```

**Lección:** Las páginas modernas (como Duolingo) usan React/Preact, por lo que los elementos aparecen dinámicamente. necesitas esperar a que existan con `setTimeout` o `MutationObserver`.

### Paso 4: Almacenamiento de Errores

**Patrón:** Store simple con TypeScript

```typescript
interface ErrorDelUsuario {
    textoPrueba: string
    textoEntrada: string
    textoSolucion: string
}

let erroresAcumulados: ErrorDelUsuario[] = []

export const agregarError = (error: ErrorDelUsuario) => {
    erroresAcumulados.push(error)
}
```

**Lección:** Un store simple es suficiente para datos temporales. No necesitas Redux o Zustand para proyectos pequeños.

### Paso 5: Integración con Gemini AI

**Concepto:** Prompt Engineering + JSON Parsing robusto

```typescript
const contenido = `Analiza estos errores de Duolingo y crea un mazo de Anki.

ERRORES:
${errores
    .map(
        (error, index) => `
${index + 1}. Pregunta: "${error.textoPrueba}"
   Respuesta usuario: "${error.textoEntrada}"
   Respuesta correcta: "${error.textoSolucion}"
`
    )
    .join('\n')}

RESPONDE ÚNICAMENTE CON JSON ESTRICTO:
{
  "mazo": "ErroresDuolingo",
  "tarjetas": [...]
}`
```

**Lección crítica:** Gemini a veces devuelve texto adicional junto con JSON. Necesitas parsing robusto:

```typescript
const jsonMatch = response.text.match(/\{[\s\S]*\}/)
const jsonData = JSON.parse(jsonMatch[0])
```

### Paso 6: Manejo Seguro de API Keys

**Problema:** No poner API keys en el código

**Solución:** Storage service con validación

```typescript
export const guardarApiKey = async (apiKey: string): Promise<boolean> => {
    // Validar formato Gemini
    if (!apiKey.startsWith('AIzaSy') || apiKey.length !== 39) {
        return false
    }

    await browser.storage.local.set({ geminiApiKey: apiKey })
    return true
}
```

**Lección:** Usa `browser.storage.local` para datos sensibles. Es más seguro que localStorage.

### Paso 7: Integración con AnkiConnect

**Concepto:** API REST local para Anki

```typescript
const response = await fetch('http://127.0.0.1:8765', {
  method: 'POST',
  body: JSON.stringify({
    action: 'addNote',
    version: 6,
    params: { note: {...} }
  })
});
```

**Lección importante:** Detecta automáticamente los modelos disponibles:

```typescript
const modelos = await obtenerModelosDisponibles()
const modeloSeleccionado = seleccionarMejorModelo(modelos)
```

### Paso 8: Debounce Pattern

**Problema:** Múltiples llamadas a Gemini

**Solución:** Debounce proper

```typescript
let debounceTimer: NodeJS.Timeout | null = null
let erroresPendientes: any[] = []

export const generarMazoConDebounce = (errores: any[]) => {
    erroresPendientes = errores

    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(() => {
        generarMazoAnki(erroresPendientes)
    }, 2000)
}
```

**Lección:** El debounce debe ser EXTERNO a la función async, no interno.

---

## Diseño del Popup

### HTML Moderno con CSS

```html
<div class="container">
    <div class="header">
        <div class="logo">Duolingo → Anki</div>
    </div>

    <input type="text" id="apiKey" placeholder="AIzaSy..." />
    <button id="saveBtn">Guardar API Key</button>
</div>
```

### CSS con Gradientes y Animaciones

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

button:hover {
    transform: translateY(-1px);
    transition: all 0.3s ease;
}
```

**Lección:** Un buen popup hace la extensión más profesional y fácil de usar.

---

## Tecnologías Aprendidas

### Frontend/Extension

- **TypeScript** - Tipado estático
- **WXT Framework** - Desarrollo moderno de extensiones
- **Firefox Manifest V2** - Compatible y estable

### APIs Externas

- **Google Gemini API** - Procesamiento de lenguaje
- **AnkiConnect API** - Integración con Anki
- **Browser Storage API** - Almacenamiento seguro

### Patrones de Diseño

- **Observer Pattern** - Para cambios DOM/URL
- **Debounce Pattern** - Optimización de llamadas
- **Store Pattern** - Gestión de estado simple
- **Service Pattern** - Abstracción de APIs

---

## Problemas Comunes y Soluciones

### "undefined element" Error

**Problema:** Elementos no existen cuando buscas
**Solución:** Siempre verifica con `if(element) return ""`

```typescript
if (!elementContainer) return ''
const texto = elementContainer.textContent
```

### "model was not found" en Anki

**Problema:** Asumir que existe el modelo "Basic"
**Solución:** Detectar modelos automáticamente

### JSON parse error con Gemini

**Problema:** Gemini devuelve texto + JSON
**Solución:** Extraer JSON con regex

---

## Construcción y Despliegue

```bash
# Desarrollo
pnpm run dev:firefox

# Producción
pnpm run build:firefox

# Crear .xpi para instalación
pnpm run zip:firefox
```

El archivo `.xpi` generado está listo para instalar en Firefox.

---

## Aplicaciones de este Proyecto

### Skills Desarrolladas

- **Extension Development** - Aplicable a cualquier browser
- **API Integration** - Conectar cualquier servicio REST
- **AI Integration** - Prompt engineering y parsing
- **Modern TypeScript** - Patrones y buenas prácticas
- **DOM Manipulation** - Extraer datos de cualquier web

### Proyectos Similares que Puedes Crear

- **GitHub Issue Analyzer** - Analizar issues con IA
- **Twitter Thread Summarizer** - Resumir hilos con Gemini
- **YouTube Chapter Generator** - Crear capítulos automáticamente
- **News Article Classifier** - Clasificar noticias por tema

---

## Sobre el Uso de IA en este Proyecto

### Con Sinceridad: El Rol Real de la IA

Este proyecto fue desarrollado con una colaboración de aproximadamente **15-20% de IA** y **80-85% de esfuerzo humano**.

#### ¿Qué ayudó la IA?

- **Nombres de funciones** - Sugerencias para nombres descriptivos en español
- **Estructura inicial** - Ideas sobre organización de archivos
- **Optimizaciones menores** - Mejoras en código existente
- **Documentación** - Ayuda formateando README y comentarios
- **Patrones sugeridos** - Ideas sobre debounce y storage

#### ¿Qué fue 100% humano?

- **Lógica de negocio principal** - La detección de errores en Duolingo
- **Solución de problemas críticos** - El famoso "undefined element"
- **Integración real con APIs** - Conexión con Gemini y AnkiConnect
- **Debugging y testing** - Horas de prueba y error
- **Decisiones de arquitectura** - Elegir WXT, TypeScript, etc.
- **Experiencia de usuario** - Diseño del popup y flujo

#### La Lección Más Importante

La IA es una **herramienta de aceleración**, no un reemplazo del pensamiento humano. Los problemas reales (como el timing del DOM, el debounce proper, el parsing robusto) requieren experiencia y juicio humano.

**El 80% del valor de este proyecto vino de la experiencia humana resolviendo problemas reales.**

### Honestidad Técnica

- **Prompt Engineering**: Aprendido por ensayo y error
- **API Integration**: Requirió lectura de documentación real
- **Error Handling**: Desarrollado mediante testing real
- **User Experience**: Basado en feedback y observación

**La IA puede escribir código, pero no puede reemplazar la experiencia de resolver problemas reales.**

---

## Derechos Reservados

**Uso Educativo y Personal**

Este proyecto y tutorial están destinados exclusivamente para fines **educativos y personales**.

### Permitido:

- **Aprendizaje** - Estudiar el código y técnicas
- **Modificación personal** - Adaptar para tu uso
- **Referencia** - Usar como guía para otros proyectos
- **Educación** - Enseñar conceptos de desarrollo

### No permitido:

- **Uso comercial** - Vender este producto o derivados
- **Redistribución** - Publicar como propio sin atribución
- **Plagio** - Copiar sin crédito apropiado
- **Uso malicioso** - Extraer datos de usuarios sin consentimiento

### Atribución

Si usas este proyecto para aprender o como referencia, por favor menciona:

> "Basado en el tutorial 'Duolingo Anki Extension' por MoriNo23"

---

## Conclusión

Este proyecto demuestra que con las herramientas modernas (TypeScript, WXT, IA) puedes crear extensiones potentes que resuelvan problemas reales.

**El valor no está en la IA, sino en cómo la usas para resolver problemas humanos.**

**Happy Coding! **

---

_Hecho con para la comunidad de desarrolladores que quieren aprender integrando IA de forma responsable._
