import { GoogleGenAI } from "@google/genai";
import { enviarMazoAAki, verificarAnkiConnect } from './ankiService';
import { obtenerApiKey } from './storageService';

// Variable para debounce proper
let debounceTimer: NodeJS.Timeout | null = null;
let erroresPendientes: any[] = [];

/**
 * Obtiene una instancia de GoogleGenAI con la API key del storage
 */
async function obtenerGenAI(): Promise<GoogleGenAI> {
  try {
    const apiKey = await obtenerApiKey();
    
    if (!apiKey) {
      throw new Error('No hay API key configurada. Por favor, configura tu API key de Gemini en el popup de la extensión.');
    }
    
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error('❌ Error obteniendo API key:', error);
    throw error;
  }
}

/**
 * Funcion principal para usar Gemini y generar mazos de Anki
 * Sigue exactamente el metodo de uso proporcionado
 */
async function generarMazoAnki(errores: any[]) {
  try {
    // Si no hay errores, no hacer nada
    if (errores.length === 0) {
      console.log('No hay errores para procesar');
      return;
    }
    
    console.log('Procesando', errores.length, 'errores para Gemini');
    
    // Crear el contenido para Gemini con los errores y la solicitud de mazo Anki
    const contenido = `Analiza estos errores de Duolingo y crea un mazo de Anki llamado "ErroresDuolingo".

ERRORES:
${errores.map((error, index) => `
${index + 1}. Pregunta: "${error.textoPrueba}"
   Respuesta usuario: "${error.textoEntrada}"
   Respuesta correcta: "${error.textoSolucion}"
`).join('\n')}

INSTRUCCIONES:
1. Categoriza cada error (Traducción incorrecta, Error de gramática, Falta de vocabulario, Error de conjugación, Orden de palabras incorrecto, etc.)
2. Crea tarjetas Anki con front/back
3. Da un consejo específico para cada categoría

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

    // Obtener instancia de GenAI con API key del storage
    const genAI = await obtenerGenAI();
    
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contenido,
    });

    // Mostrar la respuesta de Gemini en formato tabla
    console.table(response.text);
    
    // Aqui seguira el resto del codigo...
    
    // Procesar la respuesta de Gemini y enviar a AnkiConnect
    try {
      // Verificar que la respuesta no sea undefined
      if (!response.text) {
        console.error('La respuesta de Gemini está vacía');
        return;
      }
      
      console.log('Respuesta cruda de Gemini:', response.text);
      
      // Intentar extraer JSON de la respuesta de Gemini
      let mazoAnki;
      try {
        // Intentar parsear directamente
        mazoAnki = JSON.parse(response.text);
      } catch (directParseError) {
        // Si falla, intentar extraer JSON del texto
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          mazoAnki = JSON.parse(jsonMatch[0]);
        } else {
          // Si no encuentra JSON, crear una estructura manual
          console.warn('No se encontró JSON en la respuesta, creando estructura manual');
          mazoAnki = {
            mazo: "ErroresDuolingo",
            tarjetas: [] // Array vacío, Gemini no devolvió formato válido
          };
        }
      }
      
      // Verificar que la estructura sea válida
      if (!mazoAnki.mazo || !Array.isArray(mazoAnki.tarjetas)) {
        console.error('La estructura del mazo no es válida:', mazoAnki);
        return;
      }
      
      console.log('Mazo parseado correctamente:', mazoAnki);
      
      // Verificar que AnkiConnect esté disponible
      const ankiDisponible = await verificarAnkiConnect();
      if (!ankiDisponible) {
        console.warn('AnkiConnect no está disponible. Asegúrate de que Anki esté abierto y AnkiConnect instalado.');
        return;
      }
      
      // Enviar el mazo a AnkiConnect
      await enviarMazoAAki(mazoAnki);
      
    } catch (parseError) {
      console.error('Error al procesar la respuesta de Gemini:', parseError);
      console.log('Respuesta cruda de Gemini:', response.text);
    }
    
  } catch (error) {
    console.error('Error al generar mazo con Gemini:', error);
  }
}

/**
 * Funcion con debounce proper - esta es la que se debe llamar desde el background
 */
export const generarMazoAnkiConDebounce = (errores: any[]) => {
  // Almacenar los errores recibidos
  erroresPendientes = errores;
  
  // Limpiar timer anterior
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  // Esperar 2 segundos antes de ejecutar
  debounceTimer = setTimeout(() => {
    console.log('Ejecutando generacion de mazo (debounce completado)');
    generarMazoAnki(erroresPendientes);
    debounceTimer = null;
    erroresPendientes = [];
  }, 2000);
};

export { generarMazoAnki };
