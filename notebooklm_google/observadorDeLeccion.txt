import { handleclickComprobar } from '@/util/observadorDeErrores'
import { checkUrl } from '@/util/verificarUrl'
import { obtenerErroresAcumulados, limpiarArrayDeErrores, existenErrores } from '@/util/almacenamiento'

/**
 * Envía los errores acumulados al background script
 * Esta función se llama cuando el usuario sale de /practice o /lesson
 * Compatible con Firefox manifest V3 usando browser API
 */
const enviarErroresABackground = () => {
    if (existenErrores()) {
        const errores = obtenerErroresAcumulados()
        
        // Enviar mensaje al background script con el array completo
        // Usamos browser API para Firefox en lugar de chrome
        browser.runtime.sendMessage({
            type: 'ERRORES_ACUMULADOS',
            data: errores
        }).then(() => {
            console.log('Array de errores enviado a background.ts:', errores)
            // Limpiar el array despues de enviarlo
            limpiarArrayDeErrores()
        }).catch((error: any) => {
            console.error('Error al enviar errores al background:', error)
        })
    }
}

let urlAnterior = window.location.pathname

/**
 * Monitorea cambios en la URL para detectar cuando el usuario sale de /practice o /lesson
 * Se ejecuta cada segundo para verificar cambios de navegación
 */
const monitorearCambiosDeUrl = () => {
    const urlActual = window.location.pathname
    
    // Si estábamos en /practice o /lesson y ahora ya no estamos
    if ((urlAnterior.includes('/practice') || urlAnterior.includes('/lesson')) && 
        !urlActual.includes('/practice') && !urlActual.includes('/lesson')) {
        
        console.log('Usuario salió de practice/lesson, enviando errores acumulados')
        enviarErroresABackground()
    }
    
    urlAnterior = urlActual
}

export const observandoLesson = () => {
    // Monitorear cambios de URL continuamente cada segundo
    setInterval(monitorearCambiosDeUrl, 1000)
    
    if (checkUrl('/practice') || checkUrl('/lesson')) {
        const buttonNext = document.querySelector('button[data-test="player-next"]') as HTMLElement
        const estilos = window.getComputedStyle(buttonNext)
        const tieneColor = estilos.getPropertyValue('--__internal__background-color')
        if (tieneColor === 'rgb(147, 211, 51)') {
            buttonNext.addEventListener('click', handleclickComprobar)
        } else {
            buttonNext.removeEventListener('click', handleclickComprobar)
        }
    }
}
