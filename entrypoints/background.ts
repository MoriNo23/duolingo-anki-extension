import { generarMazoAnkiConDebounce } from '@/util/geminiService'

// Firefox MV2 compatible background script
export default defineBackground(() => {
    // Variable global para almacenar la API key
    let currentApiKey: string = '';

    // Cargar API key del localStorage al iniciar
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
        currentApiKey = storedApiKey;
        console.log('API key cargada desde localStorage:', storedApiKey);
    }

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // Manejar solicitud de API key desde el popup
        if (message.type === 'GET_API_KEY') {
            console.log('=== ENVIANDO API KEY AL POPUP ===');
            console.log('API key actual:', currentApiKey);
            
            sendResponse({ 
                success: true, 
                apiKey: currentApiKey 
            });
        }
        
        // Manejar guardado de API key desde el popup
        if (message.type === 'SAVE_API_KEY') {
            console.log('=== GUARDANDO API KEY EN LOCAL STORAGE ===');
            console.log('API key recibida:', message.apiKey);
            
            // Guardar en localStorage del background
            localStorage.setItem('geminiApiKey', message.apiKey);
            currentApiKey = message.apiKey;
            
            console.log('API key guardada exitosamente');
            sendResponse({ success: true, message: 'API key guardada en background' });
        }
        
        // Verificar si el mensaje es de tipo ERRORES_ACUMULADOS
        if (message.type === 'ERRORES_ACUMULADOS') {
            console.log('=== ERRORES ACUMULADOS RECIBIDOS DESDE DUOLINGO ===')
            console.log('Cantidad de errores:', message.data.length)
            console.log('Array completo:', message.data)
            console.log('API key actual disponible:', currentApiKey ? 'SÍ' : 'NO')
            
            // Mostrar cada error individualmente para mejor visualizacion
            message.data.forEach((error: any, index: number) => {
                console.log(`Error ${index + 1}:`, {
                    textoPrueba: error.textoPrueba,
                    textoEntrada: error.textoEntrada,
                    textoSolucion: error.textoSolucion
                })
            })
            
            console.log('=== FIN DE ERRORES ACUMULADOS ===')
            
            // Generar mazo de Anki con Gemini usando los errores recibidos
            generarMazoAnkiConDebounce(message.data);
            console.log('Solicitud de generacion de mazo enviada (con debounce)');
            
            // Responder al content script que se recibió correctamente
            sendResponse({ success: true, message: 'Errores recibidos correctamente' })
        }
        
        // Importante: devolver true para indicar que la respuesta será asíncrona
        return true
    });
});
