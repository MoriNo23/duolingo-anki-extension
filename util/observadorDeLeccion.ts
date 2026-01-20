import { MessageErroresAcumulados } from '@/types'
import { logger } from '@/util/logger'

/**
 * Avisa al background que procese las respuestas acumuladas (que ya tiene)
 */
const enviarTriggerABackground = () => {
    const message: MessageErroresAcumulados = {
        type: 'ERRORES_ACUMULADOS',
        data: [] // El background ya tiene las respuestas, este mensaje es solo un disparador
    };

    browser.runtime.sendMessage(message).then(() => {
        logger.success('Mensaje de procesamiento enviado a background');
    }).catch((error: any) => {
        logger.error('Error al enviar trigger al background', error);
    })
}

let urlAnterior = window.location.pathname

/**
 * Monitorea cambios en la URL para detectar cuando el usuario sale de /practice o /lesson
 */
const monitorearCambiosDeUrl = () => {
    const urlActual = window.location.pathname

    if ((urlAnterior.includes('/practice') || urlAnterior.includes('/lesson')) &&
        !urlActual.includes('/practice') && !urlActual.includes('/lesson')) {

        logger.debug('Usuario salió de practice/lesson, enviando trigger al background');
        enviarTriggerABackground()
    }

    urlAnterior = urlActual
}

export const observandoLesson = () => {
    // Solo necesitamos el intervalo para el cambio de URL
    setInterval(monitorearCambiosDeUrl, 1000)
}
