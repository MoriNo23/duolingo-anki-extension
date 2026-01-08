// Interface para cada objeto de error del usuario
interface ErrorDelUsuario {
    textoPrueba: string
    textoEntrada: string
    textoSolucion: string
}

// Array que almacenara todos los errores detectados durante la sesion
let erroresAcumulados: ErrorDelUsuario[] = []

/**
 * Agrega un nuevo error al array de errores acumulados
 * @param error - Objeto con los datos del error a agregar
 */
export const agregarErrorAlArray = (error: ErrorDelUsuario) => {
    erroresAcumulados.push(error)
    console.log('Error agregado al array. Total:', erroresAcumulados.length)
}

/**
 * Obtiene todos los errores acumulados
 * @returns Array con todos los errores detectados
 */
export const obtenerErroresAcumulados = (): ErrorDelUsuario[] => {
    return [...erroresAcumulados] // Devolvemos una copia para evitar mutaciones externas
}

/**
 * Limpia el array de errores acumulados
 * Se usa cuando se envian los datos o se quiere reiniciar la sesion
 */
export const limpiarArrayDeErrores = () => {
    erroresAcumulados = []
    console.log('Array de errores limpiado')
}

/**
 * Verifica si hay errores acumulados
 * @returns true si hay errores, false si esta vacio
 */
export const existenErrores = (): boolean => {
    return erroresAcumulados.length > 0
}
