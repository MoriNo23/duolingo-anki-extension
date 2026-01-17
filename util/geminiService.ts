import { GoogleGenAI } from '@google/genai';
import { enviarMazoAAki, verificarAnkiConnect, type AnkiDeckResponse } from './ankiService';

// Variable para debounce proper
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let erroresPendientes: any[] = [];

// Función para obtener la API key desde el localStorage del background
async function getGeminiApiKey(): Promise<string> {
  // El background siempre guarda la API key en localStorage
  if (typeof localStorage !== 'undefined') {
    const apiKey = localStorage.getItem('geminiApiKey');
    return apiKey || '';
  }
  
  // Si no hay localStorage (ej. en popup), devolver vacío
  return '';
}

export async function generarMazoAnki(errores: any[]): Promise<void> {
  const apiKey = await getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error('No hay API key configurada. Por favor configura la API key en el popup.');
  }

  const ai = new GoogleGenAI({ apiKey });

  if (errores.length === 0) {
    return;
  }

  const contenido = `Analiza estos errores de Duolingo y crea un mazo de Anki.

ERRORES:
${errores
    .map(
      (error, index) => `
${index + 1}. Pregunta: "${error.textoPrueba}"
   Respuesta usuario: "${error.textoEntrada}"
   Respuesta correcta: "${error.textoSolucion}"`,
    )
    .join('\n')}

RESPONDE ÚNICAMENTE CON JSON ESTRICTO:
{
  "mazo": "ErroresDuolingo",
  "tarjetas": [
    {
      "front": "texto en idioma original",
      "back": "traducción correcta",
      "categoria": "nombre de categoría",
      "consejo": "consejo específico y práctico"
    }
  ]
}

SIN TEXTO ADICIONAL. SOLO JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contenido,
  });

  const raw = response.text ?? '';
  let mazoAnki: AnkiDeckResponse;

  try {
    mazoAnki = JSON.parse(raw) as AnkiDeckResponse;
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini no devolvió JSON');
    }
    mazoAnki = JSON.parse(jsonMatch[0]) as AnkiDeckResponse;
  }

  if (!mazoAnki?.mazo || !Array.isArray(mazoAnki.tarjetas)) {
    throw new Error('La estructura del JSON devuelto por Gemini no es válida');
  }

  const ok = await verificarAnkiConnect();
  if (!ok) {
    throw new Error('AnkiConnect no está disponible. Abre Anki e instala AnkiConnect.');
  }

  await enviarMazoAAki(mazoAnki);
}

export const generarMazoAnkiConDebounce = (errores: any[]) => {
  erroresPendientes = errores;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    generarMazoAnki(erroresPendientes).catch((e) => console.error(e));
    debounceTimer = null;
    erroresPendientes = [];
  }, 2000);
};
