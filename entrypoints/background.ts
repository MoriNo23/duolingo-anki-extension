import { generarMazoAnkiConDebounce } from '@/util/geminiService'
import { ExtensionMessage, MessageResponse, ExtensionError, ERROR_CODES, DuolingoRespuesta } from '@/types'
import { logger } from '@/util/logger'

// Firefox MV2 compatible background script
export default defineBackground(() => {
    // Variable global para almacenar la API key
    let currentApiKey: string = '';

    // Array para almacenar respuestas interceptadas en el background
    let respuestasAcumuladas: DuolingoRespuesta[] = [];

    // Regex para detectar ejercicios de audio
    const regexAudio = /listen|speak|audio/i;

    // Cargar API key del localStorage al iniciar
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
        currentApiKey = storedApiKey;
        logger.debug('API key cargada desde localStorage');
    }

    // Interceptor de red usando webRequest
    browser.webRequest.onBeforeRequest.addListener(
        (details) => {
            if (details.method === 'POST' && details.requestBody && details.requestBody.raw) {
                try {
                    // Decodificar el cuerpo de la petición (array de bytes a string)
                    const decoder = new TextDecoder('utf-8');
                    const rawData = details.requestBody.raw[0].bytes;
                    if (!rawData) return;

                    const body = decoder.decode(rawData);
                    const data = JSON.parse(body);

                    if (Array.isArray(data)) {
                        data.forEach((item: any) => {
                            if (item.correct === false) {
                                const esAudio = regexAudio.test(item.item_type || '');

                                const respuesta: DuolingoRespuesta = {
                                    mejorSolucion: item.challenge_response_tracking_properties?.best_solution || '',
                                    respuestaUsuario: item.guess || '',
                                    frase: item.prompt || '',
                                    tipoEjercicio: item.item_type || '',
                                    idiomaOrigen: item.from_language || '',
                                    idiomaAprendizaje: item.learning_language || '',
                                    esCorrecta: item.correct,
                                    esEjercicioAudio: esAudio,
                                    timestamp: Date.now()
                                };

                                if (esAudio && respuesta.frase) {
                                    respuesta.frase = `¿Cómo se pronuncia '${respuesta.frase}'?`;
                                }

                                respuestasAcumuladas.push(respuesta);
                                logger.debug('Background: Error interceptado', { tipo: respuesta.tipoEjercicio });
                            }
                        });
                    }
                } catch (e) {
                    logger.error('Background: Error al parsear requestBody', e);
                }
            }
            return {};
        },
        { urls: ["*://excess.duolingo.com/challenge_response/batch"] },
        ["requestBody"]
    );

    browser.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
        try {
            // Manejar solicitud de API key desde el popup
            if (message.type === 'GET_API_KEY') {
                logger.debug('Enviando API key al popup');

                const response: MessageResponse = {
                    success: true,
                    apiKey: currentApiKey
                };

                sendResponse(response);
                return true;
            }

            // Manejar guardado de API key desde el popup
            if (message.type === 'SAVE_API_KEY') {
                logger.debug('Guardando API key en localStorage');

                // Validar API key básica
                if (!message.apiKey || message.apiKey.length < 20) {
                    const response: MessageResponse = {
                        success: false,
                        message: 'API key inválida. Debe tener al menos 20 caracteres.'
                    };
                    sendResponse(response);
                    return true;
                }

                // Guardar en localStorage del background
                localStorage.setItem('geminiApiKey', message.apiKey);
                currentApiKey = message.apiKey;

                logger.success('API key guardada correctamente');
                const response: MessageResponse = {
                    success: true,
                    message: 'API key guardada correctamente'
                };
                sendResponse(response);
                return true;
            }

            // Verificar si el mensaje es de tipo ERRORES_ACUMULADOS (ahora disparado por URL change)
            if (message.type === 'ERRORES_ACUMULADOS') {
                logger.data('Solicitud de procesamiento de errores recibida', {
                    cantidad: respuestasAcumuladas.length,
                    apiKeyDisponible: !!currentApiKey
                });

                if (respuestasAcumuladas.length === 0) {
                    logger.debug('No hay errores acumulados para procesar');
                    sendResponse({ success: true, message: 'No hay errores para procesar' });
                    return true;
                }

                // Validar que hay API key antes de procesar
                if (!currentApiKey) {
                    logger.error('No hay API key configurada para procesar errores');
                    const response: MessageResponse = {
                        success: false,
                        message: 'No hay API key configurada. Por favor configúrala en el popup.'
                    };
                    sendResponse(response);
                    return true;
                }

                // Generar mazo de Anki con Gemini usando los errores interceptados
                generarMazoAnkiConDebounce([...respuestasAcumuladas]);
                logger.success('Solicitud de generación de mazo enviada');

                // Limpiar errores después de procesar
                respuestasAcumuladas = [];

                // Responder al content script que se recibió correctamente
                const response: MessageResponse = {
                    success: true,
                    message: 'Procesando errores con Gemini...'
                };
                sendResponse(response);
                return true;
            }

        } catch (error) {
            logger.error('Error en background script', error);

            let errorMessage = 'Error desconocido';
            if (error instanceof ExtensionError) {
                errorMessage = error.userMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            const response: MessageResponse = {
                success: false,
                message: errorMessage
            };
            sendResponse(response);
            return true;
        }
    });
});
