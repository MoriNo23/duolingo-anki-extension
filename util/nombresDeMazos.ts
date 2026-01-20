export const NOMBRES_MAZOS: Record<string, Record<string, string>> = {
    es: {
        en: "Español → Inglés",
        fr: "Español → Francés",
        pt: "Español → Portugués",
        de: "Español → Alemán",
        it: "Español → Italiano",
        ru: "Español → Ruso",
        ja: "Español → Japonés",
        zh: "Español → Chino",
    },
    en: {
        es: "English → Spanish",
        fr: "English → French",
        de: "English → German",
        ja: "English → Japanese",
    }
}

/**
 * Obtiene el nombre del mazo basado en el par de idiomas.
 * Si no se encuentra en el mapeo, devuelve un nombre genérico.
 */
export function obtenerNombreMazo(desde: string, hacia: string): string {
    if (NOMBRES_MAZOS[desde] && NOMBRES_MAZOS[desde][hacia]) {
        return NOMBRES_MAZOS[desde][hacia];
    }

    // Caso por defecto si no existe en el mapeo
    return `DuoFlash (${desde.toUpperCase()} → ${hacia.toUpperCase()})`;
}
