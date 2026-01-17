import { DuolingoError } from '@/types'
import { logger } from '@/util/logger'

// Array que almacenara todos los errores detectados durante la sesion
let erroresAcumulados: DuolingoError[] = []

/**
 * Agrega un nuevo error al array de errores acumulados
 * @param error - Objeto con los datos del error a agregar
 */
export const agregarErrorAlArray = (error: DuolingoError) => {
    erroresAcumulados.push(error)
    logger.sensitive('Error agregado al array', { total: erroresAcumulados.length })
}

/**
 * Obtiene todos los errores acumulados
 * @returns Array con todos los errores detectados
 */
export const obtenerErroresAcumulados = (): DuolingoError[] => {
    return [...erroresAcumulados] // Devolvemos una copia para evitar mutaciones externas
}

/**
 * Limpia el array de errores acumulados
 * Se usa cuando se envian los datos o se quiere reiniciar la sesion
 */
export const limpiarArrayDeErrores = () => {
    erroresAcumulados = []
    logger.debug('Array de errores limpiado')
}

/**
 * Verifica si hay errores acumulados
 * @returns true si hay errores, false si esta vacio
 */
export const existenErrores = (): boolean => {
    return erroresAcumulados.length > 0
}
