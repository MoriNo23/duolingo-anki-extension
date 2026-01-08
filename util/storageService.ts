/**
 * Servicio para manejo seguro de almacenamiento de la extensión
 * Utiliza browser.storage.local para datos sensibles como API keys
 */

export interface ExtensionStorage {
  geminiApiKey?: string;
  lastConfigured?: string;
}

/**
 * Guarda la API key de Gemini de forma segura
 */
export const guardarApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Validar formato de API key de Gemini
    if (!validarFormatoApiKey(apiKey)) {
      throw new Error('Formato de API key inválido');
    }

    const storageData: ExtensionStorage = {
      geminiApiKey: apiKey,
      lastConfigured: new Date().toISOString()
    };

    await browser.storage.local.set(storageData);
    console.log('✅ API key guardada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error guardando API key:', error);
    return false;
  }
};

/**
 * Obtiene la API key de Gemini del almacenamiento
 */
export const obtenerApiKey = async (): Promise<string | null> => {
  try {
    const storage = await browser.storage.local.get(['geminiApiKey']) as ExtensionStorage;
    return storage.geminiApiKey || null;
  } catch (error) {
    console.error('❌ Error obteniendo API key:', error);
    return null;
  }
};

/**
 * Verifica si hay una API key configurada
 */
export const tieneApiKeyConfigurada = async (): Promise<boolean> => {
  const apiKey = await obtenerApiKey();
  return apiKey !== null;
};

/**
 * Elimina la API key del almacenamiento
 */
export const eliminarApiKey = async (): Promise<boolean> => {
  try {
    await browser.storage.local.remove(['geminiApiKey', 'lastConfigured']);
    console.log('🗑️ API key eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error eliminando API key:', error);
    return false;
  }
};

/**
 * Valida que el formato de la API key sea correcto para Gemini
 */
const validarFormatoApiKey = (apiKey: string): boolean => {
  // Las API keys de Google Gemini empiezan con "AIzaSy" y tienen 39 caracteres
  const geminiKeyPattern = /^AIzaSy[A-Za-z0-9_-]{35}$/;
  return geminiKeyPattern.test(apiKey.trim());
};

/**
 * Obtiene información de configuración
 */
export const obtenerInfoConfiguracion = async (): Promise<{
  tieneKey: boolean;
  fechaConfiguracion?: string;
}> => {
  try {
    const storage = await browser.storage.local.get(['geminiApiKey', 'lastConfigured']) as ExtensionStorage;
    
    return {
      tieneKey: !!storage.geminiApiKey,
      fechaConfiguracion: storage.lastConfigured
    };
  } catch (error) {
    console.error('❌ Error obteniendo info de configuración:', error);
    return {
      tieneKey: false
    };
  }
};

/**
 * Limpia todo el almacenamiento (para desarrollo/testing)
 */
export const limpiarStorage = async (): Promise<void> => {
  try {
    await browser.storage.local.clear();
    console.log('🧹 Storage limpiado completamente');
  } catch (error) {
    console.error('❌ Error limpiando storage:', error);
  }
};
