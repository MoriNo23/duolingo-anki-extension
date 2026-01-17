// Configuración de logs para producción vs desarrollo
export const LOG_CONFIG = {
  // En producción, solo mostrar errores importantes
  production: {
    showDebugHeaders: false,
    showDataArrays: false,
    showSensitiveData: false,
    showDetailedErrors: true
  },
  // En desarrollo, mostrar todo
  development: {
    showDebugHeaders: true,
    showDataArrays: true,
    showSensitiveData: false, // Nunca mostrar datos sensibles
    showDetailedErrors: true
  }
};

// Obtener configuración actual
export const getCurrentLogConfig = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  return isDev ? LOG_CONFIG.development : LOG_CONFIG.production;
};

// Logger condicional
export const logger = {
  debug: (message: string, data?: any) => {
    const config = getCurrentLogConfig();
    if (config.showDebugHeaders) {
      console.log(`🔍 ${message}`, data);
    }
  },
  
  data: (message: string, data: any) => {
    const config = getCurrentLogConfig();
    if (config.showDataArrays) {
      console.log(`📊 ${message}`, data);
    }
  },
  
  sensitive: (message: string, data: any) => {
    const config = getCurrentLogConfig();
    if (config.showSensitiveData) {
      console.log(`🔒 ${message}`, data);
    } else {
      console.log(`🔒 ${message}: [DATOS OCULTOS]`);
    }
  },
  
  error: (message: string, error?: any) => {
    const config = getCurrentLogConfig();
    if (config.showDetailedErrors) {
      console.error(`❌ ${message}`, error);
    } else {
      console.error(`❌ ${message}`);
    }
  },
  
  success: (message: string) => {
    console.log(`✅ ${message}`);
  },
  
  warning: (message: string) => {
    console.warn(`⚠️ ${message}`);
  }
};
