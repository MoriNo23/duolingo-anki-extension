import { generarMazoAnkiConDebounce } from '@/util/geminiService'
import { ExtensionMessage, MessageResponse, ExtensionError, ERROR_CODES } from '@/types'
import { logger } from '@/util/logger'

// Firefox MV2 compatible background script
export default defineBackground(() => {
    // Variable global para almacenar la API key
    let currentApiKey: string = '';

    // Cargar API key del localStorage al iniciar
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
        currentApiKey = storedApiKey;
        logger.debug('API key cargada desde localStorage');
    }

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
            
            // Verificar si el mensaje es de tipo ERRORES_ACUMULADOS
            if (message.type === 'ERRORES_ACUMULADOS') {
                logger.data('Errores recibidos desde Duolingo', {
                    cantidad: message.data.length,
                    apiKeyDisponible: !!currentApiKey
                });
                
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
                
                // Generar mazo de Anki con Gemini usando los errores recibidos
                generarMazoAnkiConDebounce(message.data);
                logger.success('Solicitud de generación de mazo enviada');
                
                // Responder al content script que se recibió correctamente
                const response: MessageResponse = { 
                    success: true, 
                    message: 'Errores recibidos correctamente. Procesando con Gemini...' 
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
