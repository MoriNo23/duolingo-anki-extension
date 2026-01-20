import { GoogleGenAI } from '@google/genai';
import { enviarMazoAAki, verificarAnkiConnect, type AnkiDeckResponse } from './ankiService';
import { DuolingoRespuesta, AnkiDeck, ExtensionError, ERROR_CODES } from '@/types';
import { logger } from '@/util/logger';
import { obtenerNombreMazo } from './nombresDeMazos';

// Variable para debounce proper
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let respuestasPendientes: DuolingoRespuesta[] = [];

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

// Función para validar formato de API key
function validateApiKey(apiKey: string): boolean {
  return apiKey.length > 20 && apiKey.startsWith('AIza');
}

export async function generarMazoAnki(respuestas: DuolingoRespuesta[]): Promise<void> {
  try {
    const apiKey = await getGeminiApiKey();

    if (!apiKey) {
      throw new ExtensionError(
        'No hay API key configurada',
        ERROR_CODES.NO_API_KEY,
        'Por favor configura tu API key de Gemini en el popup'
      );
    }

    if (!validateApiKey(apiKey)) {
      throw new ExtensionError(
        'API key inválida',
        ERROR_CODES.INVALID_API_KEY,
        'La API key de Gemini parece inválida. Verifícala en el popup'
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    if (respuestas.length === 0) {
      logger.debug('No hay respuestas para procesar');
      return;
    }

    logger.data('Procesando errores con Gemini AI', { cantidad: respuestas.length });

    // Obtener idioma de origen y aprendizaje del primer error (asumimos que todos son de la misma sesión)
    const { idiomaOrigen, idiomaAprendizaje } = respuestas[0];
    const nombreMazo = obtenerNombreMazo(idiomaOrigen, idiomaAprendizaje);

    const contenido = `Analiza estos errores de Duolingo y crea un mazo de Anki. 
    
REGLAS PARA LAS TARJETAS:
1. Si 'esEjercicioAudio' es true: Crea una tarjeta de PRONUNCIACIÓN. 
   - Front: El texto indicado en 'frase' (ej: "¿Cómo se pronuncia 'hello'?").
   - Back: La fonética aproximada en ESPAÑOL (ej: "jelou").
   - Consejo: Un tip breve sobre cómo posicionar la lengua o labios.
2. Si 'esEjercicioAudio' es false: Crea una tarjeta de TRADUCCIÓN.
   - Front: El texto en 'frase'.
   - Back: La 'mejorSolucion'.
   - Consejo: Una explicación breve de por qué la 'respuestaUsuario' estaba mal.

ERRORES PARA PROCESAR:
${respuestas
        .map(
          (r, index) => `
${index + 1}. Frase: "${r.frase}"
   Respuesta usuario: "${r.respuestaUsuario}"
   Respuesta correcta: "${r.mejorSolucion}"
   Es audio: ${r.esEjercicioAudio}`,
        )
        .join('\n')}

RESPONDE ÚNICAMENTE CON JSON ESTRICTO:
{
  "mazo": "${nombreMazo}",
  "tarjetas": [
    {
      "front": "texto",
      "back": "texto",
      "categoria": "Gramática|Pronunciación|Vocabulario",
      "consejo": "tip práctico"
    }
  ]
}

SIN TEXTO ADICIONAL. SOLO JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contenido,
    });

    const responseText = response.text ?? '';
    logger.debug('Respuesta de Gemini', { texto: responseText.substring(0, 100) + '...' });

    // Parsear respuesta JSON
    let ankiDeck: AnkiDeck;
    try {
      ankiDeck = JSON.parse(responseText);
    } catch (parseError) {
      // Si falla parseo directo, buscar JSON con regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini no devolvió JSON válido');
      }
      const jsonString = jsonMatch[0];
      logger.debug('JSON extraído con regex', { longitud: jsonString.length });
      ankiDeck = JSON.parse(jsonString);
    }

    // Validar estructura del mazo
    if (!ankiDeck.mazo || !Array.isArray(ankiDeck.tarjetas)) {
      throw new ExtensionError(
        'Respuesta de Gemini inválida',
        ERROR_CODES.GEMINI_ERROR,
        'La respuesta de Gemini no tiene el formato esperado.'
      );
    }

    // Verificar conexión con AnkiConnect
    const ok = await verificarAnkiConnect();
    if (!ok) {
      throw new ExtensionError(
        'AnkiConnect no disponible',
        ERROR_CODES.ANKI_ERROR,
        'AnkiConnect no está disponible. Abre Anki e instala AnkiConnect.'
      );
    }

    // Enviar mazo a Anki
    const ankiResponse = await enviarMazoAAki(ankiDeck);
    logger.success('Mazo enviado a Anki exitosamente');

  } catch (error) {
    if (error instanceof ExtensionError) {
      console.error(`Error (${error.code}): ${error.message}`);
      console.error('Mensaje para usuario:', error.userMessage);
      throw error;
    } else {
      console.error('Error inesperado:', error);
      throw new ExtensionError(
        'Error inesperado en generarMazoAnki',
        ERROR_CODES.GEMINI_ERROR,
        'Ocurrió un error inesperado. Intenta de nuevo.'
      );
    }
  }
}

export const generarMazoAnkiConDebounce = (respuestas: DuolingoRespuesta[]) => {
  respuestasPendientes = respuestas;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    generarMazoAnki(respuestasPendientes).catch((e) => console.error(e));
    debounceTimer = null;
    respuestasPendientes = [];
  }, 2000);
};
