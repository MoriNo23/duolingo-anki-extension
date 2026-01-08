import { generarMazoAnkiConDebounce } from '@/util/geminiService'

export default defineBackground(() => {
    /**
     * Listener para recibir mensajes del content script
     * Compatible con Firefox manifest V3
     */
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // Verificar si el mensaje es de tipo ERRORES_ACUMULADOS
        if (message.type === 'ERRORES_ACUMULADOS') {
            console.log('=== ERRORES ACUMULADOS RECIBIDOS DESDE DUOLINGO ===')
            console.log('Cantidad de errores:', message.data.length)
            console.log('Array completo:', message.data)
            
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
    })
});
